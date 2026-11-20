// Data layer for COR HOMES.
// Production (Vercel): Supabase over HTTPS, using the publishable key plus
// SECURITY DEFINER functions guarded by COR_SERVER_SECRET (see supabase/migrations).
// Local development: SQLite file in DATA_DIR (node:sqlite), same behaviour.
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {mkdirSync} from 'node:fs';

const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || '';
const SERVER_SECRET = process.env.COR_SERVER_SECRET || '';

export class StoreError extends Error {constructor(code){super(code);this.code=code}}

function supabaseStore(){
  const headers = {apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json'};
  const rest = async (path, init={}) => {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {...init, headers: {...headers, ...(init.headers||{})}});
    if (!r.ok) throw new StoreError(r.status === 401 || r.status === 403 ? 'unauthorized' : 'db_error');
    return r.status === 204 ? null : r.json();
  };
  const rpc = (fn, args) => rest(`rpc/${fn}`, {method: 'POST', body: JSON.stringify(args)});
  const enc = encodeURIComponent;
  return {
    async publicProperties(){ return rest('public_properties?select=*&order=id.desc'); },
    async propertyBySlug(slug){ return (await rest(`public_properties?select=*&slug=eq.${enc(slug)}&limit=1`))[0] || null; },
    async propertyByToken(token){ return (await rpc('property_by_token', {p_token: token}))[0] || null; },
    async submitLead({name, email, phone, message, propertyId, privateToken}){
      return rpc('submit_lead', {p_name: name, p_email: email, p_phone: phone || '', p_message: message,
        p_property_id: propertyId ?? null, p_private_token: privateToken || null});
    },
    async adminLeads(){ return rpc('admin_leads', {p_secret: SERVER_SECRET}); },
    async adminProperties(){ return rpc('admin_properties', {p_secret: SERVER_SECRET}); },
    async adminProperty(id){ return (await this.adminProperties()).find(p => Number(p.id) === Number(id)) || null; },
    async adminSaveProperty(p){ return rpc('admin_save_property', {p_secret: SERVER_SECRET, p}); },
  };
}

async function sqliteStore(){
  const {DatabaseSync} = await import('node:sqlite');
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const dir = resolve(process.env.DATA_DIR || resolve(root, 'data'));
  mkdirSync(dir, {recursive: true});
  const db = new DatabaseSync(resolve(dir, 'cor.sqlite'));
  db.exec(`PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS properties(id INTEGER PRIMARY KEY,slug TEXT UNIQUE NOT NULL,title TEXT NOT NULL,city TEXT NOT NULL,operation TEXT NOT NULL,price REAL NOT NULL,area REAL NOT NULL,rooms INTEGER NOT NULL,description TEXT NOT NULL,images TEXT NOT NULL,status TEXT NOT NULL); CREATE TABLE IF NOT EXISTS leads(id INTEGER PRIMARY KEY,created TEXT NOT NULL,name TEXT NOT NULL,email TEXT NOT NULL,phone TEXT,message TEXT,property_id INTEGER);`);
  if (!db.prepare('PRAGMA table_info(properties)').all().some(c => c.name === 'private_token')) db.exec('ALTER TABLE properties ADD COLUMN private_token TEXT');
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS properties_private_token ON properties(private_token)');
  const pub = ({private_token, ...p}) => p;
  return {
    async publicProperties(){ return db.prepare("SELECT * FROM properties WHERE status NOT IN ('borrador','off_market') ORDER BY id DESC").all().map(pub); },
    async propertyBySlug(slug){ const p = db.prepare("SELECT * FROM properties WHERE slug=? AND status NOT IN ('borrador','off_market')").get(slug); return p ? pub(p) : null; },
    async propertyByToken(token){ return db.prepare("SELECT * FROM properties WHERE private_token=? AND status='off_market'").get(token) || null; },
    async submitLead({name, email, phone, message, propertyId, privateToken}){
      if (propertyId != null) {
        const f = db.prepare("SELECT id,status,private_token FROM properties WHERE id=? AND status!='borrador'").get(Number(propertyId));
        if (!f || (f.status === 'off_market' && (!privateToken || privateToken !== f.private_token))) return 'not_found';
      }
      db.prepare('INSERT INTO leads(created,name,email,phone,message,property_id) VALUES(?,?,?,?,?,?)').run(new Date().toISOString(), name, email, phone || '', message, propertyId ?? null);
      return 'ok';
    },
    async adminLeads(){ return db.prepare('SELECT * FROM leads ORDER BY id DESC').all(); },
    async adminProperties(){ return db.prepare('SELECT * FROM properties ORDER BY id DESC').all(); },
    async adminProperty(id){ return db.prepare('SELECT * FROM properties WHERE id=?').get(Number(id)) || null; },
    async adminSaveProperty(p){
      const values = [p.slug, p.title, p.city, p.operation, Number(p.price), Number(p.area), Number(p.rooms), p.description, p.images, p.status, p.private_token || null];
      try {
        if (p.id) {
          const r = db.prepare('UPDATE properties SET slug=?,title=?,city=?,operation=?,price=?,area=?,rooms=?,description=?,images=?,status=?,private_token=? WHERE id=?').run(...values, Number(p.id));
          if (!r.changes) return 'not_found';
        } else db.prepare('INSERT INTO properties(slug,title,city,operation,price,area,rooms,description,images,status,private_token) VALUES(?,?,?,?,?,?,?,?,?,?,?)').run(...values);
        return 'ok';
      } catch (e) { if (String(e.message).includes('UNIQUE')) return 'duplicate'; throw e; }
    },
  };
}

export const store = SUPABASE_URL && SUPABASE_KEY ? supabaseStore() : await sqliteStore();
export const storeKind = SUPABASE_URL && SUPABASE_KEY ? 'supabase' : 'sqlite';

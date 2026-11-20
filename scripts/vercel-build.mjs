// Copies the static files to /public so Vercel serves them from its CDN.
import {cpSync, rmSync, mkdirSync, existsSync} from 'node:fs';
rmSync('public', {recursive: true, force: true});
mkdirSync('public');
for (const dir of ['assets', 'css', 'js', 'fonts', 'configurador']) cpSync(`app/${dir}`, `public/${dir}`, {recursive: true});
if (existsSync('app/modelos.html')) cpSync('app/modelos.html', 'public/modelos.html');
console.log('Static files copied to public/');

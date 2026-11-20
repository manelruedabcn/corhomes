// Vercel entry point: every request that is not a static file in /public goes to the COR HOMES server.
import {handler} from '../app/server/app.mjs';
export default handler;

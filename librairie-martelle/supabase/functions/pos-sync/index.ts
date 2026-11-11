// Supabase Edge Function entry point (Deno). Logic lives in handler.ts so it can be tested outside Deno.
import { handle } from "./handler.ts";

Deno.serve((req: Request) => handle(req, (name) => Deno.env.get(name)));

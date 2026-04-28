# SRMS — React + JavaScript export

A plain JavaScript (.jsx/.js) version of the original Lovable project.
TypeScript types were stripped automatically with @babel/preset-typescript.

## Run locally
1. `npm install`
2. Copy `.env.example` to `.env` and fill in your Supabase URL + anon key.
3. `npm run dev`

## Backend (supabase/)
- `supabase/migrations/` — SQL to recreate database (tables, RLS, functions).
- `supabase/functions/ai-assistant/` — Deno edge function. Deploy with:
  `supabase functions deploy ai-assistant`
  Set the secret `LOVABLE_API_KEY` (or your own provider's key).

## Notes
- All `.tsx` → `.jsx`, `.ts` → `.js`. `interface`/`type`/annotations removed.
- Switched build plugin from `@vitejs/plugin-react-swc` to `@vitejs/plugin-react`.
- Removed `lovable-tagger` (Lovable-only dev tool).
- `src/integrations/supabase/types.js` intentionally empty (was TS-only).

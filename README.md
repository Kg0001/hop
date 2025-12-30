## HopOn

### Prereqs
- Node 18+
- Supabase project with table `rides` and columns:
	- `id` uuid (pk, default `gen_random_uuid()`)
	- `created_at` timestamptz default `now()`
	- `created_by` text (auth user id)
	- `createdByEmail` text (legacy email)
	- `fromType`/`fromValue` text
	- `toType`/`toValue` text
	- `datetime` text (or `travel_date` + `travel_time`), `totalPrice` int, `seatsTotal` int, `seatsFilled` int default 0, `genderPref` text, `phone` text, `passengerEmails` text[] default '{}'
- RLS: allow authenticated users to select/insert/update/delete their own rows (and allow select for browse). Adjust policies per your security needs.

### Environment
Create `.env.local` (gitignored):
```
NEXT_PUBLIC_SUPABASE_URL=your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
```

### Install & Run
```
npm install
npm run dev    # start
npm run build  # production build
```

### Deploy (Vercel)
- Add the two env vars in Vercel project settings.
- Deploy with `vercel` or Git connect; Next.js 16 app router is supported.
- If you see lockfile root warnings, we set `turbopack.root` in next.config.ts already.

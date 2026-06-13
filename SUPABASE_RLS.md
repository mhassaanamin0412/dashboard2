Supabase RLS notes — Configure policies for `Leads` table

Problem

- Your app hit RLS when inserting: "new row violates row-level security policy for table \"Leads\"" and 401 Unauthorized. This means the anon role (or the key used) is not permitted by the table policies.

Options (pick one)

1) Quick dev: allow public SELECT and INSERT (NOT recommended for production)

-- Enable RLS if not already
ALTER TABLE public."Leads" ENABLE ROW LEVEL SECURITY;

-- Allow anonymous reads
CREATE POLICY "anon_select" ON public."Leads"
  FOR SELECT USING (true);

-- Allow anonymous inserts
CREATE POLICY "anon_insert" ON public."Leads"
  FOR INSERT WITH CHECK (true);

2) Preferred: allow authenticated users only

-- Allow only logged-in users to read
CREATE POLICY "auth_select" ON public."Leads"
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow only logged-in users to insert
CREATE POLICY "auth_insert" ON public."Leads"
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

Notes: you can tighten INSERT with a WITH CHECK that ensures a row.owner column equals auth.uid(), if your schema has ownership.

3) Service-side writes (recommended for write operations from backend)

- Do NOT expose the service role key in the client. Use a server endpoint (or Supabase Edge Function) that authenticates and uses the service role key to perform inserts, which avoids granting anon insert rights.

Testing the REST API from terminal (use your anon key)

curl example for SELECT:

curl "https://<project>.supabase.co/rest/v1/Leads?select=*" \
  -H "apikey: <ANON_KEY>" \
  -H "Authorization: Bearer <ANON_KEY>"

curl example for INSERT:

curl -X POST "https://<project>.supabase.co/rest/v1/Leads" \
  -H "apikey: <ANON_KEY>" \
  -H "Authorization: Bearer <ANON_KEY>" \
  -H "Content-Type: application/json" \
  --data '[{"name":"Test","email":"t@example.com","profession":"Dev","status":"New Lead"}]'

What to check in Supabase Dashboard

- Project → Table Editor → open `Leads` and confirm exact table name (case-sensitive). If the table is actually `leads`, set VITE_SUPABASE_TABLE=leads.
- Auth → Settings → copy the anon/public key and ensure `.env` `VITE_SUPABASE_ANON_KEY` matches it.
- Database → Policies → ensure the policies above exist and match the behavior you want.

Security reminders

- Avoid `anon` insert in production. If you must accept public submissions, restrict columns and add validation.
- Prefer authenticated users for writes or proxy writes through a trusted backend using the service role key.

If you want, I can:
- Add these SQL snippets into a repository file (done), and optionally run a small script to call the REST API to confirm (I cannot run requests to your Supabase project without your keys). 
- Generate an example Edge Function or simple serverless endpoint to perform safe inserts using a service role key.


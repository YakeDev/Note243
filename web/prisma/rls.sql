-- Activate Row Level Security on all app tables.
alter table public."User" enable row level security;
alter table public."Category" enable row level security;
alter table public."Business" enable row level security;
alter table public."Review" enable row level security;
alter table public."Favorite" enable row level security;
alter table public."Claim" enable row level security;
alter table public."Report" enable row level security;

-- Force RLS so even table owners must respect policies (keeps it strict on Supabase).
alter table public."User" force row level security;
alter table public."Category" force row level security;
alter table public."Business" force row level security;
alter table public."Review" force row level security;
alter table public."Favorite" force row level security;
alter table public."Claim" force row level security;
alter table public."Report" force row level security;

-- Minimal policies: allow only the service role (Supabase) to read/write everything.
-- Adjust or add end-user policies once auth is configured.
drop policy if exists "service-role-all-user" on public."User";
create policy "service-role-all-user" on public."User"
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "service-role-all-category" on public."Category";
create policy "service-role-all-category" on public."Category"
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "service-role-all-business" on public."Business";
create policy "service-role-all-business" on public."Business"
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "service-role-all-review" on public."Review";
create policy "service-role-all-review" on public."Review"
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "service-role-all-favorite" on public."Favorite";
create policy "service-role-all-favorite" on public."Favorite"
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "service-role-all-claim" on public."Claim";
create policy "service-role-all-claim" on public."Claim"
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "service-role-all-report" on public."Report";
create policy "service-role-all-report" on public."Report"
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

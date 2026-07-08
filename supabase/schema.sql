Failed to run sql query: ERROR:  42703: column "user_id" does not exist
CONTEXT:  SQL statement "create policy "auth_own_customers" on public.customers
    for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())"
PL/pgSQL function inline_code_block line 2 at SQL statement
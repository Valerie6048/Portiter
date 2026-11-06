-- Configure these secrets in Supabase Vault before scheduling this job:
--   blog_publisher_url: https://<project-ref>.supabase.co/functions/v1/blog-publisher
--   blog_cron_secret: the same random value as the BLOG_CRON_SECRET Edge Function secret
-- The Vercel Deploy Hook URL and Supabase service-role key stay in Edge Function secrets only.

select cron.unschedule(jobid)
from cron.job
where jobname = 'publish-blog-and-dispatch-deployments';

select cron.schedule(
  'publish-blog-and-dispatch-deployments',
  '* * * * *',
  $$
    select net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'blog_publisher_url'),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-blog-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'blog_cron_secret')
      ),
      body := '{}'::jsonb
    );
  $$
);

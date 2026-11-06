create extension if not exists pgcrypto with schema extensions;

create table public.blog_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_blog_admin()
returns boolean language sql stable security definer
set search_path = public, auth, pg_temp
as $$ select exists (select 1 from public.blog_admins where user_id = auth.uid()); $$;

create or replace function public.can_manage_blog()
returns boolean language sql stable security definer
set search_path = public, auth, pg_temp
as $$ select public.is_blog_admin(); $$;

create or replace function public.blog_post_is_public(p_post_id uuid)
returns boolean language plpgsql stable security definer
set search_path = public, pg_temp
as $$
begin
  return exists (
    select 1 from public.blog_posts p
    join public.blog_translations t on t.post_id = p.id
    where p.id = p_post_id and p.archived_at is null and p.trashed_at is null
      and t.status = 'published' and t.published_at <= now()
  );
end;
$$;

create or replace function public.blog_translation_is_public(p_translation_id uuid)
returns boolean language plpgsql stable security definer
set search_path = public, pg_temp
as $$
begin
  return exists (
    select 1 from public.blog_translations t
    join public.blog_posts p on p.id = t.post_id
    where t.id = p_translation_id and p.archived_at is null and p.trashed_at is null
      and t.status = 'published' and t.published_at <= now()
  );
end;
$$;

revoke all on function public.is_blog_admin() from public;
revoke all on function public.can_manage_blog() from public;
revoke all on function public.blog_post_is_public(uuid) from public;
revoke all on function public.blog_translation_is_public(uuid) from public;
grant execute on function public.is_blog_admin() to authenticated;
grant execute on function public.can_manage_blog() to anon, authenticated, service_role;
grant execute on function public.blog_post_is_public(uuid) to anon, authenticated;
grant execute on function public.blog_translation_is_public(uuid) to anon, authenticated;

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  is_featured boolean not null default false,
  archived_at timestamptz,
  archived_statuses jsonb,
  trashed_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (archived_at is null or trashed_at is null)
);

create table public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_id text not null,
  slug_en text not null unique,
  slug_id text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.blog_tags (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_id text not null,
  slug_en text not null unique,
  slug_id text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.blog_media_assets (
  id uuid primary key default gen_random_uuid(),
  object_path text not null unique,
  public_url text not null,
  filename text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  alt_text text not null default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.blog_translations (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  locale text not null check (locale in ('en', 'id')),
  slug text not null,
  title text not null default '',
  excerpt text not null default '',
  content_json jsonb not null default '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb,
  cover_media_id uuid references public.blog_media_assets(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'published')),
  scheduled_at timestamptz,
  published_at timestamptz,
  slug_locked_at timestamptz,
  meta_title text not null default '',
  meta_description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (post_id, locale),
  check (status <> 'scheduled' or scheduled_at is not null),
  check (char_length(slug) between 1 and 140),
  check (char_length(title) <= 180),
  check (char_length(excerpt) <= 360),
  check (char_length(meta_description) <= 320)
);

create unique index blog_translations_locale_slug_unique
  on public.blog_translations (locale, lower(slug));
create index blog_translations_public_index
  on public.blog_translations (locale, published_at desc) where status = 'published';
create index blog_translations_schedule_index
  on public.blog_translations (scheduled_at) where status = 'scheduled';

create table public.blog_post_categories (
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  category_id uuid not null references public.blog_categories(id) on delete cascade,
  primary key (post_id, category_id)
);
create table public.blog_post_tags (
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  tag_id uuid not null references public.blog_tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

create table public.blog_post_revisions (
  id uuid primary key default gen_random_uuid(),
  translation_id uuid not null references public.blog_translations(id) on delete cascade,
  snapshot jsonb not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index blog_post_revisions_translation_index
  on public.blog_post_revisions (translation_id, created_at desc);

create table public.blog_deploy_jobs (
  id uuid primary key default gen_random_uuid(),
  reason text not null,
  status text not null default 'queued' check (status in ('queued', 'processing', 'triggered', 'failed')),
  error_message text,
  created_at timestamptz not null default now(),
  processed_at timestamptz,
  claimed_at timestamptz
);
create index blog_deploy_jobs_queue_index on public.blog_deploy_jobs (created_at) where status = 'queued';

create or replace function public.set_blog_updated_at()
returns trigger language plpgsql set search_path = public, pg_temp
as $$ begin new.updated_at := now(); return new; end; $$;
create trigger blog_posts_updated_at before update on public.blog_posts for each row execute function public.set_blog_updated_at();
create trigger blog_categories_updated_at before update on public.blog_categories for each row execute function public.set_blog_updated_at();
create trigger blog_tags_updated_at before update on public.blog_tags for each row execute function public.set_blog_updated_at();
create trigger blog_translations_updated_at before update on public.blog_translations for each row execute function public.set_blog_updated_at();

create or replace function public.prevent_published_slug_change()
returns trigger language plpgsql set search_path = public, pg_temp
as $$
begin
  if old.slug_locked_at is not null and lower(old.slug) <> lower(new.slug) then
    raise exception 'Published slugs are locked to preserve their permanent URL.';
  end if;
  if old.slug_locked_at is null and new.status = 'published' and new.published_at is not null then
    new.slug_locked_at := coalesce(new.slug_locked_at, now());
  end if;
  return new;
end;
$$;
create trigger blog_translations_slug_lock before update on public.blog_translations
  for each row execute function public.prevent_published_slug_change();

create or replace function public.enqueue_blog_deploy(p_reason text)
returns void language sql security definer set search_path = public, pg_temp
as $$ insert into public.blog_deploy_jobs (reason) values (p_reason); $$;
revoke all on function public.enqueue_blog_deploy(text) from public, anon, authenticated;

create or replace function public.handle_blog_translation_deploy()
returns trigger language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    if new.status = 'published' and new.published_at <= now() then
      perform public.enqueue_blog_deploy('translation-published');
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    if old.status = 'published' and old.published_at <= now() then
      perform public.enqueue_blog_deploy('translation-deleted');
    end if;
    return old;
  end if;

  if old.status = 'published' or new.status = 'published' then
    perform public.enqueue_blog_deploy('published-translation-changed');
  end if;
  return new;
end;
$$;
create trigger blog_translation_deploy after insert or update or delete on public.blog_translations
  for each row execute function public.handle_blog_translation_deploy();

create or replace function public.handle_blog_post_visibility_deploy()
returns trigger language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  if old.archived_at is distinct from new.archived_at or old.trashed_at is distinct from new.trashed_at
    or old.is_featured is distinct from new.is_featured then
    if exists (select 1 from public.blog_translations t where t.post_id = new.id
      and t.status = 'published' and t.published_at <= now()) then
      perform public.enqueue_blog_deploy('post-visibility-changed');
    end if;
  end if;
  return new;
end;
$$;
create trigger blog_post_visibility_deploy after update on public.blog_posts
  for each row execute function public.handle_blog_post_visibility_deploy();

create or replace function public.handle_blog_media_deploy()
returns trigger language plpgsql security definer set search_path = public, pg_temp
as $$
declare asset_uuid uuid;
begin
  if tg_op = 'DELETE' then asset_uuid := old.id; else asset_uuid := new.id; end if;
  if exists (
    select 1 from public.blog_translations t
    join public.blog_posts p on p.id = t.post_id
    where p.archived_at is null and p.trashed_at is null
      and t.status = 'published' and t.published_at <= now()
      and (t.cover_media_id = asset_uuid or t.content_json::text like '%' || asset_uuid::text || '%')
  ) then
    perform public.enqueue_blog_deploy('published-media-changed');
  end if;
  if tg_op = 'DELETE' then return old; else return new; end if;
end;
$$;
create trigger blog_media_deploy after update or delete on public.blog_media_assets
  for each row execute function public.handle_blog_media_deploy();

create or replace function public.handle_blog_taxonomy_deploy()
returns trigger language plpgsql security definer set search_path = public, pg_temp
as $$
declare post_uuid uuid;
begin
  if tg_op = 'DELETE' then post_uuid := old.post_id; else post_uuid := new.post_id; end if;
  if public.blog_post_is_public(post_uuid) then perform public.enqueue_blog_deploy('published-taxonomy-changed'); end if;
  if tg_op = 'DELETE' then return old; else return new; end if;
end;
$$;
create trigger blog_post_categories_deploy after insert or update or delete on public.blog_post_categories
  for each row execute function public.handle_blog_taxonomy_deploy();
create trigger blog_post_tags_deploy after insert or update or delete on public.blog_post_tags
  for each row execute function public.handle_blog_taxonomy_deploy();

create or replace function public.handle_blog_term_deploy()
returns trigger language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  if tg_table_name = 'blog_categories' and exists (
    select 1 from public.blog_post_categories c where c.category_id = new.id and public.blog_post_is_public(c.post_id)
  ) then
    perform public.enqueue_blog_deploy('published-category-changed');
  elsif tg_table_name = 'blog_tags' and exists (
    select 1 from public.blog_post_tags t where t.tag_id = new.id and public.blog_post_is_public(t.post_id)
  ) then
    perform public.enqueue_blog_deploy('published-tag-changed');
  end if;
  return new;
end;
$$;
create trigger blog_categories_deploy after update on public.blog_categories
  for each row execute function public.handle_blog_term_deploy();
create trigger blog_tags_deploy after update on public.blog_tags
  for each row execute function public.handle_blog_term_deploy();

create or replace function public.publish_due_blog_translations()
returns integer language plpgsql security definer set search_path = public, pg_temp
as $$
declare published_count integer;
begin
  with due as (
    select t.id from public.blog_translations t
    join public.blog_posts p on p.id = t.post_id
    where t.status = 'scheduled' and t.scheduled_at <= now()
      and p.archived_at is null and p.trashed_at is null
    order by t.scheduled_at for update of t skip locked
  ), updated as (
    update public.blog_translations t set status = 'published', published_at = t.scheduled_at
    from due where t.id = due.id returning t.id
  ) select count(*) into published_count from updated;
  return published_count;
end;
$$;

create or replace function public.claim_blog_deploy_jobs()
returns setof public.blog_deploy_jobs language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  update public.blog_deploy_jobs set status = 'queued', claimed_at = null
  where status = 'processing' and claimed_at < now() - interval '10 minutes';
  return query
    with claimable as (
      select id from public.blog_deploy_jobs where status = 'queued'
      order by created_at for update skip locked
    ), claimed as (
      update public.blog_deploy_jobs j set status = 'processing', claimed_at = now()
      from claimable c where j.id = c.id returning j.*
    ) select * from claimed;
end;
$$;
revoke all on function public.publish_due_blog_translations() from public, anon, authenticated;
revoke all on function public.claim_blog_deploy_jobs() from public, anon, authenticated;
grant execute on function public.publish_due_blog_translations() to service_role;
grant execute on function public.claim_blog_deploy_jobs() to service_role;
grant select, update on public.blog_deploy_jobs to service_role;

alter table public.blog_admins enable row level security;
alter table public.blog_posts enable row level security;
alter table public.blog_translations enable row level security;
alter table public.blog_categories enable row level security;
alter table public.blog_tags enable row level security;
alter table public.blog_post_categories enable row level security;
alter table public.blog_post_tags enable row level security;
alter table public.blog_media_assets enable row level security;
alter table public.blog_post_revisions enable row level security;
alter table public.blog_deploy_jobs enable row level security;

create policy blog_admins_read_self on public.blog_admins for select to authenticated using (user_id = auth.uid());
create policy blog_admins_manage on public.blog_admins for all to authenticated
  using (public.can_manage_blog()) with check (public.can_manage_blog());

create policy blog_posts_read_public_or_admin on public.blog_posts for select to anon, authenticated
  using (public.can_manage_blog() or (archived_at is null and trashed_at is null and public.blog_post_is_public(id)));
create policy blog_posts_admin_insert on public.blog_posts for insert to authenticated
  with check (public.can_manage_blog());
create policy blog_posts_admin_update on public.blog_posts for update to authenticated
  using (public.can_manage_blog()) with check (public.can_manage_blog());
create policy blog_posts_admin_delete_trash_only on public.blog_posts for delete to authenticated
  using (public.can_manage_blog() and trashed_at is not null);
create policy blog_translations_read_public_or_admin on public.blog_translations for select to anon, authenticated
  using (public.can_manage_blog() or public.blog_translation_is_public(id));
create policy blog_translations_admin_write on public.blog_translations for all to authenticated
  using (public.can_manage_blog()) with check (public.can_manage_blog());

create policy blog_categories_read on public.blog_categories for select to anon, authenticated using (true);
create policy blog_categories_admin_write on public.blog_categories for all to authenticated
  using (public.can_manage_blog()) with check (public.can_manage_blog());
create policy blog_tags_read on public.blog_tags for select to anon, authenticated using (true);
create policy blog_tags_admin_write on public.blog_tags for all to authenticated
  using (public.can_manage_blog()) with check (public.can_manage_blog());
create policy blog_post_categories_read on public.blog_post_categories for select to anon, authenticated
  using (public.can_manage_blog() or public.blog_post_is_public(post_id));
create policy blog_post_categories_admin_write on public.blog_post_categories for all to authenticated
  using (public.can_manage_blog()) with check (public.can_manage_blog());
create policy blog_post_tags_read on public.blog_post_tags for select to anon, authenticated
  using (public.can_manage_blog() or public.blog_post_is_public(post_id));
create policy blog_post_tags_admin_write on public.blog_post_tags for all to authenticated
  using (public.can_manage_blog()) with check (public.can_manage_blog());

create policy blog_media_assets_read on public.blog_media_assets for select to anon, authenticated using (true);
create policy blog_media_assets_admin_write on public.blog_media_assets for all to authenticated
  using (public.can_manage_blog()) with check (public.can_manage_blog());
create policy blog_post_revisions_admin_only on public.blog_post_revisions for all to authenticated
  using (public.can_manage_blog()) with check (public.can_manage_blog());
create policy blog_deploy_jobs_admin_read on public.blog_deploy_jobs for select to authenticated
  using (public.can_manage_blog());
create policy blog_deploy_jobs_admin_update on public.blog_deploy_jobs for update to authenticated
  using (public.can_manage_blog()) with check (public.can_manage_blog());

grant usage on schema public to anon, authenticated;
grant select on public.blog_posts, public.blog_translations, public.blog_categories, public.blog_tags,
  public.blog_post_categories, public.blog_post_tags, public.blog_media_assets to anon, authenticated;
grant select, insert, update, delete on public.blog_admins, public.blog_posts, public.blog_translations,
  public.blog_categories, public.blog_tags, public.blog_post_categories, public.blog_post_tags,
  public.blog_media_assets, public.blog_post_revisions to authenticated;
grant select on public.blog_deploy_jobs to authenticated;
grant update on public.blog_deploy_jobs to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('blog-media', 'blog-media', true, 10485760, array['image/jpeg','image/png','image/webp','image/gif','image/avif'])
on conflict (id) do update set public = true, file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif','image/avif'];
create policy blog_media_public_read on storage.objects for select to anon, authenticated using (bucket_id = 'blog-media');
create policy blog_media_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'blog-media' and public.can_manage_blog());
create policy blog_media_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'blog-media' and public.can_manage_blog())
  with check (bucket_id = 'blog-media' and public.can_manage_blog());
create policy blog_media_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'blog-media' and public.can_manage_blog());

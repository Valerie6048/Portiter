-- Run once after 202611030001_blog_cms.sql on a project that still has blog_* tables.
-- ALTER TABLE preserves rows, foreign keys, RLS policies, grants, triggers, and indexes.
begin;

alter table public.blog_post_categories rename to portiter_blog_post_categories;
alter table public.blog_post_revisions rename to portiter_blog_post_revisions;
alter table public.blog_media_assets rename to portiter_blog_media_assets;
alter table public.blog_translations rename to portiter_blog_translations;
alter table public.blog_deploy_jobs rename to portiter_blog_deploy_jobs;
alter table public.blog_categories rename to portiter_blog_categories;
alter table public.blog_post_tags rename to portiter_blog_post_tags;
alter table public.blog_admins rename to portiter_blog_admins;
alter table public.blog_posts rename to portiter_blog_posts;
alter table public.blog_tags rename to portiter_blog_tags;

create or replace function public.is_blog_admin()
returns boolean language sql stable security definer
set search_path = public, auth, pg_temp
as $$ select exists (select 1 from public.portiter_blog_admins where user_id = auth.uid()); $$;

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
    select 1 from public.portiter_blog_posts p
    join public.portiter_blog_translations t on t.post_id = p.id
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
    select 1 from public.portiter_blog_translations t
    join public.portiter_blog_posts p on p.id = t.post_id
    where t.id = p_translation_id and p.archived_at is null and p.trashed_at is null
      and t.status = 'published' and t.published_at <= now()
  );
end;
$$;

create or replace function public.set_blog_updated_at()
returns trigger language plpgsql set search_path = public, pg_temp
as $$ begin new.updated_at := now(); return new; end; $$;

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

create or replace function public.enqueue_blog_deploy(p_reason text)
returns void language sql security definer set search_path = public, pg_temp
as $$ insert into public.portiter_blog_deploy_jobs (reason) values (p_reason); $$;

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

create or replace function public.handle_blog_post_visibility_deploy()
returns trigger language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  if old.archived_at is distinct from new.archived_at or old.trashed_at is distinct from new.trashed_at
    or old.is_featured is distinct from new.is_featured then
    if exists (select 1 from public.portiter_blog_translations t where t.post_id = new.id
      and t.status = 'published' and t.published_at <= now()) then
      perform public.enqueue_blog_deploy('post-visibility-changed');
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.handle_blog_media_deploy()
returns trigger language plpgsql security definer set search_path = public, pg_temp
as $$
declare asset_uuid uuid;
begin
  if tg_op = 'DELETE' then asset_uuid := old.id; else asset_uuid := new.id; end if;
  if exists (
    select 1 from public.portiter_blog_translations t
    join public.portiter_blog_posts p on p.id = t.post_id
    where p.archived_at is null and p.trashed_at is null
      and t.status = 'published' and t.published_at <= now()
      and (t.cover_media_id = asset_uuid or t.content_json::text like '%' || asset_uuid::text || '%')
  ) then
    perform public.enqueue_blog_deploy('published-media-changed');
  end if;
  if tg_op = 'DELETE' then return old; else return new; end if;
end;
$$;

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

create or replace function public.handle_blog_term_deploy()
returns trigger language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  if tg_table_name = 'portiter_blog_categories' and exists (
    select 1 from public.portiter_blog_post_categories c where c.category_id = new.id and public.blog_post_is_public(c.post_id)
  ) then
    perform public.enqueue_blog_deploy('published-category-changed');
  elsif tg_table_name = 'portiter_blog_tags' and exists (
    select 1 from public.portiter_blog_post_tags t where t.tag_id = new.id and public.blog_post_is_public(t.post_id)
  ) then
    perform public.enqueue_blog_deploy('published-tag-changed');
  end if;
  return new;
end;
$$;

create or replace function public.publish_due_blog_translations()
returns integer language plpgsql security definer set search_path = public, pg_temp
as $$
declare published_count integer;
begin
  with due as (
    select t.id from public.portiter_blog_translations t
    join public.portiter_blog_posts p on p.id = t.post_id
    where t.status = 'scheduled' and t.scheduled_at <= now()
      and p.archived_at is null and p.trashed_at is null
    order by t.scheduled_at for update of t skip locked
  ), updated as (
    update public.portiter_blog_translations t set status = 'published', published_at = t.scheduled_at
    from due where t.id = due.id returning t.id
  ) select count(*) into published_count from updated;
  return published_count;
end;
$$;

create or replace function public.claim_blog_deploy_jobs()
returns setof public.portiter_blog_deploy_jobs language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  update public.portiter_blog_deploy_jobs set status = 'queued', claimed_at = null
  where status = 'processing' and claimed_at < now() - interval '10 minutes';
  return query
    with claimable as (
      select id from public.portiter_blog_deploy_jobs where status = 'queued'
      order by created_at for update skip locked
    ), claimed as (
      update public.portiter_blog_deploy_jobs j set status = 'processing', claimed_at = now()
      from claimable c where j.id = c.id returning j.*
    ) select * from claimed;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgrelid = 'public.portiter_blog_categories'::regclass and tgname = 'blog_categories_deploy') then
    execute 'create trigger blog_categories_deploy after update on public.portiter_blog_categories for each row execute function public.handle_blog_term_deploy()';
  end if;
  if not exists (select 1 from pg_trigger where tgrelid = 'public.portiter_blog_tags'::regclass and tgname = 'blog_tags_deploy') then
    execute 'create trigger blog_tags_deploy after update on public.portiter_blog_tags for each row execute function public.handle_blog_term_deploy()';
  end if;
end;
$$;

revoke all on function public.publish_due_blog_translations() from public, anon, authenticated;
revoke all on function public.claim_blog_deploy_jobs() from public, anon, authenticated;
grant execute on function public.publish_due_blog_translations() to service_role;
grant execute on function public.claim_blog_deploy_jobs() to service_role;
grant select, update on public.portiter_blog_deploy_jobs to service_role;
notify pgrst, 'reload schema';
commit;

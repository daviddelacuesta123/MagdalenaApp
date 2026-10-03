-- =====================================================================
-- Magdalena · Esquema de base de datos para Supabase
-- Pegar completo en: Supabase → SQL Editor → New query → Run
-- Se puede ejecutar varias veces sin romper nada (es idempotente).
-- =====================================================================
--
-- Notas de diseño (pensadas para el uso sin internet y la sincronización):
-- * Los "id" los genera la app en el teléfono (UUID), así un proyecto creado
--   sin conexión conserva su id al subirse.
-- * "updated_at" lo fija la app con la hora del cambio. Al sincronizar,
--   gana el cambio con la fecha más reciente.
-- * "deleted_at" marca borrados (borrado suave) para que las eliminaciones
--   hechas sin conexión también lleguen al servidor y a otros dispositivos.
-- * Todas las tablas tienen user_id y Row Level Security: cada persona
--   solo puede leer y modificar sus propias filas.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. PERFILES
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  name        text not null default '' check (char_length(name) <= 80),
  avatar_path text,                                   -- ruta dentro del bucket "avatars"
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is 'Datos públicos del perfil de cada persona (1 fila por usuario).';


-- ---------------------------------------------------------------------
-- 2. PROYECTOS
-- ---------------------------------------------------------------------
create table if not exists public.projects (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name                     text not null check (char_length(name) between 1 and 120),
  notes                    text not null default '',
  photo_path               text,                      -- ruta dentro del bucket "project-photos"
  status                   text not null default 'en_curso' check (status in ('en_curso', 'terminado')),
  archived                 boolean not null default false,
  current_row              integer not null default 1 check (current_row >= 1),
  current_stitches         integer not null default 0 check (current_stitches >= 0),
  time_adjustment_seconds  integer not null default 0, -- corrección manual del tiempo tejido (+/-)
  finished_at              timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  deleted_at               timestamptz
);

create index if not exists projects_user_updated_idx on public.projects (user_id, updated_at);

comment on table public.projects is 'Proyectos de crochet con su progreso actual.';


-- ---------------------------------------------------------------------
-- 3. VUELTAS DEL PATRÓN
-- ---------------------------------------------------------------------
create table if not exists public.pattern_rows (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  project_id   uuid not null references public.projects (id) on delete cascade,
  row_number   integer not null check (row_number >= 1),  -- número de vuelta (V1, V2…)
  instruction  text not null default '',                  -- texto tal como lo pegó la persona
  stitch_count integer check (stitch_count >= 0),         -- puntos detectados o escritos a mano (null = desconocido)
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create index if not exists pattern_rows_project_idx on public.pattern_rows (project_id, row_number);
create index if not exists pattern_rows_user_updated_idx on public.pattern_rows (user_id, updated_at);

comment on table public.pattern_rows is 'Instrucciones del patrón, una fila por vuelta.';


-- ---------------------------------------------------------------------
-- 4. EVENTOS (historial de cada acción, base de las estadísticas)
-- ---------------------------------------------------------------------
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  project_id  uuid not null references public.projects (id) on delete cascade,
  type        text not null check (type in ('punto', 'vuelta', 'inicio', 'pausa', 'fin')),
  delta       integer not null default 0,     -- punto/vuelta: +1 o -1 (o -N al reiniciar la vuelta)
  occurred_at timestamptz not null,           -- hora real de la acción en el teléfono
  created_at  timestamptz not null default now()
);

create index if not exists events_project_time_idx on public.events (project_id, occurred_at);
create index if not exists events_user_created_idx on public.events (user_id, created_at);

comment on table public.events is 'Historial de acciones (solo se agregan filas, no se editan).';


-- ---------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY: cada persona solo ve y toca lo suyo
-- ---------------------------------------------------------------------
alter table public.profiles     enable row level security;
alter table public.projects     enable row level security;
alter table public.pattern_rows enable row level security;
alter table public.events       enable row level security;

-- Perfiles: leer y actualizar el propio (lo crea el trigger del punto 6)
drop policy if exists "perfil: leer el propio" on public.profiles;
create policy "perfil: leer el propio" on public.profiles
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "perfil: actualizar el propio" on public.profiles;
create policy "perfil: actualizar el propio" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Proyectos y vueltas del patrón: todas las operaciones sobre filas propias
drop policy if exists "proyectos: solo los propios" on public.projects;
create policy "proyectos: solo los propios" on public.projects
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "patron: solo el propio" on public.pattern_rows;
create policy "patron: solo el propio" on public.pattern_rows
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    -- además, el proyecto debe ser de la misma persona
    and exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid()))
  );

-- Eventos: leer, agregar y borrar los propios (no se editan)
drop policy if exists "eventos: leer los propios" on public.events;
create policy "eventos: leer los propios" on public.events
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "eventos: agregar los propios" on public.events;
create policy "eventos: agregar los propios" on public.events
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid()))
  );

drop policy if exists "eventos: borrar los propios" on public.events;
create policy "eventos: borrar los propios" on public.events
  for delete to authenticated using ((select auth.uid()) = user_id);


-- ---------------------------------------------------------------------
-- 6. TRIGGER: crear el perfil automáticamente al registrarse
-- ---------------------------------------------------------------------
create or replace function public.crear_perfil_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, name)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'name', ''), 80))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

-- Solo la usa el trigger: nadie debe poder llamarla desde la API
revoke execute on function public.crear_perfil_nuevo_usuario() from public, anon, authenticated;

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil_nuevo_usuario();

-- Crea el perfil de las personas que ya se habían registrado antes de este script
insert into public.profiles (user_id, name)
select u.id, left(coalesce(u.raw_user_meta_data ->> 'name', ''), 80)
from auth.users u
on conflict (user_id) do nothing;


-- ---------------------------------------------------------------------
-- 7. STORAGE: buckets privados para fotos
--    Las rutas siguen el formato "<user_id>/<archivo>", y las políticas
--    comprueban que la primera carpeta sea el id de quien hace la petición.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars',        'avatars',        false, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('project-photos', 'project-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "fotos: ver las propias" on storage.objects;
create policy "fotos: ver las propias" on storage.objects
  for select to authenticated
  using (
    bucket_id in ('avatars', 'project-photos')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "fotos: subir las propias" on storage.objects;
create policy "fotos: subir las propias" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('avatars', 'project-photos')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "fotos: reemplazar las propias" on storage.objects;
create policy "fotos: reemplazar las propias" on storage.objects
  for update to authenticated
  using (
    bucket_id in ('avatars', 'project-photos')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id in ('avatars', 'project-photos')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "fotos: borrar las propias" on storage.objects;
create policy "fotos: borrar las propias" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('avatars', 'project-photos')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

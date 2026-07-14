-- Kara Weaves Digital Pipeline MVP schema blueprint
-- Apply through Supabase SQL editor or migrations after enabling pgcrypto/gen_random_uuid.

create type user_role as enum ('admin', 'designer', 'production_manager', 'artisan_viewer');
create type design_status as enum ('draft', 'validation_failed', 'validated', 'approved', 'archived');
create type order_status as enum ('draft', 'assigned', 'in_production', 'quality_check', 'ready', 'delivered', 'cancelled');
create type production_stage as enum (
  'design_approved', 'assigned_to_cooperative', 'warping', 'on_loom', 'weaving',
  'finishing', 'quality_check', 'ready', 'delivered'
);
create type validation_severity as enum ('info', 'warning', 'error');
create type asset_type as enum ('mockup_svg', 'mockup_png', 'instruction_card', 'cooperative_image', 'design_reference');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role user_role not null default 'designer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table cooperatives (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  story text,
  contact_name text,
  contact_email text,
  hero_image_path text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table looms (
  id uuid primary key default gen_random_uuid(),
  cooperative_id uuid references cooperatives(id) on delete set null,
  loom_code text not null unique,
  loom_name text,
  loom_type text,
  max_width_in numeric(8,2) not null,
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table loom_specs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  loom_id uuid references looms(id) on delete set null,
  max_weave_width_in numeric(8,2) not null,
  reed_density_dpi numeric(8,2),
  default_ppi numeric(8,2) not null,
  min_ppi numeric(8,2),
  max_ppi numeric(8,2),
  takeup_pct numeric(6,4) not null default 0,
  shrinkage_pct numeric(6,4) not null default 0,
  beat_tension_notes text,
  compatibility_notes text,
  config jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  default_width_in numeric(8,2),
  default_length_in numeric(8,2),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table colors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  hex_code text not null,
  yarn_code text,
  material text,
  supplier text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint colors_hex_code_format check (hex_code ~ '^#[0-9A-Fa-f]{6}$')
);

create table designs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  product_id uuid references products(id) on delete set null,
  designer_id uuid references profiles(id) on delete set null,
  loom_spec_id uuid references loom_specs(id) on delete restrict,
  width_in numeric(8,2) not null,
  finished_length_in numeric(8,2) not null,
  target_ppi numeric(8,2) not null,
  estimated_on_loom_length_in numeric(8,2),
  total_picks integer,
  status design_status not null default 'draft',
  notes text,
  approved_at timestamptz,
  approved_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint positive_design_dimensions check (width_in > 0 and finished_length_in > 0 and target_ppi > 0)
);

create table design_segments (
  id uuid primary key default gen_random_uuid(),
  design_id uuid not null references designs(id) on delete cascade,
  sort_order integer not null,
  segment_type text not null default 'stripe',
  color_id uuid not null references colors(id) on delete restrict,
  length_in numeric(8,2) not null,
  calculated_picks integer,
  repeat_count integer not null default 1,
  notes text,
  created_at timestamptz not null default now(),
  constraint positive_segment_length check (length_in > 0),
  constraint unique_design_segment_order unique (design_id, sort_order)
);

create table validation_results (
  id uuid primary key default gen_random_uuid(),
  design_id uuid not null references designs(id) on delete cascade,
  run_version integer not null default 1,
  rule_code text not null,
  severity validation_severity not null,
  message text not null,
  measured_value numeric(12,4),
  expected_min numeric(12,4),
  expected_max numeric(12,4),
  created_at timestamptz not null default now()
);

create table technical_recipes (
  id uuid primary key default gen_random_uuid(),
  design_id uuid not null references designs(id) on delete cascade,
  version integer not null default 1,
  total_picks integer not null,
  pick_sequence jsonb not null,
  setup_summary jsonb not null default '{}'::jsonb,
  artisan_notes text,
  is_current boolean not null default true,
  generated_by uuid references profiles(id) on delete set null,
  generated_at timestamptz not null default now(),
  constraint unique_design_recipe_version unique (design_id, version)
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique,
  design_id uuid not null references designs(id) on delete restrict,
  cooperative_id uuid references cooperatives(id) on delete set null,
  loom_id uuid references looms(id) on delete set null,
  buyer_display_name text,
  buyer_public_token uuid not null default gen_random_uuid(),
  status order_status not null default 'draft',
  due_date date,
  internal_notes text,
  buyer_message text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint unique_buyer_public_token unique (buyer_public_token)
);

create table production_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  stage production_stage not null,
  status_label text not null,
  notes text,
  visible_to_buyer boolean not null default true,
  occurred_at timestamptz not null default now(),
  created_by uuid references profiles(id) on delete set null
);

create table assets (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  asset_type asset_type not null,
  storage_bucket text not null,
  storage_path text not null,
  mime_type text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_designs_status on designs(status);
create index idx_design_segments_design_order on design_segments(design_id, sort_order);
create index idx_validation_results_design on validation_results(design_id, created_at desc);
create index idx_recipes_design_current on technical_recipes(design_id, is_current);
create index idx_orders_public_token on orders(buyer_public_token);
create index idx_production_events_order_time on production_events(order_id, occurred_at desc);
create index idx_assets_entity on assets(entity_type, entity_id);

create view buyer_order_view as
select
  o.buyer_public_token,
  o.order_code,
  o.status,
  o.buyer_message,
  o.published_at,
  d.title as design_title,
  d.width_in,
  d.finished_length_in,
  p.name as product_name,
  c.name as cooperative_name,
  c.location as cooperative_location,
  c.story as cooperative_story,
  a.storage_bucket as mockup_bucket,
  a.storage_path as mockup_path
from orders o
join designs d on d.id = o.design_id
left join products p on p.id = d.product_id
left join cooperatives c on c.id = o.cooperative_id
left join assets a
  on a.entity_type = 'design'
  and a.entity_id = d.id
  and a.asset_type in ('mockup_svg', 'mockup_png')
where o.published_at is not null
  and d.status = 'approved';

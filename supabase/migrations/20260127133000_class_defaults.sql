-- Add class defaults/settings for MVP

alter table classes
  add column if not exists pack_id text not null default 'core',
  add column if not exists default_mode text not null default 'learn',
  add column if not exists product_sets text[] not null default array['products_3_4']::text[],
  add column if not exists session_length integer not null default 25,
  add column if not exists division_enabled boolean not null default true,
  add column if not exists square_mode text not null default 'default';

-- Basic constraints to keep defaults valid
alter table classes
  add constraint if not exists classes_default_mode_check
    check (default_mode in ('learn', 'test')),
  add constraint if not exists classes_session_length_check
    check (session_length in (10, 25, 40)),
  add constraint if not exists classes_square_mode_check
    check (square_mode in ('default', 'single')),
  add constraint if not exists classes_product_sets_check
    check (product_sets <@ array['products_3_4','products_2','squares','cardinals','all_products']::text[]);

-- フリーランス新法対応 契約書チェッカー DBスキーマ
-- Supabase SQL Editorでこのファイルを実行してください

-- ================================================================
-- プロフィールテーブル（auth.usersを拡張）
-- ================================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  created_at timestamptz default now()
);

-- ================================================================
-- サブスクリプション・決済管理テーブル
-- ================================================================
create table public.user_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,

  -- Stripe 識別子
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_price_id text,

  -- プランと状態
  -- 'single'   : 単発診断プラン（500円）、credits_remaining で管理
  -- 'corporate': 法人向け定額プラン（月額2,980円）、period_end で管理
  plan_type text check (plan_type in ('single', 'corporate')),

  -- 'active'   : 利用可能
  -- 'cancelled': サブスクリプションキャンセル済み（period_end まで利用可）
  -- 'expired'  : 期限切れ
  -- 'pending'  : 決済処理中
  status text not null default 'pending' check (status in ('active', 'cancelled', 'expired', 'pending')),

  -- 単発プラン残クレジット（1クレジット = 1回の診断）
  credits_remaining int not null default 0,

  -- 法人プランのサブスクリプション期間
  current_period_end timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ================================================================
-- 決済履歴テーブル（Webhook イベントの記録）
-- ================================================================
create table public.payment_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  stripe_event_id text unique not null,
  stripe_session_id text,
  event_type text not null,
  plan_type text,
  amount_jpy int,
  status text not null,
  processed_at timestamptz default now()
);

-- ================================================================
-- 契約書分析テーブル
-- ================================================================
create table public.contract_analyses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  file_name text not null,
  file_type text not null check (file_type in ('pdf', 'image', 'text')),
  extracted_text text,
  analysis_result jsonb not null,
  risk_level text not null check (risk_level in ('low', 'medium', 'high', 'critical')),
  -- 診断時に消費したプランの記録
  plan_type_used text check (plan_type_used in ('single', 'corporate')),
  created_at timestamptz default now()
);

-- ================================================================
-- インデックス
-- ================================================================
create index idx_contract_analyses_user_id on public.contract_analyses(user_id);
create index idx_contract_analyses_created_at on public.contract_analyses(created_at desc);
create index idx_contract_analyses_risk_level on public.contract_analyses(risk_level);
create index idx_user_subscriptions_stripe_customer on public.user_subscriptions(stripe_customer_id);
create index idx_user_subscriptions_stripe_subscription on public.user_subscriptions(stripe_subscription_id);
create index idx_payment_events_stripe_event on public.payment_events(stripe_event_id);

-- ================================================================
-- RLS（Row Level Security）有効化
-- ================================================================
alter table public.profiles enable row level security;
alter table public.contract_analyses enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.payment_events enable row level security;

-- プロフィールポリシー
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- サブスクリプションポリシー（読み取りのみ、書き込みはService Role経由）
create policy "Users can view own subscription"
  on public.user_subscriptions for select
  using (auth.uid() = user_id);

-- 契約書分析ポリシー
create policy "Users can view own analyses"
  on public.contract_analyses for select
  using (auth.uid() = user_id);

create policy "Users can insert own analyses"
  on public.contract_analyses for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own analyses"
  on public.contract_analyses for delete
  using (auth.uid() = user_id);

-- 決済イベントポリシー（読み取りのみ）
create policy "Users can view own payment events"
  on public.payment_events for select
  using (auth.uid() = user_id);

-- ================================================================
-- 新規ユーザー登録トリガー
-- ================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ================================================================
-- updated_at 自動更新トリガー
-- ================================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_subscription_updated
  before update on public.user_subscriptions
  for each row execute procedure public.handle_updated_at();

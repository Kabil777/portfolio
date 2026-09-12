CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS posts (
  slug text PRIMARY KEY CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  published_source text,
  draft_source text,
  title text,
  description text,
  post_date date,
  category text,
  tags text[] NOT NULL DEFAULT '{}',
  cover text,
  reading_time integer CHECK (reading_time IS NULL OR reading_time > 0),
  published_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (published_source IS NULL OR (
    title IS NOT NULL AND description IS NOT NULL AND post_date IS NOT NULL AND
    category IS NOT NULL AND reading_time IS NOT NULL
  ))
);

CREATE INDEX IF NOT EXISTS posts_public_order_idx
  ON posts (post_date DESC)
  WHERE published_at IS NOT NULL AND archived_at IS NULL;

CREATE TABLE IF NOT EXISTS post_daily_stats (
  post_slug text NOT NULL REFERENCES posts(slug) ON UPDATE CASCADE ON DELETE CASCADE,
  day date NOT NULL,
  views integer NOT NULL DEFAULT 0 CHECK (views >= 0),
  unique_visitors integer NOT NULL DEFAULT 0 CHECK (unique_visitors >= 0),
  PRIMARY KEY (post_slug, day)
);

CREATE TABLE IF NOT EXISTS post_daily_visitors (
  post_slug text NOT NULL REFERENCES posts(slug) ON UPDATE CASCADE ON DELETE CASCADE,
  day date NOT NULL,
  visitor_hash text NOT NULL,
  PRIMARY KEY (post_slug, day, visitor_hash)
);

CREATE TABLE IF NOT EXISTS post_referrer_daily (
  post_slug text NOT NULL REFERENCES posts(slug) ON UPDATE CASCADE ON DELETE CASCADE,
  day date NOT NULL,
  referrer_host text NOT NULL,
  views integer NOT NULL DEFAULT 0 CHECK (views >= 0),
  PRIMARY KEY (post_slug, day, referrer_host)
);

CREATE TABLE IF NOT EXISTS likes (
  post_slug text NOT NULL REFERENCES posts(slug) ON UPDATE CASCADE ON DELETE CASCADE,
  reader_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (post_slug, reader_hash)
);

CREATE TABLE IF NOT EXISTS admin_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_id text NOT NULL,
  challenge_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_challenges_expiry_idx ON admin_challenges (expires_at);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash text PRIMARY KEY,
  key_id text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_sessions_expiry_idx ON admin_sessions (expires_at);

CREATE TABLE IF NOT EXISTS subscribers (
  email text PRIMARY KEY,
  status text NOT NULL CHECK (status IN ('pending', 'active', 'unsubscribed')),
  confirmation_token_hash text UNIQUE,
  confirmation_expires_at timestamptz,
  consented_at timestamptz,
  unsubscribed_at timestamptz,
  resend_contact_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_slug text NOT NULL UNIQUE REFERENCES posts(slug) ON UPDATE CASCADE ON DELETE RESTRICT,
  resend_broadcast_id text UNIQUE,
  status text NOT NULL CHECK (status IN ('draft', 'scheduled', 'sent', 'failed')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  delivered integer NOT NULL DEFAULT 0 CHECK (delivered >= 0),
  bounced integer NOT NULL DEFAULT 0 CHECK (bounced >= 0),
  complained integer NOT NULL DEFAULT 0 CHECK (complained >= 0),
  unsubscribed integer NOT NULL DEFAULT 0 CHECK (unsubscribed >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS webhook_events (
  id text PRIMARY KEY,
  event_type text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rate_limits (
  actor_hash text NOT NULL,
  action text NOT NULL,
  bucket_start timestamptz NOT NULL,
  request_count integer NOT NULL DEFAULT 1 CHECK (request_count > 0),
  PRIMARY KEY (actor_hash, action, bucket_start)
);

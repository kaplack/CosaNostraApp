CREATE TABLE IF NOT EXISTS menu_items (
  id integer PRIMARY KEY,
  name text NOT NULL,
  unit_price numeric(10, 2) NOT NULL CHECK (unit_price >= 0),
  ingredients text[] NOT NULL DEFAULT '{}',
  sold_out boolean NOT NULL DEFAULT false,
  image_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id text PRIMARY KEY,
  status text NOT NULL DEFAULT 'preparing',
  customer text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  position text,
  priority boolean NOT NULL DEFAULT false,
  estimated_delivery timestamptz NOT NULL,
  cart jsonb NOT NULL,
  order_price numeric(10, 2) NOT NULL CHECK (order_price >= 0),
  priority_price numeric(10, 2) NOT NULL DEFAULT 0 CHECK (priority_price >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);

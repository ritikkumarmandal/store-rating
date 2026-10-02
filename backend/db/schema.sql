DROP TABLE IF EXISTS ratings, stores, users CASCADE;
DROP TYPE IF EXISTS user_role;
CREATE TYPE user_role AS ENUM ('ADMIN', 'USER', 'OWNER');

CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(60)  NOT NULL CHECK (char_length(name) >= 20),
  email      VARCHAR(255) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  address    VARCHAR(400),
  role       user_role NOT NULL DEFAULT 'USER',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE stores (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  address    VARCHAR(400) NOT NULL,
  owner_id   INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ratings (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  store_id   INT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  rating     SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, store_id)
);

CREATE INDEX idx_ratings_store ON ratings(store_id);
CREATE INDEX idx_stores_owner  ON stores(owner_id);
CREATE INDEX idx_users_role    ON users(role);

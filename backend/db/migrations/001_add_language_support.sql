USE wayo_db;

-- 1. Languages available in the app.
CREATE TABLE IF NOT EXISTS languages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  native_name VARCHAR(50) NOT NULL,
  font_family VARCHAR(100) NOT NULL DEFAULT 'Inter',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2. Per-key, per-language interface text. font_family intentionally lives
-- only on `languages` (one value per language), not repeated on every row here.
CREATE TABLE IF NOT EXISTS translations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  translation_key VARCHAR(150) NOT NULL,
  language_code VARCHAR(10) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_translation (
    translation_key,
    language_code
  ),
  CONSTRAINT fk_translation_language
    FOREIGN KEY (language_code)
    REFERENCES languages(code)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3. Seed the two supported languages. Both use Inter — the font stays the
-- same for English and Ukrainian, only the text and the `lang` attribute change.
INSERT IGNORE INTO languages (code, name, native_name, font_family) VALUES
('en', 'English', 'English', 'Inter'),
('uk', 'Ukrainian', 'Українська', 'Inter');

-- 4. The demo user's preferred language. Existing rows default to 'en', so
-- current behaviour (English) is unchanged for anyone already in the table.
-- NOTE: MySQL 8.0 does not support "ADD COLUMN IF NOT EXISTS" (confirmed
-- against this project's server) — this migration is meant to run once.
ALTER TABLE users
  ADD COLUMN preferred_language VARCHAR(10) NOT NULL DEFAULT 'en';

-- 5. Foreign key to languages(code). Safe to add: 'en' already exists from
-- step 3 above, and every existing `users` row already defaults to it.
ALTER TABLE users
  ADD CONSTRAINT fk_users_preferred_language
    FOREIGN KEY (preferred_language) REFERENCES languages(code);

-- Runs against whichever database the connection already has selected
-- (DATABASE_URL / MYSQLDATABASE / DB_NAME) — e.g. `wayo_db` locally or
-- `railway` on Railway. Select that schema before running this file
-- instead of relying on a hardcoded USE statement here.

-- Quest title / short description (quests.description) / full overview
-- (quests.overview) / location label.
CREATE TABLE IF NOT EXISTS quest_translations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quest_id VARCHAR(100) NOT NULL,
  language_code VARCHAR(10) NOT NULL,
  title VARCHAR(150) NOT NULL,
  location VARCHAR(150),
  short_description TEXT,
  full_description TEXT,
  UNIQUE KEY unique_quest_language (quest_id, language_code),
  CONSTRAINT fk_quest_translations_quest
    FOREIGN KEY (quest_id) REFERENCES quests(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_quest_translations_language
    FOREIGN KEY (language_code) REFERENCES languages(code)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Route stop title / description (quest_stops has no separate "instruction"
-- column in the base schema, so this table doesn't invent one either).
CREATE TABLE IF NOT EXISTS quest_stop_translations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quest_stop_id INT NOT NULL,
  language_code VARCHAR(10) NOT NULL,
  title VARCHAR(150),
  description TEXT,
  UNIQUE KEY unique_stop_language (quest_stop_id, language_code),
  CONSTRAINT fk_quest_stop_translations_stop
    FOREIGN KEY (quest_stop_id) REFERENCES quest_stops(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_quest_stop_translations_language
    FOREIGN KEY (language_code) REFERENCES languages(code)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Accessibility note title / body. "content" here maps to the base table's
-- "text" column (renamed for clarity — same meaning).
CREATE TABLE IF NOT EXISTS accessibility_note_translations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  accessibility_note_id INT NOT NULL,
  language_code VARCHAR(10) NOT NULL,
  title VARCHAR(150),
  content TEXT,
  UNIQUE KEY unique_note_language (accessibility_note_id, language_code),
  CONSTRAINT fk_accessibility_note_translations_note
    FOREIGN KEY (accessibility_note_id) REFERENCES quest_accessibility_notes(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_accessibility_note_translations_language
    FOREIGN KEY (language_code) REFERENCES languages(code)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Badge title ("name") / description. Column kept as "title" (not "name")
-- to match the base badges table's actual column name.
CREATE TABLE IF NOT EXISTS badge_translations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  badge_id INT NOT NULL,
  language_code VARCHAR(10) NOT NULL,
  title VARCHAR(150),
  description TEXT,
  UNIQUE KEY unique_badge_language (badge_id, language_code),
  CONSTRAINT fk_badge_translations_badge
    FOREIGN KEY (badge_id) REFERENCES badges(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_badge_translations_language
    FOREIGN KEY (language_code) REFERENCES languages(code)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE DATABASE IF NOT EXISTS wayo_db;
USE wayo_db;

-- Drop tables in the correct order
DROP TABLE IF EXISTS reported_issues;
DROP TABLE IF EXISTS completed_quests;
DROP TABLE IF EXISTS saved_quests;
DROP TABLE IF EXISTS badges;
DROP TABLE IF EXISTS quest_accessibility_notes;
DROP TABLE IF EXISTS quest_stops;
DROP TABLE IF EXISTS quests;
DROP TABLE IF EXISTS users;

-- 1. Users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Quests
CREATE TABLE quests (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    location VARCHAR(150),
    description TEXT,
    overview TEXT,
    difficulty VARCHAR(50),
    duration_min INT,
    distance_km DECIMAL(4,1),
    accessibility VARCHAR(150),
    image_url VARCHAR(255),
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    is_daily BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Quest stops
CREATE TABLE quest_stops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quest_id VARCHAR(100) NOT NULL,
    stop_order INT NOT NULL,
    stop_type VARCHAR(50),
    label VARCHAR(100),
    title VARCHAR(150),
    description TEXT,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    CONSTRAINT fk_stops_quest
        FOREIGN KEY (quest_id) REFERENCES quests(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Accessibility notes
CREATE TABLE quest_accessibility_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quest_id VARCHAR(100) NOT NULL,
    title VARCHAR(150),
    text TEXT,
    CONSTRAINT fk_notes_quest
        FOREIGN KEY (quest_id) REFERENCES quests(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Badges
CREATE TABLE badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quest_id VARCHAR(100) NOT NULL,
    title VARCHAR(150),
    description TEXT,
    image_url VARCHAR(255),
    CONSTRAINT fk_badges_quest
        FOREIGN KEY (quest_id) REFERENCES quests(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Saved quests
CREATE TABLE saved_quests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    quest_id VARCHAR(100) NOT NULL,
    saved_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_saved_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_saved_quest
        FOREIGN KEY (quest_id) REFERENCES quests(id)
        ON DELETE CASCADE,
    CONSTRAINT uq_saved_user_quest UNIQUE (user_id, quest_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Completed quests
CREATE TABLE completed_quests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    quest_id VARCHAR(100) NOT NULL,
    completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_completed_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_completed_quest
        FOREIGN KEY (quest_id) REFERENCES quests(id)
        ON DELETE CASCADE,
    CONSTRAINT uq_completed_user_quest UNIQUE (user_id, quest_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Reported issues (Report a Problem screen)
CREATE TABLE reported_issues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    quest_id VARCHAR(100) NULL,
    issue_type VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'new',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reports_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_reports_quest
        FOREIGN KEY (quest_id) REFERENCES quests(id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
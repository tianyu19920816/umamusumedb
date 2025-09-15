-- UmamusumeDB Schema for Cloudflare D1

-- Characters table
CREATE TABLE IF NOT EXISTS characters (
    id TEXT PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_jp TEXT NOT NULL,
    rarity INTEGER DEFAULT 3,
    attributes JSON DEFAULT '{}',
    skills JSON DEFAULT '[]',
    growth_rates JSON DEFAULT '{}',
    aptitudes JSON DEFAULT '{}',
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Support cards table
CREATE TABLE IF NOT EXISTS support_cards (
    id TEXT PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_jp TEXT NOT NULL,
    type TEXT CHECK(type IN ('speed', 'stamina', 'power', 'guts', 'wisdom', 'friend')),
    rarity TEXT CHECK(rarity IN ('R', 'SR', 'SSR')),
    effects JSON DEFAULT '{}',
    skills JSON DEFAULT '[]',
    events JSON DEFAULT '[]',
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tier lists table
CREATE TABLE IF NOT EXISTS tier_lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_type TEXT CHECK(item_type IN ('character', 'support_card')),
    item_id TEXT NOT NULL,
    category TEXT NOT NULL,
    tier TEXT CHECK(tier IN ('SS', 'S', 'A', 'B', 'C')),
    votes INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_jp TEXT NOT NULL,
    description_en TEXT,
    description_jp TEXT,
    effect TEXT,
    activation TEXT,
    icon_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Teams table (for user-created teams)
CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_name TEXT NOT NULL,
    description TEXT,
    members JSON NOT NULL,
    strategy TEXT,
    author TEXT,
    likes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Events/News table
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_en TEXT,
    title_jp TEXT,
    description_en TEXT,
    description_jp TEXT,
    start_date DATETIME,
    end_date DATETIME,
    type TEXT,
    rewards JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_characters_name ON characters(name_en, name_jp);
CREATE INDEX IF NOT EXISTS idx_support_cards_type ON support_cards(type, rarity);
CREATE INDEX IF NOT EXISTS idx_tier_lists_category ON tier_lists(category, tier);
CREATE INDEX IF NOT EXISTS idx_events_dates ON events(start_date, end_date);
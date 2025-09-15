-- Initial seed data for UmamusumeDB

-- Insert sample characters
INSERT OR IGNORE INTO characters (id, name_en, name_jp, rarity, attributes, skills, image_url) VALUES
('special_week', 'Special Week', 'スペシャルウィーク', 3, 
 '{"speed": 100, "stamina": 90, "power": 85, "guts": 95, "wisdom": 80}',
 '["Eating Machine", "Victory Equation", "Sprint Turbo"]',
 '/images/characters/special_week.png'),

('silence_suzuka', 'Silence Suzuka', 'サイレンススズカ', 3,
 '{"speed": 115, "stamina": 85, "power": 75, "guts": 70, "wisdom": 85}',
 '["Escape Artist", "Concentration", "Leading Pride"]',
 '/images/characters/silence_suzuka.png'),

('tokai_teio', 'Tokai Teio', 'トウカイテイオー', 3,
 '{"speed": 95, "stamina": 95, "power": 90, "guts": 85, "wisdom": 85}',
 '["Miracle Run", "Victory Aura", "Emperor Step"]',
 '/images/characters/tokai_teio.png'),

('mejiro_mcqueen', 'Mejiro McQueen', 'メジロマックイーン', 3,
 '{"speed": 85, "stamina": 110, "power": 95, "guts": 80, "wisdom": 80}',
 '["Long Distance Runner", "Pride of Mejiro", "Stamina Eater"]',
 '/images/characters/mejiro_mcqueen.png'),

('gold_ship', 'Gold Ship', 'ゴールドシップ', 3,
 '{"speed": 90, "stamina": 100, "power": 100, "guts": 75, "wisdom": 85}',
 '["Unpredictable", "Golden Spirit", "Wild Intuition"]',
 '/images/characters/gold_ship.png');

-- Insert sample support cards
INSERT OR IGNORE INTO support_cards (id, name_en, name_jp, type, rarity, effects, skills) VALUES
('kitasan_black_ssr', 'Kitasan Black', 'キタサンブラック', 'speed', 'SSR',
 '{"speed_bonus": 10, "friendship_bonus": 35, "training_bonus": 15}',
 '["Arc Maestro", "Speedster", "Concentration"]'),

('super_creek_ssr', 'Super Creek', 'スーパークリーク', 'stamina', 'SSR',
 '{"stamina_bonus": 10, "friendship_bonus": 35, "motivation_bonus": 5}',
 '["Circle Recovery", "Pacer", "Stamina Keep"]'),

('tazuna_ssr', 'Sakura Bakushin O', 'サクラバクシンオー', 'speed', 'SSR',
 '{"speed_bonus": 8, "power_bonus": 4, "skill_point_bonus": 35}',
 '["Sprint Gear", "Quick Start", "Speed Burst"]'),

('fine_motion_sr', 'Fine Motion', 'ファインモーション', 'wisdom', 'SR',
 '{"wisdom_bonus": 8, "skill_point_bonus": 25}',
 '["Practice Partner", "Wisdom Eye", "Analysis"]'),

('vodka_sr', 'Vodka', 'ウオッカ', 'power', 'SR',
 '{"power_bonus": 8, "stamina_bonus": 4}',
 '["Power Charge", "Strong Heart", "Rivalry"]');

-- Insert sample tier list data
INSERT OR IGNORE INTO tier_lists (item_type, item_id, category, tier, votes) VALUES
('character', 'special_week', 'overall', 'S', 150),
('character', 'silence_suzuka', 'overall', 'SS', 200),
('character', 'tokai_teio', 'overall', 'S', 140),
('character', 'mejiro_mcqueen', 'overall', 'A', 100),
('character', 'gold_ship', 'overall', 'S', 160),

('character', 'silence_suzuka', 'speed', 'SS', 180),
('character', 'mejiro_mcqueen', 'stamina', 'SS', 170),
('character', 'gold_ship', 'power', 'S', 145),

('support_card', 'kitasan_black_ssr', 'overall', 'SS', 250),
('support_card', 'super_creek_ssr', 'overall', 'S', 180),
('support_card', 'tazuna_ssr', 'overall', 'S', 175),
('support_card', 'fine_motion_sr', 'overall', 'A', 90),
('support_card', 'vodka_sr', 'overall', 'B', 60);

-- Insert sample skills
INSERT OR IGNORE INTO skills (id, name_en, name_jp, description_en, effect, activation) VALUES
('escape_artist', 'Escape Artist', '逃げのコツ', 'Improves escape strategy effectiveness', 'Speed +40 when leading', 'passive'),
('arc_maestro', 'Arc Maestro', 'アーク Maestro', 'Master of the final corner', 'Acceleration +100% on final corner', 'conditional'),
('concentration', 'Concentration', '集中力', 'Maintains focus during race', 'Reduces debuff chance by 30%', 'passive'),
('sprint_turbo', 'Sprint Turbo', 'スプリントターボ', 'Explosive speed in short races', 'Speed +60 in races under 1400m', 'conditional'),
('stamina_keep', 'Stamina Keep', 'スタミナキープ', 'Preserves stamina efficiently', 'Stamina consumption -15%', 'passive');

-- Insert sample event
INSERT OR IGNORE INTO events (title_en, title_jp, description_en, type, start_date, end_date, rewards) VALUES
('Grand Masters Challenge', 'グランドマスターズ', 'Test your skills in the ultimate challenge!', 'ranking',
 '2025-02-01 00:00:00', '2025-02-14 23:59:59',
 '{"jewels": 1500, "support_tickets": 5, "special_title": "Grand Master"}');
USE wayo_db;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE completed_quests;
TRUNCATE TABLE saved_quests;
TRUNCATE TABLE badges;
TRUNCATE TABLE quest_accessibility_notes;
TRUNCATE TABLE quest_stops;
TRUNCATE TABLE quest_tags;
TRUNCATE TABLE tags;
TRUNCATE TABLE quests;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Demo user
INSERT INTO users (id, name, email) VALUES
(1, 'Demo User', 'demo@wayoapp.com');

-- 2. Quests
INSERT INTO quests
(id, title, location, description, overview, difficulty, duration_min, distance_km, accessibility, image_url, latitude, longitude, is_daily)
VALUES
(
    'greenwich-stroll',
    'Greenwich Stroll',
    'Greenwich, London',
    'A relaxing riverside walk through Greenwich maritime history and royal parkland.',
    'Follow the river path from Cutty Sark DLR station into the heart of maritime Greenwich. Pass the Cutty Sark ship, the Old Royal Naval College, and the Queen''s House before walking into Greenwich Park for city views.',
    'Easy',
    90,
    4.0,
    'Step-free',
    '/assets/greenwich-stroll.svg',
    51.4826000,
    -0.0097000,
    TRUE
),
(
    'kyoto-garden-escape',
    'Kyoto Garden Escape',
    'Holland Park, Kensington',
    'A peaceful Japanese-inspired garden hidden inside Holland Park.',
    'Step away from busy Kensington into Holland Park''s Kyoto Garden. Walk past koi ponds, waterfalls, quiet paths, and garden viewpoints.',
    'Easy',
    45,
    1.8,
    'Step-free',
    '/assets/kyoto-garden-escape.svg',
    51.5033000,
    -0.2038000,
    FALSE
),
(
    'thames-time-trail',
    'Thames Time Trail',
    'Tower Bridge / London Bridge',
    'A brisk walk through centuries of London history along the Thames.',
    'Trace the river from Tower Bridge to London Bridge, passing HMS Belfast, City Hall, and Borough Market. This quest mixes famous landmarks with riverside walking.',
    'Tough',
    100,
    4.5,
    'Mostly flat',
    '/assets/thames-time-trail.svg',
    51.5055000,
    -0.0754000,
    FALSE
),
(
    'quiet-corners-southbank',
    'Quiet Corners of Southbank',
    'Southbank, London',
    'Discover calmer pockets behind Southbank''s busy riverfront.',
    'This short route explores Gabriel''s Wharf, Bernie Spain Gardens, and quieter paths near the OXO Tower. It is ideal for a quick city break.',
    'Easy',
    35,
    1.8,
    'Step-free',
    '/assets/quiet-corners-southbank.svg',
    51.5055000,
    -0.1160000,
    FALSE
),
(
    'green-escape-city',
    'Green Escape in the City',
    'St James''s Park',
    'A short leafy retreat through one of London''s most scenic royal parks.',
    'Walk through St James''s Park, passing the lake, Duck Island Cottage, and classic views towards Buckingham Palace.',
    'Easy',
    30,
    1.5,
    'Step-free',
    '/assets/green-escape-city.svg',
    51.5033000,
    -0.1329000,
    FALSE
);

-- 3. Quest stops

INSERT INTO quest_stops 
(quest_id, stop_order, stop_type, label, title, description, latitude, longitude) 
VALUES
('greenwich-stroll', 1, 'start', 'Start', 'Cutty Sark DLR Station', 'Begin the quest near Cutty Sark DLR station.', 51.4826000, -0.0097000),
('greenwich-stroll', 2, 'checkpoint', 'Stop 2', 'Cutty Sark', 'See the historic tea clipper ship.', 51.4828000, -0.0092000),
('greenwich-stroll', 3, 'checkpoint', 'Stop 3', 'Old Royal Naval College', 'Walk through one of Greenwich''s most iconic historic sites.', 51.4835000, -0.0090000),
('greenwich-stroll', 4, 'checkpoint', 'Stop 4', 'Queen''s House', 'Pass the elegant Queen''s House and surrounding gardens.', 51.4816000, -0.0093000),
('greenwich-stroll', 5, 'checkpoint', 'Stop 5', 'Greenwich Park', 'Continue into the park for a greener part of the route.', 51.4791000, -0.0059000),
('greenwich-stroll', 6, 'viewpoint', 'Finish', 'Greenwich Park Viewpoint', 'Finish with a viewpoint over London.', 51.4769000, -0.0005000);

INSERT INTO quest_stops 
(quest_id, stop_order, stop_type, label, title, description, latitude, longitude) 
VALUES
('kyoto-garden-escape', 1, 'start', 'Start', 'Holland Park Entrance', 'Enter Holland Park from Abbotsbury Road.', 51.5049000, -0.2020000),
('kyoto-garden-escape', 2, 'checkpoint', 'Stop 2', 'Kyoto Garden', 'Explore the koi pond, waterfall, and Japanese-inspired garden.', 51.5033000, -0.2038000),
('kyoto-garden-escape', 3, 'checkpoint', 'Stop 3', 'Dutch Garden', 'Walk through another peaceful garden area nearby.', 51.5044000, -0.2005000),
('kyoto-garden-escape', 4, 'viewpoint', 'Finish', 'Holland House', 'Finish near Holland House and the surrounding park space.', 51.5043000, -0.2028000);

INSERT INTO quest_stops 
(quest_id, stop_order, stop_type, label, title, description, latitude, longitude) 
VALUES
('thames-time-trail', 1, 'start', 'Start', 'Tower Bridge', 'Begin at one of London''s most recognisable landmarks.', 51.5055000, -0.0754000),
('thames-time-trail', 2, 'checkpoint', 'Stop 2', 'Potters Fields Park', 'Walk through a riverside green space near the bridge.', 51.5044000, -0.0772000),
('thames-time-trail', 3, 'checkpoint', 'Stop 3', 'HMS Belfast', 'Pass the historic museum ship on the Thames.', 51.5064000, -0.0787000),
('thames-time-trail', 4, 'checkpoint', 'Stop 4', 'Borough Market', 'Explore the area around one of London''s famous food markets.', 51.5055000, -0.0910000),
('thames-time-trail', 5, 'viewpoint', 'Finish', 'London Bridge', 'Finish the trail near London Bridge.', 51.5079000, -0.0877000);

INSERT INTO quest_stops 
(quest_id, stop_order, stop_type, label, title, description, latitude, longitude) 
VALUES
('quiet-corners-southbank', 1, 'start', 'Start', 'Southbank Centre', 'Start near the main Southbank riverside area.', 51.5055000, -0.1160000),
('quiet-corners-southbank', 2, 'checkpoint', 'Stop 2', 'Gabriel''s Wharf', 'Find independent shops and a quieter riverside corner.', 51.5069000, -0.1085000),
('quiet-corners-southbank', 3, 'checkpoint', 'Stop 3', 'Bernie Spain Gardens', 'Take a calm break in a small green space.', 51.5062000, -0.1140000),
('quiet-corners-southbank', 4, 'viewpoint', 'Finish', 'OXO Tower Wharf', 'Finish near the OXO Tower riverside area.', 51.5069000, -0.1101000);

INSERT INTO quest_stops 
(quest_id, stop_order, stop_type, label, title, description, latitude, longitude) 
VALUES
('green-escape-city', 1, 'start', 'Start', 'Horse Guards Entrance', 'Enter St James''s Park from the Horse Guards side.', 51.5033000, -0.1329000),
('green-escape-city', 2, 'checkpoint', 'Stop 2', 'The Lake Bridge Viewpoint', 'Pause for one of the best views across the park lake.', 51.5029000, -0.1347000),
('green-escape-city', 3, 'checkpoint', 'Stop 3', 'Duck Island Cottage', 'Pass the cottage and nearby lake area.', 51.5030000, -0.1341000),
('green-escape-city', 4, 'viewpoint', 'Finish', 'Buckingham Palace View', 'Finish with a view towards Buckingham Palace.', 51.5014000, -0.1419000);

-- 4. Accessibility notes

INSERT INTO quest_accessibility_notes (quest_id, title, text) VALUES
('greenwich-stroll', 'Step-free access', 'Route uses mostly paved paths and gentle slopes.'),
('greenwich-stroll', 'Rest stops nearby', 'Benches are available in Greenwich Park and along the riverside path.'),
('greenwich-stroll', 'Public transport nearby', 'Cutty Sark DLR station is close to the start of the route.');

INSERT INTO quest_accessibility_notes (quest_id, title, text) VALUES
('kyoto-garden-escape', 'Step-free access', 'Paths around Holland Park and Kyoto Garden are mostly flat and well maintained.'),
('kyoto-garden-escape', 'Rest stops nearby', 'Benches are available around the garden and pond.'),
('kyoto-garden-escape', 'Public transport nearby', 'Holland Park and Kensington High Street stations are nearby.');

INSERT INTO quest_accessibility_notes (quest_id, title, text) VALUES
('thames-time-trail', 'Mostly flat', 'The route follows mostly flat riverside paths.'),
('thames-time-trail', 'Busy areas', 'Tower Bridge and London Bridge can be crowded, especially at weekends.'),
('thames-time-trail', 'Public transport nearby', 'Tower Hill and London Bridge stations are close to the route.');

INSERT INTO quest_accessibility_notes (quest_id, title, text) VALUES
('quiet-corners-southbank', 'Step-free access', 'The route uses level paved walkways and riverside paths.'),
('quiet-corners-southbank', 'Rest stops nearby', 'Gabriel''s Wharf and Bernie Spain Gardens have places to sit.'),
('quiet-corners-southbank', 'Public transport nearby', 'Waterloo and Southwark stations are within walking distance.');

INSERT INTO quest_accessibility_notes (quest_id, title, text) VALUES
('green-escape-city', 'Step-free access', 'St James''s Park paths are mostly flat and paved.'),
('green-escape-city', 'Rest stops nearby', 'Benches are available around the lake.'),
('green-escape-city', 'Public transport nearby', 'St James''s Park and Green Park stations are nearby.');

-- 5. Badges

INSERT INTO badges (quest_id, title, description, image_url) VALUES
('greenwich-stroll', 'Greenwich Explorer', 'Awarded for completing the Greenwich Stroll quest.', '/assets/greenwich-badge.svg'),
('kyoto-garden-escape', 'Garden Wanderer', 'Awarded for discovering the Kyoto Garden Escape quest.', '/assets/kyoto-garden-badge.svg'),
('thames-time-trail', 'Time Traveller', 'Awarded for completing the Thames Time Trail quest.', '/assets/thames-trail-badge.svg'),
('quiet-corners-southbank', 'Southbank Wanderer', 'Awarded for finding the quieter corners of Southbank.', '/assets/southbank-badge.svg'),
('green-escape-city', 'City Green Seeker', 'Awarded for completing the Green Escape in the City quest.', '/assets/green-escape-badge.svg');

-- 6. Saved quests

INSERT INTO saved_quests (user_id, quest_id) VALUES
(1, 'greenwich-stroll'),
(1, 'kyoto-garden-escape');

-- 7. Completed quests

INSERT INTO completed_quests (user_id, quest_id) VALUES
(1, 'greenwich-stroll'),
(1, 'green-escape-city');

-- 8. Tags (Activity/Features tags used on Quest Detail and by Explore filters)

INSERT INTO tags (name, type) VALUES
('Walking', 'activity'),
('Riverside', 'feature'),
('Parks & Gardens', 'feature'),
('Hidden history', 'feature'),
('Garden', 'feature'),
('Peaceful', 'feature'),
('Nature', 'feature'),
('History', 'feature'),
('Landmarks', 'feature'),
('Hidden spots', 'feature'),
('Independent places', 'feature'),
('Royal park', 'feature'),
('Relaxed', 'feature');

-- 9. Quest tags (links each quest to its tags)

INSERT INTO quest_tags (quest_id, tag_id) VALUES
('greenwich-stroll', (SELECT id FROM tags WHERE name = 'Walking')),
('greenwich-stroll', (SELECT id FROM tags WHERE name = 'Riverside')),
('greenwich-stroll', (SELECT id FROM tags WHERE name = 'Parks & Gardens')),
('greenwich-stroll', (SELECT id FROM tags WHERE name = 'Hidden history')),

('kyoto-garden-escape', (SELECT id FROM tags WHERE name = 'Walking')),
('kyoto-garden-escape', (SELECT id FROM tags WHERE name = 'Garden')),
('kyoto-garden-escape', (SELECT id FROM tags WHERE name = 'Peaceful')),
('kyoto-garden-escape', (SELECT id FROM tags WHERE name = 'Nature')),

('thames-time-trail', (SELECT id FROM tags WHERE name = 'Walking')),
('thames-time-trail', (SELECT id FROM tags WHERE name = 'Riverside')),
('thames-time-trail', (SELECT id FROM tags WHERE name = 'History')),
('thames-time-trail', (SELECT id FROM tags WHERE name = 'Landmarks')),

('quiet-corners-southbank', (SELECT id FROM tags WHERE name = 'Walking')),
('quiet-corners-southbank', (SELECT id FROM tags WHERE name = 'Hidden spots')),
('quiet-corners-southbank', (SELECT id FROM tags WHERE name = 'Riverside')),
('quiet-corners-southbank', (SELECT id FROM tags WHERE name = 'Independent places')),

('green-escape-city', (SELECT id FROM tags WHERE name = 'Walking')),
('green-escape-city', (SELECT id FROM tags WHERE name = 'Parks & Gardens')),
('green-escape-city', (SELECT id FROM tags WHERE name = 'Royal park')),
('green-escape-city', (SELECT id FROM tags WHERE name = 'Relaxed'));
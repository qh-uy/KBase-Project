-- ============================================================
--  KBase | V3 Seed Default Users
--  Passwords (BCrypt cost=10):
--    admin@kbase.com  -> Admin@123
--    owner@kbase.com  -> Owner@123
--    user@kbase.com   -> User@123
-- ============================================================

INSERT INTO users (email, password_hash, full_name, avatar_url, role_id, is_active)
SELECT
    'admin@kbase.com',
    '$2b$10$wssjvBwPBddEtNMCKPxAG.C7EkuOWy72rcCutfJfwScL/8f.0D9Oq',
    'System Admin',
    NULL,
    (SELECT id FROM roles WHERE name = 'ADMIN'),
    TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@kbase.com');

INSERT INTO users (email, password_hash, full_name, avatar_url, role_id, is_active)
SELECT
    'owner@kbase.com',
    '$2b$10$kVdYaus4Rp2HKFM/qNF6iOJqvJnPqfzK4vqCM..LX.oChMy7DPZNa',
    'Project Owner',
    NULL,
    (SELECT id FROM roles WHERE name = 'OWNER'),
    TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'owner@kbase.com');

INSERT INTO users (email, password_hash, full_name, avatar_url, role_id, is_active)
SELECT
    'user@kbase.com',
    '$2b$10$cmp5D2RCqq28My4owRb9BuzCPYTQnSwqhWEqV7WjqslwZOkaxTOey',
    'Regular User',
    NULL,
    (SELECT id FROM roles WHERE name = 'USER'),
    TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'user@kbase.com');

-- ============================================================
--  KBase | V2 Seed Default Roles
-- ============================================================

INSERT INTO roles (name, description) VALUES ('ADMIN', 'System Administrator - manages all users and projects') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name, description) VALUES ('OWNER', 'Project Owner - creates and manages projects') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name, description) VALUES ('USER', 'Regular User - uploads and views documents') ON CONFLICT (name) DO NOTHING;

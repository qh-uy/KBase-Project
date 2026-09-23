-- ============================================================
--  KBase | V2 Seed Default Roles
-- ============================================================

IF NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ADMIN')
    INSERT INTO roles (name, description) VALUES ('ADMIN', 'System Administrator - manages all users and projects');

IF NOT EXISTS (SELECT 1 FROM roles WHERE name = 'OWNER')
    INSERT INTO roles (name, description) VALUES ('OWNER', 'Project Owner - creates and manages projects');

IF NOT EXISTS (SELECT 1 FROM roles WHERE name = 'USER')
    INSERT INTO roles (name, description) VALUES ('USER', 'Regular User - uploads and views documents');
GO

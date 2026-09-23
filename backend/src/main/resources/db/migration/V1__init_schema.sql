-- ============================================================
--  KBase - Knowledge Base | V1 Init Schema (T-SQL / SQL Server)
-- ============================================================

-- Create database if not exists (run manually first or via connection string)
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'kbase_db')
BEGIN
    CREATE DATABASE kbase_db;
END
GO

USE kbase_db;
GO

-- ─────────────────────────────────────────────
-- TABLE: roles
-- ─────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='roles' AND xtype='U')
BEGIN
    CREATE TABLE roles (
        id          BIGINT IDENTITY(1,1) PRIMARY KEY,
        name        NVARCHAR(50)  NOT NULL UNIQUE,
        description NVARCHAR(255),
        created_at  DATETIME2     NOT NULL DEFAULT GETDATE(),
        updated_at  DATETIME2     NOT NULL DEFAULT GETDATE()
    );
END
GO

-- ─────────────────────────────────────────────
-- TABLE: users
-- ─────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
BEGIN
    CREATE TABLE users (
        id            BIGINT IDENTITY(1,1) PRIMARY KEY,
        email         NVARCHAR(255) NOT NULL UNIQUE,
        password_hash NVARCHAR(255) NOT NULL,
        full_name     NVARCHAR(255) NOT NULL,
        avatar_url    NVARCHAR(500),
        role_id       BIGINT        NOT NULL,
        is_active     BIT           NOT NULL DEFAULT 1,
        created_at    DATETIME2     NOT NULL DEFAULT GETDATE(),
        updated_at    DATETIME2     NOT NULL DEFAULT GETDATE(),
        CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
    );

    CREATE INDEX idx_users_email    ON users(email);
    CREATE INDEX idx_users_role_id  ON users(role_id);
END
GO

-- ─────────────────────────────────────────────
-- TABLE: projects
-- ─────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='projects' AND xtype='U')
BEGIN
    CREATE TABLE projects (
        id          BIGINT IDENTITY(1,1) PRIMARY KEY,
        name        NVARCHAR(255) NOT NULL,
        slug        NVARCHAR(255) NOT NULL UNIQUE,
        description NVARCHAR(MAX),
        cover_url   NVARCHAR(500),
        owner_id    BIGINT        NOT NULL,
        is_active   BIT           NOT NULL DEFAULT 1,
        created_at  DATETIME2     NOT NULL DEFAULT GETDATE(),
        updated_at  DATETIME2     NOT NULL DEFAULT GETDATE(),
        CONSTRAINT fk_projects_owner FOREIGN KEY (owner_id) REFERENCES users(id)
    );

    CREATE INDEX idx_projects_owner_id ON projects(owner_id);
    CREATE INDEX idx_projects_slug     ON projects(slug);
END
GO

-- ─────────────────────────────────────────────
-- TABLE: project_members
-- ─────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='project_members' AND xtype='U')
BEGIN
    CREATE TABLE project_members (
        id         BIGINT IDENTITY(1,1) PRIMARY KEY,
        project_id BIGINT        NOT NULL,
        user_id    BIGINT        NOT NULL,
        status     NVARCHAR(20)  NOT NULL DEFAULT 'PENDING',  -- PENDING | ACTIVE | REMOVED
        invited_at DATETIME2     NOT NULL DEFAULT GETDATE(),
        joined_at  DATETIME2,
        CONSTRAINT fk_pm_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        CONSTRAINT fk_pm_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE NO ACTION,
        CONSTRAINT uq_pm_project_user UNIQUE (project_id, user_id)
    );

    CREATE INDEX idx_pm_project_id ON project_members(project_id);
    CREATE INDEX idx_pm_user_id    ON project_members(user_id);
END
GO

-- ─────────────────────────────────────────────
-- TABLE: documents
-- ─────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='documents' AND xtype='U')
BEGIN
    CREATE TABLE documents (
        id              BIGINT IDENTITY(1,1) PRIMARY KEY,
        project_id      BIGINT        NOT NULL,
        uploaded_by     BIGINT        NOT NULL,
        file_name       NVARCHAR(500) NOT NULL,       -- Tên file đã được slug hóa (lưu trong MinIO)
        original_name   NVARCHAR(500) NOT NULL,       -- Tên gốc người dùng upload
        file_type       NVARCHAR(20)  NOT NULL,       -- DOCUMENT | IMAGE | VIDEO
        mime_type       NVARCHAR(255) NOT NULL,
        file_size       BIGINT        NOT NULL,       -- Bytes
        minio_bucket    NVARCHAR(255) NOT NULL,
        minio_key       NVARCHAR(500) NOT NULL,       -- Path trong MinIO bucket
        description     NVARCHAR(MAX),
        download_count  INT           NOT NULL DEFAULT 0,
        created_at      DATETIME2     NOT NULL DEFAULT GETDATE(),
        updated_at      DATETIME2     NOT NULL DEFAULT GETDATE(),
        CONSTRAINT fk_doc_project     FOREIGN KEY (project_id)  REFERENCES projects(id) ON DELETE CASCADE,
        CONSTRAINT fk_doc_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id)    ON DELETE NO ACTION
    );

    CREATE INDEX idx_doc_project_id  ON documents(project_id);
    CREATE INDEX idx_doc_uploaded_by ON documents(uploaded_by);
    CREATE INDEX idx_doc_file_type   ON documents(file_type);
END
GO

-- ─────────────────────────────────────────────
-- TABLE: refresh_tokens
-- ─────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='refresh_tokens' AND xtype='U')
BEGIN
    CREATE TABLE refresh_tokens (
        id          BIGINT IDENTITY(1,1) PRIMARY KEY,
        user_id     BIGINT        NOT NULL,
        token       NVARCHAR(500) NOT NULL UNIQUE,
        expiry_date DATETIME2     NOT NULL,
        created_at  DATETIME2     NOT NULL DEFAULT GETDATE(),
        CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX idx_rt_token   ON refresh_tokens(token);
    CREATE INDEX idx_rt_user_id ON refresh_tokens(user_id);
END
GO

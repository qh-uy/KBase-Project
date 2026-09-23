-- ============================================================
--  KBase - Knowledge Base | V1 Init Schema (PostgreSQL)
-- ============================================================

-- ─────────────────────────────────────────────
-- TABLE: roles
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roles (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────
-- TABLE: users
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(255) NOT NULL,
    avatar_url    VARCHAR(500),
    role_id       BIGINT        NOT NULL,
    is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE INDEX IF NOT EXISTS idx_users_email    ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id  ON users(role_id);

-- ─────────────────────────────────────────────
-- TABLE: projects
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    slug        VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    cover_url   VARCHAR(500),
    owner_id    BIGINT        NOT NULL,
    is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_projects_owner FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug     ON projects(slug);

-- ─────────────────────────────────────────────
-- TABLE: project_members
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_members (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id BIGINT        NOT NULL,
    user_id    BIGINT        NOT NULL,
    status     VARCHAR(20)   NOT NULL DEFAULT 'PENDING',  -- PENDING | ACTIVE | REMOVED
    invited_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    joined_at  TIMESTAMP,
    CONSTRAINT fk_pm_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_pm_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE NO ACTION,
    CONSTRAINT uq_pm_project_user UNIQUE (project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_pm_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_pm_user_id    ON project_members(user_id);

-- ─────────────────────────────────────────────
-- TABLE: documents
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id      BIGINT        NOT NULL,
    uploaded_by     BIGINT        NOT NULL,
    file_name       VARCHAR(500)  NOT NULL,       -- Tên file đã được slug hóa (lưu trong MinIO)
    original_name   VARCHAR(500)  NOT NULL,       -- Tên gốc người dùng upload
    file_type       VARCHAR(20)   NOT NULL,       -- DOCUMENT | IMAGE | VIDEO
    mime_type       VARCHAR(255)  NOT NULL,
    file_size       BIGINT        NOT NULL,       -- Bytes
    minio_bucket    VARCHAR(255)  NOT NULL,
    minio_key       VARCHAR(500)  NOT NULL,       -- Path trong MinIO bucket
    description     TEXT,
    download_count  INT           NOT NULL DEFAULT 0,
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_doc_project     FOREIGN KEY (project_id)  REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_doc_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id)    ON DELETE NO ACTION
);

CREATE INDEX IF NOT EXISTS idx_doc_project_id  ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_doc_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_doc_file_type   ON documents(file_type);

-- ─────────────────────────────────────────────
-- TABLE: refresh_tokens
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     BIGINT        NOT NULL,
    token       VARCHAR(500)  NOT NULL UNIQUE,
    expiry_date TIMESTAMP     NOT NULL,
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_rt_token   ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_rt_user_id ON refresh_tokens(user_id);

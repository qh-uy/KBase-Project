# KBase — Knowledge Base Management System

## 🛠️ Tech Stack
- **Backend**: Java 21 + Spring Boot 3.3 + Spring Security (JWT) + Flyway
- **Database**: SQL Server 2022 (Docker)
- **Storage**: MinIO (Docker, S3-compatible)
- **Docs**: Swagger UI (`/api/v1/swagger-ui.html`)

## 🚀 Quick Start (Local Dev)

### 1. Start Infrastructure (SQL Server + MinIO)
```bash
cd deploy
docker-compose up -d
```
Wait ~30 seconds for SQL Server to initialize.

### 2. Run Backend
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### 3. Access
| Service | URL |
|---------|-----|
| API Base | http://localhost:8080/api/v1 |
| Swagger UI | http://localhost:8080/api/v1/swagger-ui.html |
| MinIO Console | http://localhost:9001 (minioadmin/minioadmin) |
| MailHog | http://localhost:8025 |

## 🔐 Database Credentials (Docker)
- **Host**: localhost:1433
- **User**: `sa`
- **Password**: `Sa@12345`
- **Database**: `kbase_db` (auto-created by Flyway)

> ⚠️ SQL Server requires a strong password. `12345` alone is not accepted.
> The password `Sa@12345` satisfies complexity requirements while keeping "12345".

## 📦 API Endpoints
See Swagger UI or `api/openapi.yaml` for full documentation.

## 🏗️ Project Structure
```
backend/
├── src/main/java/com/fsoft/kbase/
│   ├── controller/     # REST Controllers
│   ├── service/        # Business Logic
│   ├── repository/     # JPA Repositories
│   ├── entity/         # JPA Entities
│   ├── dto/            # Request/Response DTOs
│   ├── security/       # JWT + Spring Security
│   ├── config/         # App Configurations
│   ├── exception/      # Global Exception Handling
│   └── util/           # Utility Classes
└── src/main/resources/
    ├── application.yml
    ├── application-dev.yml
    └── db/migration/   # Flyway SQL migrations
```

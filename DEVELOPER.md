# KBase Backend — Developer Cheatsheet (Windows)

## Maven Path (IntelliJ bundled)
```
C:\Program Files\JetBrains\IntelliJ IDEA 2026.1.1\plugins\maven\lib\maven3\bin\mvn.cmd
```

## Recommend: Add to PowerShell profile
```powershell
# Add to $PROFILE (run: notepad $PROFILE)
Set-Alias mvn "C:\Program Files\JetBrains\IntelliJ IDEA 2026.1.1\plugins\maven\lib\maven3\bin\mvn.cmd"
```

## Common Commands

### Start infrastructure (SQL Server + MinIO)
```bash
cd deploy
docker-compose up -d
```

### Run backend (dev profile)
```powershell
cd backend
& "C:\Program Files\JetBrains\IntelliJ IDEA 2026.1.1\plugins\maven\lib\maven3\bin\mvn.cmd" spring-boot:run "-Dspring-boot.run.profiles=dev"
```

### Compile only
```powershell
& "C:\Program Files\JetBrains\IntelliJ IDEA 2026.1.1\plugins\maven\lib\maven3\bin\mvn.cmd" compile
```

### Run tests
```powershell
& "C:\Program Files\JetBrains\IntelliJ IDEA 2026.1.1\plugins\maven\lib\maven3\bin\mvn.cmd" test
```

### Package JAR
```powershell
& "C:\Program Files\JetBrains\IntelliJ IDEA 2026.1.1\plugins\maven\lib\maven3\bin\mvn.cmd" package -DskipTests
```

## URLs
| Service | URL |
|---------|-----|
| API | http://localhost:8080/api/v1 |
| Swagger UI | http://localhost:8080/api/v1/swagger-ui.html |
| MinIO Console | http://localhost:9001 |
| MailHog | http://localhost:8025 |

## Database
- Server: localhost,1433
- User: `sa` / Password: `Sa@12345`
- Database: `kbase_db`

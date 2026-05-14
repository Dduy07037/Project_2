# Setup PostgreSQL Without Docker

This backend uses PostgreSQL as the primary database. Docker is not required for local development.

## Local Database

Use native PostgreSQL on Windows and pgAdmin.

Local database currently used:

```text
Host=localhost
Port=5432
Database=online_exam_db
Username=postgres
```

In pgAdmin:

1. Connect to the local PostgreSQL server.
2. Right-click `Databases`.
3. Select `Create` > `Database`.
4. Set database name to `online_exam_db`.
5. Keep owner as `postgres`, unless you created a dedicated local user.

## User Secrets

Do not store the local database password in `appsettings.json` or `appsettings.Development.json` for development. Store it in user-secrets for `ExamGuard.Api`.

From `backend/`:

```powershell
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=online_exam_db;Username=postgres;Password=<your-postgres-password>" --project .\ExamGuard.Api
dotnet user-secrets set "JwtSettings:Secret" "ExamGuard-Dev-Secret-Key-For-JWT-AtLeast32Characters!!" --project .\ExamGuard.Api
dotnet user-secrets set "JwtSettings:Issuer" "ExamGuard" --project .\ExamGuard.Api
dotnet user-secrets set "JwtSettings:Audience" "ExamGuardClient" --project .\ExamGuard.Api
```

Neo4j Aura is optional sidecar configuration. The API must continue to run with PostgreSQL only when Neo4j settings are missing.

## Restore And Migrate

From `backend/`:

```powershell
dotnet restore .\ExamGuard.sln
dotnet ef database update --project .\ExamGuard.Data --startup-project .\ExamGuard.Api
```

Startup auto-migration is Development-only by default. Outside Development, run migrations explicitly or set `Database:AutoMigrate=true` intentionally.

## Run Backend

From `backend/`:

```powershell
dotnet run --project .\ExamGuard.Api
```

Default local URL from `launchSettings.json`:

```text
http://localhost:5000
```

## Verify

Open:

```text
http://localhost:5000/api/health
http://localhost:5000/api/health/ready
http://localhost:5000/swagger
```

`/api/health/ready` should report database connectivity and no pending migrations.

## Seed Safety

Demo users using `Password123!` are Development/demo only. In Production, demo seed is skipped unless `Seed:DemoData=true` is explicitly configured, and then `Seed:DemoPassword` must be provided from a secret or environment variable.

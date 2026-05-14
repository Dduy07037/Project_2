# Tai lieu ky thuat backend ExamGuard

## 1. Pham vi va cach phan tich

Tai lieu nay phan tich toan bo backend trong `D:\ggm\code\project_code\backend`.

- Repo goc la mot monorepo nho: frontend Next.js nam o root, backend .NET nam o `backend/`.
- GitNexus index co ton tai (`.gitnexus/meta.json`: 150 files, 2022 nodes, 4938 edges, 170 processes), nhung GitNexus MCP tools khong duoc expose trong phien nay va CLI `npx gitnexus` khong chay duoc do han che network/permission. Vi vay phan tich duoi day duoc xay dung truc tiep tu source code va metadata local.
- Khong tim thay test project rieng cho backend.

## 2. Buoc 1 - Kham pha cau truc du an

### 2.1 Cay thu muc backend

Ben duoi la cay thu muc nguon da bo qua `bin/` va `obj/` de de doc:

```text
backend
+-- ExamGuard.Api
|   +-- Controllers
|   |   +-- ActivityController.cs
|   |   +-- AttemptsController.cs
|   |   +-- AuthController.cs
|   |   +-- ExamsController.cs
|   |   +-- HealthController.cs
|   |   +-- QuestionsController.cs
|   |   +-- SettingsController.cs
|   |   +-- SubjectsController.cs
|   |   \-- UsersController.cs
|   +-- Middleware
|   |   \-- ExceptionMiddleware.cs
|   +-- Properties
|   |   \-- launchSettings.json
|   +-- Security
|   |   \-- AuthorizationPolicies.cs
|   +-- appsettings.Development.json
|   +-- appsettings.json
|   +-- ExamGuard.Api.csproj
|   +-- ExamGuard.Api.http
|   \-- Program.cs
+-- ExamGuard.Core
|   +-- Configuration
|   |   \-- Neo4jAuraOptions.cs
|   +-- DTOs
|   |   +-- Activity
|   |   |   \-- ActivityDtos.cs
|   |   +-- Attempt
|   |   |   \-- AttemptDtos.cs
|   |   +-- Auth
|   |   |   \-- AuthDtos.cs
|   |   +-- Exam
|   |   |   \-- ExamDtos.cs
|   |   +-- Question
|   |   |   \-- QuestionDtos.cs
|   |   +-- Settings
|   |   |   \-- SettingsDtos.cs
|   |   \-- User
|   |       \-- UserDtos.cs
|   +-- Entities
|   |   +-- AttemptAnswer.cs
|   |   +-- AttemptEventLog.cs
|   |   +-- AttemptOptionSnapshot.cs
|   |   +-- AttemptQuestionSnapshot.cs
|   |   +-- Exam.cs
|   |   +-- ExamAttempt.cs
|   |   +-- ExamSession.cs
|   |   +-- Question.cs
|   |   +-- QuestionCategory.cs
|   |   +-- QuestionOption.cs
|   |   +-- RefreshToken.cs
|   |   +-- Subject.cs
|   |   +-- SystemSetting.cs
|   |   \-- User.cs
|   +-- Enums
|   |   +-- AttemptEventType.cs
|   |   +-- AttemptStatus.cs
|   |   +-- Difficulty.cs
|   |   +-- ExamStatus.cs
|   |   +-- SessionStatus.cs
|   |   +-- SubmitType.cs
|   |   +-- UserRole.cs
|   |   \-- UserStatus.cs
|   +-- Exceptions
|   |   \-- AppException.cs
|   +-- Interfaces
|   |   +-- IActivityService.cs
|   |   +-- IAttemptService.cs
|   |   +-- IAuthService.cs
|   |   +-- ICurrentUserService.cs
|   |   +-- IExamService.cs
|   |   +-- ISettingsService.cs
|   |   +-- ISubjectService.cs
|   |   \-- IUserService.cs
|   +-- Security
|   |   +-- AppRoleNames.cs
|   |   \-- GraphSchemaCypher.cs
|   \-- ExamGuard.Core.csproj
+-- ExamGuard.Data
|   +-- Configurations
|   |   +-- AttemptConfigurations.cs
|   |   +-- CoreConfigurations.cs
|   |   \-- ExamConfigurations.cs
|   +-- Graph
|   |   +-- Neo4jGraphBootstrapper.cs
|   |   \-- Neo4jServiceCollectionExtensions.cs
|   +-- Migrations
|   |   +-- 20260329131551_InitialCreate.cs
|   |   +-- 20260329131551_InitialCreate.Designer.cs
|   |   +-- 20260329141751_Phase2AuthSessionTracking.cs
|   |   +-- 20260329141751_Phase2AuthSessionTracking.Designer.cs
|   |   \-- AppDbContextModelSnapshot.cs
|   +-- Seed
|   |   \-- DataSeeder.cs
|   +-- AppDbContext.cs
|   \-- ExamGuard.Data.csproj
+-- ExamGuard.Service
|   +-- Services
|   |   +-- ActivityService.cs
|   |   +-- AttemptService.cs
|   |   +-- AuthService.cs
|   |   +-- CurrentUserService.cs
|   |   +-- ExamService.cs
|   |   +-- QuestionService.cs
|   |   +-- SettingsService.cs
|   |   +-- SubjectService.cs
|   |   \-- UserService.cs
|   \-- ExamGuard.Service.csproj
+-- scripts
|   +-- codegrapher-aura.env.example
|   +-- export-postgres-to-csv.ps1
|   +-- neo4j-schema.cypher
|   +-- postgres-to-neo4j.cypher
|   \-- verify-neo4j-import.cypher
+-- backend_clean_tree_2.txt
\-- ExamGuard.sln
```

### 2.2 Cac file cau hinh goc da doc

#### Root `package.json`

- Day la frontend Next.js 16 (`next@16.2.0`, `react@19.2.4`).
- Script root chi phuc vu frontend: `dev`, `build`, `start`, `lint`.
- Khong co Node backend trong root.

#### Root `.env.local.example`

- Chi co 1 bien: `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000`
- Bien nay cho thay frontend goi backend ASP.NET Core dang chay mac dinh o cong `5000`.

#### Root `README.md`

- README hien tai la README mac dinh cua `create-next-app`.
- Khong cung cap tai lieu backend.

#### `backend/ExamGuard.sln`

Solution gom 4 project:

- `ExamGuard.Api`: ASP.NET Core Web API.
- `ExamGuard.Core`: entity, enum, DTO, interface, exception, security constants.
- `ExamGuard.Data`: EF Core DbContext, entity configuration, migration, seed, Neo4j integration.
- `ExamGuard.Service`: business logic / application services.

### 2.3 Stack backend va thu vien chinh

- Runtime: .NET 8 (`net8.0`)
- API framework: ASP.NET Core Web API
- Auth: JWT Bearer
- Password hashing: `BCrypt.Net-Next`
- ORM: Entity Framework Core 8
- SQL database: PostgreSQL qua `Npgsql.EntityFrameworkCore.PostgreSQL`
- Graph database sidecar: Neo4j Aura qua `Neo4j.Driver`
- API docs: Swagger / Swashbuckle

### 2.4 Entry point chinh

Entrypoint backend la:

- `backend/ExamGuard.Api/Program.cs`

Theo `launchSettings.json`, profile local mac dinh:

- `applicationUrl = http://localhost:5000`
- `launchUrl = swagger`
- `ASPNETCORE_ENVIRONMENT = Development`

## 3. Kien truc tong the

### 3.1 Kieu kien truc

Backend dang dung mo hinh `layered architecture` co anh huong cua `clean architecture`, nhung chua thuong mai hoa thanh Clean Architecture day du.

Phan lop hien tai:

- `ExamGuard.Api`: presentation layer
- `ExamGuard.Service`: application/business layer
- `ExamGuard.Data`: infrastructure/persistence layer
- `ExamGuard.Core`: domain contract layer

### 3.2 Trach nhiem cua tung tang

#### `ExamGuard.Api`

- Cau hinh host, middleware, auth, CORS, Swagger.
- Dinh nghia REST controllers.
- Trich xuat current user tu JWT thong qua `ICurrentUserService`.
- Khong chua nghiep vu phuc tap; controller chu yeu validate input co ban roi goi service.

#### `ExamGuard.Service`

- Chua nghiep vu chinh cua he thong:
  - dang nhap, refresh token, logout, doi mat khau
  - quan ly nguoi dung
  - quan ly mon hoc, chu de, cau hoi
  - tao va publish de thi
  - tao ca thi
  - start attempt, save answer, log anti-cheat event, submit, monitoring
- Su dung truc tiep `AppDbContext`; khong dung repository abstraction.

#### `ExamGuard.Data`

- Dinh nghia `AppDbContext`.
- Mapping EF Core cho toan bo entities.
- Chua EF migrations.
- Tu dong migrate + seed du lieu khi startup.
- Dang ky va bootstrap Neo4j neu co config hop le.

#### `ExamGuard.Core`

- Entity domain.
- DTO request/response.
- Enum nghiep vu.
- Service interfaces.
- Exception co status code.
- Security constants va graph schema constants.

### 3.3 So do phu thuoc project

```text
ExamGuard.Api
  -> ExamGuard.Service
  -> ExamGuard.Data
  -> ExamGuard.Core

ExamGuard.Service
  -> ExamGuard.Data
  -> ExamGuard.Core

ExamGuard.Data
  -> ExamGuard.Core
```

Nhan xet:

- `Service` phu thuoc truc tiep `Data`, vi vay day khong phai Hexagonal/Clean thuần.
- Khong co repository/unit-of-work interface rieng.
- `Core` dong vai tro shared contracts + domain models.

### 3.4 Dependency Injection

He thong dung built-in DI container cua ASP.NET Core.

Dang ky trong `Program.cs`:

| Interface | Implementation | Lifetime |
|---|---|---|
| `ICurrentUserService` | `CurrentUserService` | Scoped |
| `IAuthService` | `AuthService` | Scoped |
| `IUserService` | `UserService` | Scoped |
| `ISubjectService` | `SubjectService` | Scoped |
| `IQuestionService` | `QuestionService` | Scoped |
| `IExamService` | `ExamService` | Scoped |
| `IAttemptService` | `AttemptService` | Scoped |
| `ISettingsService` | `SettingsService` | Scoped |
| `IActivityService` | `ActivityService` | Scoped |
| `AppDbContext` | EF Core DbContext | Scoped |
| `IHttpContextAccessor` | framework | Singleton |
| `IDriver` | Neo4j driver | Singleton, chi dang ky khi config hop le |

### 3.5 Middleware va cross-cutting concerns

- `ExceptionMiddleware`: bat `AppException` va exception chung, tra JSON `{ status, message, timestamp }`.
- `UseHttpsRedirection()`
- `UseCors("AllowFrontend")`
- `UseAuthentication()`
- `UseAuthorization()`
- `MapControllers()`
- `DataSeeder.SeedAsync()` duoc goi truoc `app.Run()`

### 3.6 Startup sequence

Thu tu khoi dong quan trong:

1. Bind Neo4j config va dang ky driver neu config hop le.
2. Doc PostgreSQL connection string.
3. Dang ky `AppDbContext` voi `UseNpgsql(...)`.
4. Doc `JwtSettings:Secret`, dang ky JWT Bearer auth.
5. Dang ky authorization policies.
6. Dang ky controllers, JSON options, CORS, Swagger, DI services.
7. Build app.
8. Bat `ExceptionMiddleware`.
9. Neu Development thi bat Swagger.
10. Dang ky HTTPS/CORS/Auth/Controllers.
11. Tu dong `MigrateAsync()` va seed du lieu.
12. Start web host.

## 4. Runtime configuration va environment

### 4.1 Cac config section tinh

| Key / Section | Nguon | Bat buoc | Muc dich |
|---|---|---|---|
| `ConnectionStrings:DefaultConnection` | `appsettings*.json` hoac user secrets | Co | Ket noi PostgreSQL |
| `JwtSettings:Secret` | `appsettings*.json` / secrets | Co | Ky JWT access token |
| `JwtSettings:Issuer` | `appsettings*.json` | Co | JWT issuer |
| `JwtSettings:Audience` | `appsettings*.json` | Co | JWT audience |
| `JwtSettings:AccessTokenExpirationMinutes` | `appsettings*.json` | Khong | TTL access token |
| `JwtSettings:RefreshTokenExpirationDays` | `appsettings*.json` | Khong | TTL refresh token |
| `Neo4jAura:Uri` | `appsettings*.json` / env | Khong | Neo4j Aura URI |
| `Neo4jAura:Username` | `appsettings*.json` / env | Khong | Neo4j user |
| `Neo4jAura:Password` | `appsettings*.json` / env | Khong | Neo4j password |
| `Neo4jAura:Database` | `appsettings*.json` / env | Khong | DB ten trong Aura |
| `Neo4jAura:MaxConnectionPoolSize` | `appsettings*.json` / env | Khong | Pool size cho Neo4j driver |
| `Neo4jAura:ConnectionTimeoutSeconds` | `appsettings*.json` / env | Khong | Timeout ket noi Neo4j |
| `AllowedHosts` | `appsettings.json` | Khong | ASP.NET host filter |

### 4.2 Gia tri config dang co

#### `appsettings.json`

- PostgreSQL local default: `Host=localhost;Port=5432;Database=online_exam_db;Username=postgres;Password=postgres`
- JWT production-like defaults:
  - issuer: `ExamGuard`
  - audience: `ExamGuardClient`
  - access token: `15` phut
  - refresh token: `7` ngay
- Neo4j Aura de dang placeholder, khong san sang dung ngay.

#### `appsettings.Development.json`

- `ConnectionStrings:DefaultConnection` de rong.
- `Program.cs` yeu cau local development dat connection string bang `dotnet user-secrets`.
- JWT dev TTL dai hon:
  - access token: `60` phut
  - refresh token: `30` ngay

### 4.3 CORS

Backend cho phep:

- `http://localhost:3000`
- `http://localhost:5173`

Va bat:

- `AllowAnyHeader()`
- `AllowAnyMethod()`
- `AllowCredentials()`

### 4.4 JSON conventions

- Property naming: `camelCase`
- `null` fields bi bo qua khi serialize

### 4.5 System settings luu trong DB

Ngoai config file, backend con co `SystemSettings` trong PostgreSQL. Cac key dang duoc code hieu la:

| Key | Default khi khong co ban ghi | Dang duoc backend su dung thuc te |
|---|---|---|
| `SiteName` | `ExamGuard` | Chi map ra DTO settings |
| `MaintenanceMode` | `false` | Chi map ra DTO settings |
| `MaxLoginAttempts` | `5` | Co, trong `AuthService.LoginAsync` |
| `SessionTimeoutMinutes` | `30` | Chi map ra DTO settings |
| `TabSwitchWarning` | `true` | Chi map ra DTO settings |
| `MaxTabSwitches` | `3` | Co, trong `AttemptService.LogEventAsync` |
| `AutoSubmitOnTabLimit` | `false` | Co, trong `AttemptService.LogEventAsync` |
| `AllowCopyPaste` | `false` | Co trong policy DTO; backend van flag event copy/paste neu frontend gui len |
| `ShowResultToStudent` | `true` | Chi la default he thong; hien thi diem thuc te phu thuoc field `Exam.ShowResultToStudent` |
| `RapidAnswerThresholdSeconds` | `3` | Tra ve cho frontend; backend chua dung de auto-flag |

## 5. Data layer

### 5.1 Cac database dang dung

#### PostgreSQL

- Day la `system of record` chinh.
- Duoc truy cap qua EF Core 8 + Npgsql provider.
- Toan bo nghiep vu runtime (auth, exam, attempt, monitoring, settings) deu doc/ghi tren PostgreSQL.

#### Neo4j Aura

- La graph sidecar tuy chon.
- Chi duoc dang ky khi `Neo4jAura` config hop le va khong con placeholder.
- Hien tai chi dung de bootstrap constraints va sync `User` + `SystemSetting` sang graph trong luc seed.
- Khong co runtime service nao trong `ExamGuard.Service` dang query Neo4j de xu ly nghiep vu.

### 5.2 `AppDbContext`

`AppDbContext` expose cac `DbSet` sau:

- `Users`
- `RefreshTokens`
- `Subjects`
- `QuestionCategories`
- `Questions`
- `QuestionOptions`
- `Exams`
- `ExamSessions`
- `ExamAttempts`
- `AttemptQuestionSnapshots`
- `AttemptOptionSnapshots`
- `AttemptAnswers`
- `AttemptEventLogs`
- `SystemSettings`

### 5.3 Schema / models chi tiet

#### `Users`

| Field | Type | Nullable | Ghi chu |
|---|---|---|---|
| `Id` | `uuid` | No | PK |
| `Email` | `varchar(256)` | No | unique, duoc normalize lowercase khi tao/login |
| `PasswordHash` | `text` | No | bcrypt hash |
| `FullName` | `varchar(200)` | No | ho ten |
| `StudentCode` | `varchar(20)` | Yes | ma SV |
| `Role` | `varchar(20)` | No | enum string: `Admin`, `Lecturer`, `Student` |
| `Status` | `varchar(20)` | No | enum string: `Active`, `Disabled`, `Locked` |
| `Department` | `varchar(100)` | Yes | khoa/bo mon |
| `FailedLoginCount` | `integer` | No | dem sai mat khau |
| `LastLoginAt` | `timestamp with time zone` | Yes | lan dang nhap cuoi |
| `CreatedAt` | `timestamp with time zone` | No | tao luc nao |
| `UpdatedAt` | `timestamp with time zone` | No | cap nhat luc nao |

Indexes:

- `IX_Users_Email` unique

Relations:

- `1-n` voi `Subjects` qua `CreatedById`
- `1-n` voi `Questions` qua `CreatedById`
- `1-n` voi `Exams` qua `CreatedById`
- `1-n` voi `ExamAttempts` qua `StudentId`
- `1-n` voi `RefreshTokens` qua `UserId`

#### `RefreshTokens`

| Field | Type | Nullable | Ghi chu |
|---|---|---|---|
| `Id` | `uuid` | No | PK |
| `UserId` | `uuid` | No | FK -> `Users.Id` |
| `SessionId` | `uuid` | No | nhom cac refresh token trong cung auth session |
| `TokenHash` | `varchar(128)` | No | SHA-256 hash cua raw refresh token |
| `ExpiresAt` | `timestamp with time zone` | No | het han |
| `CreatedAt` | `timestamp with time zone` | No | thoi diem cap |
| `CreatedByIp` | `varchar(50)` | Yes | IP dang nhap |
| `CreatedByUserAgent` | `varchar(500)` | Yes | user-agent dang nhap |
| `LastUsedAt` | `timestamp with time zone` | Yes | lan refresh cuoi |
| `LastUsedByIp` | `varchar(50)` | Yes | IP refresh cuoi |
| `LastUsedByUserAgent` | `varchar(500)` | Yes | user-agent refresh cuoi |
| `RevokedAt` | `timestamp with time zone` | Yes | revoke luc nao |
| `RevokedByIp` | `varchar(50)` | Yes | IP revoke |
| `RevocationReason` | `varchar(200)` | Yes | ly do revoke |
| `ReplacedByTokenHash` | `varchar(128)` | Yes | hash token moi khi rotate |

Indexes:

- `IX_RefreshTokens_TokenHash` unique
- `IX_RefreshTokens_UserId_SessionId`

Relations:

- `n-1` toi `Users`, `Cascade delete`

Computed properties trong entity, khong luu DB:

- `IsRevoked`
- `IsExpired`
- `IsActive`

#### `Subjects`

| Field | Type | Nullable | Ghi chu |
|---|---|---|---|
| `Id` | `uuid` | No | PK |
| `Code` | `varchar(20)` | No | unique, upper-case khi tao |
| `Name` | `varchar(200)` | No | ten mon |
| `Department` | `varchar(100)` | Yes | khoa |
| `CreatedById` | `uuid` | No | FK -> `Users.Id` |
| `IsActive` | `boolean` | No | soft active/inactive |
| `CreatedAt` | `timestamp with time zone` | No | tao luc nao |
| `UpdatedAt` | `timestamp with time zone` | No | cap nhat luc nao |

Indexes:

- `IX_Subjects_Code` unique
- `IX_Subjects_CreatedById`

Relations:

- `n-1` toi `Users` (`Restrict`)
- `1-n` voi `QuestionCategories`
- `1-n` voi `Questions`
- `1-n` voi `Exams`

#### `QuestionCategories`

| Field | Type | Nullable | Ghi chu |
|---|---|---|---|
| `Id` | `uuid` | No | PK |
| `SubjectId` | `uuid` | No | FK -> `Subjects.Id` |
| `Name` | `varchar(200)` | No | ten chu de |
| `CreatedAt` | `timestamp with time zone` | No | thoi diem tao |

Indexes:

- `IX_QuestionCategories_SubjectId`

Relations:

- `n-1` toi `Subjects` (`Cascade`)
- `1-n` voi `Questions`

#### `Questions`

| Field | Type | Nullable | Ghi chu |
|---|---|---|---|
| `Id` | `uuid` | No | PK |
| `SubjectId` | `uuid` | No | FK -> `Subjects.Id` |
| `CategoryId` | `uuid` | Yes | FK -> `QuestionCategories.Id` |
| `Content` | `text` | No | noi dung cau hoi |
| `Difficulty` | `varchar(10)` | No | `Easy`, `Medium`, `Hard` |
| `IsActive` | `boolean` | No | soft delete/visibility |
| `CreatedById` | `uuid` | No | FK -> `Users.Id` |
| `CreatedAt` | `timestamp with time zone` | No | tao luc nao |
| `UpdatedAt` | `timestamp with time zone` | No | cap nhat luc nao |

Indexes:

- `IX_Questions_CategoryId`
- `IX_Questions_CreatedById`
- `IX_Questions_SubjectId_IsActive`

Relations:

- `n-1` toi `Subjects` (`Restrict`)
- `n-1` toi `QuestionCategories` (`SetNull`)
- `n-1` toi `Users` (`Restrict`)
- `1-n` voi `QuestionOptions`

#### `QuestionOptions`

| Field | Type | Nullable | Ghi chu |
|---|---|---|---|
| `Id` | `uuid` | No | PK |
| `QuestionId` | `uuid` | No | FK -> `Questions.Id` |
| `Label` | `varchar(5)` | No | `A`, `B`, `C`, `D`... |
| `Content` | `text` | No | noi dung dap an |
| `IsCorrect` | `boolean` | No | dap an dung hay khong |
| `SortOrder` | `integer` | No | thu tu hien thi |

Indexes:

- `IX_QuestionOptions_QuestionId`

Relations:

- `n-1` toi `Questions` (`Cascade`)

#### `Exams`

| Field | Type | Nullable | Ghi chu |
|---|---|---|---|
| `Id` | `uuid` | No | PK |
| `Title` | `varchar(300)` | No | ten de thi |
| `Description` | `varchar(2000)` | Yes | mo ta |
| `SubjectId` | `uuid` | No | FK -> `Subjects.Id` |
| `CreatedById` | `uuid` | No | FK -> `Users.Id` |
| `QuestionCount` | `integer` | No | so cau can rut |
| `DurationMinutes` | `integer` | No | thoi gian thi |
| `TotalPoints` | `numeric(5,2)` | No | tong diem |
| `ShuffleQuestions` | `boolean` | No | dao cau hoi |
| `ShuffleOptions` | `boolean` | No | dao dap an |
| `ShowResultToStudent` | `boolean` | No | cho SV xem diem hay khong |
| `Status` | `varchar(20)` | No | `Draft`, `Published`, `Active`, `Completed`, `Archived` |
| `CreatedAt` | `timestamp with time zone` | No | tao luc nao |
| `UpdatedAt` | `timestamp with time zone` | No | cap nhat luc nao |

Indexes:

- `IX_Exams_CreatedById`
- `IX_Exams_SubjectId`

Relations:

- `n-1` toi `Subjects` (`Restrict`)
- `n-1` toi `Users` (`Restrict`)
- `1-n` voi `ExamSessions`

#### `ExamSessions`

| Field | Type | Nullable | Ghi chu |
|---|---|---|---|
| `Id` | `uuid` | No | PK |
| `ExamId` | `uuid` | No | FK -> `Exams.Id` |
| `Name` | `varchar(100)` | No | ten ca thi |
| `StartTime` | `timestamp with time zone` | No | bat dau |
| `EndTime` | `timestamp with time zone` | No | ket thuc |
| `MaxParticipants` | `integer` | Yes | gioi han nguoi thi |
| `Password` | `varchar(50)` | Yes | mat khau ca thi |
| `Status` | `varchar(20)` | No | `Scheduled`, `Active`, `Completed` |
| `CreatedAt` | `timestamp with time zone` | No | tao luc nao |

Indexes:

- `IX_ExamSessions_ExamId`

Relations:

- `n-1` toi `Exams` (`Cascade`)
- `1-n` voi `ExamAttempts`

#### `ExamAttempts`

| Field | Type | Nullable | Ghi chu |
|---|---|---|---|
| `Id` | `uuid` | No | PK |
| `ExamId` | `uuid` | No | FK -> `Exams.Id` |
| `SessionId` | `uuid` | No | FK -> `ExamSessions.Id` |
| `StudentId` | `uuid` | No | FK -> `Users.Id` |
| `StartedAt` | `timestamp with time zone` | No | bat dau thi |
| `SubmittedAt` | `timestamp with time zone` | Yes | nop bai luc nao |
| `Status` | `varchar(20)` | No | `InProgress`, `Submitted`, `AutoSubmitted` |
| `SubmitType` | `varchar(20)` | Yes | `Manual`, `Auto`, `Forced` |
| `IpAddress` | `varchar(50)` | Yes | IP khi start |
| `UserAgent` | `varchar(500)` | Yes | browser/client |
| `TabSwitchCount` | `integer` | No | so lan roi tab |
| `ReloadCount` | `integer` | No | so lan reload |
| `IsFlagged` | `boolean` | No | co bi danh dau nghi van hay khong |
| `FlagReason` | `varchar(1000)` | Yes | ly do ghep chuoi |
| `Score` | `numeric(5,2)` | Yes | diem sau khi nop |
| `TotalQuestions` | `integer` | No | tong so cau trong snapshot |
| `CorrectAnswers` | `integer` | Yes | so cau dung |
| `TimeSpentSeconds` | `integer` | Yes | tong thoi gian lam bai |
| `CreatedAt` | `timestamp with time zone` | No | tao luc nao |

Indexes:

- `IX_ExamAttempts_ExamId`
- `IX_ExamAttempts_StudentId`
- `IX_ExamAttempts_SingleActive` unique partial index tren `(SessionId, StudentId)` khi `Status = 'InProgress'`

Relations:

- `n-1` toi `Exams` (`Restrict`)
- `n-1` toi `ExamSessions` (`Restrict`)
- `n-1` toi `Users` (`Restrict`)
- `1-n` voi `AttemptQuestionSnapshots`
- `1-n` voi `AttemptAnswers`
- `1-n` voi `AttemptEventLogs`

#### `AttemptQuestionSnapshots`

| Field | Type | Nullable | Ghi chu |
|---|---|---|---|
| `Id` | `uuid` | No | PK |
| `AttemptId` | `uuid` | No | FK -> `ExamAttempts.Id` |
| `OriginalQuestionId` | `uuid` | No | ID cau hoi goc |
| `SortOrder` | `integer` | No | thu tu trong de |
| `Content` | `text` | No | noi dung dong bang tai luc start |
| `PointValue` | `numeric(5,2)` | No | diem moi cau |

Indexes:

- `IX_AttemptQuestionSnapshots_AttemptId_SortOrder`

Relations:

- `n-1` toi `ExamAttempts` (`Cascade`)
- `1-n` voi `AttemptOptionSnapshots`
- `1-1` logic voi `AttemptAnswers`

#### `AttemptOptionSnapshots`

| Field | Type | Nullable | Ghi chu |
|---|---|---|---|
| `Id` | `uuid` | No | PK |
| `QuestionSnapshotId` | `uuid` | No | FK -> `AttemptQuestionSnapshots.Id` |
| `OriginalOptionId` | `uuid` | No | ID option goc |
| `Label` | `varchar(5)` | No | co the bi remap sau khi shuffle |
| `Content` | `text` | No | noi dung option |
| `SortOrder` | `integer` | No | thu tu hien thi |
| `IsCorrect` | `boolean` | No | dong bang de cham diem |

Indexes:

- `IX_AttemptOptionSnapshots_QuestionSnapshotId`

Relations:

- `n-1` toi `AttemptQuestionSnapshots` (`Cascade`)

#### `AttemptAnswers`

| Field | Type | Nullable | Ghi chu |
|---|---|---|---|
| `Id` | `uuid` | No | PK |
| `AttemptId` | `uuid` | No | FK -> `ExamAttempts.Id` |
| `QuestionSnapshotId` | `uuid` | No | FK -> `AttemptQuestionSnapshots.Id` |
| `SelectedOptionSnapshotId` | `uuid` | Yes | FK -> `AttemptOptionSnapshots.Id`, `null` = chua tra loi |
| `AnsweredAt` | `timestamp with time zone` | Yes | phuc vu anti-cheat / rapid answer |
| `IsCorrect` | `boolean` | Yes | cap nhat khi cham diem |

Indexes:

- unique `IX_AttemptAnswers_AttemptId_QuestionSnapshotId`
- unique `IX_AttemptAnswers_QuestionSnapshotId`
- `IX_AttemptAnswers_SelectedOptionSnapshotId`

Relations:

- `n-1` toi `ExamAttempts` (`Cascade`)
- `1-1` toi `AttemptQuestionSnapshots` (`Restrict`)
- `n-1` toi `AttemptOptionSnapshots` (`Restrict`)

#### `AttemptEventLogs`

| Field | Type | Nullable | Ghi chu |
|---|---|---|---|
| `Id` | `uuid` | No | PK |
| `AttemptId` | `uuid` | No | FK -> `ExamAttempts.Id` |
| `EventType` | `varchar(30)` | No | enum string |
| `Timestamp` | `timestamp with time zone` | No | server receive time |
| `ClientTimestamp` | `timestamp with time zone` | Yes | timestamp tu frontend |
| `IpAddress` | `varchar(50)` | Yes | IP tai luc event |
| `UserAgent` | `varchar(500)` | Yes | browser/client |
| `Details` | `varchar(2000)` | Yes | free text/metadata |

Indexes:

- `IX_AttemptEventLogs_AttemptId_Timestamp`

Relations:

- `n-1` toi `ExamAttempts` (`Cascade`)

#### `SystemSettings`

| Field | Type | Nullable | Ghi chu |
|---|---|---|---|
| `Key` | `varchar(100)` | No | PK |
| `Value` | `varchar(500)` | No | gia tri dang string |
| `Description` | `varchar(500)` | Yes | mo ta |
| `UpdatedAt` | `timestamp with time zone` | No | cap nhat cuoi |

Indexes:

- PK tren `Key`

### 5.4 Migration strategy

He thong dung `EF Core code-first migration`.

Danh sach migration hien co:

1. `20260329131551_InitialCreate`
2. `20260329141751_Phase2AuthSessionTracking`

Y nghia migration phase 2:

- doi `RefreshTokens.Token` thanh `TokenHash`
- them `SessionId`
- them audit fields cho refresh token:
  - `CreatedByUserAgent`
  - `LastUsedAt`
  - `LastUsedByIp`
  - `LastUsedByUserAgent`
  - `RevocationReason`
  - `ReplacedByTokenHash`
- bo raw token storage, giam rui ro lo refresh token trong DB

Tac dong runtime:

- `DataSeeder.SeedAsync()` goi `context.Database.MigrateAsync()` moi lan startup.
- Nghia la app tu dong apply pending migration khi boot.

### 5.5 Seed strategy

Relational seed chi chay khi bang `Users` dang rong.

Seed san:

- 1 admin
- 2 lecturers
- 5 students
- 3 subjects
- 10 categories
- 15 sample questions cho mon `CS101`
- 7 system settings

Thong tin quan trong:

- Mat khau seed mac dinh: `Password123!`
- Sau relational seed, app thu sync `Users` va `SystemSettings` sang Neo4j.
- Neu Neo4j loi, API van tiep tuc chay bang PostgreSQL.

### 5.6 Connection pooling va resilience

#### PostgreSQL

Trong code:

- `EnableRetryOnFailure(5, TimeSpan.FromSeconds(10), null)`
- `CommandTimeout(120)`

Nhan xet:

- Khong dung `AddDbContextPool`, nen khong co EF DbContext pooling.
- Khong thay pool size PostgreSQL duoc tune minh bach trong code hay connection string.
- Thuc te se dua vao co che pooling mac dinh cua Npgsql neu connection string khong tat pooling.

#### Neo4j

Duoc tune ro rang:

- `MaxConnectionPoolSize = 100`
- `ConnectionTimeoutSeconds = 15`

## 6. API layer

### 6.1 Kieu API

- Hoan toan la `REST JSON`
- Khong co GraphQL
- Khong co gRPC
- Khong co WebSocket / SignalR

### 6.2 AuthN / AuthZ

#### Authentication

- JWT Bearer la scheme mac dinh.
- `FallbackPolicy` bat buoc user phai authenticate neu endpoint khong dat `[AllowAnonymous]`.

#### JWT claims duoc phat

Access token chua:

- `sub`
- `nameidentifier`
- `email`
- `jti`
- `role`
- custom `userId`
- `sid`
- custom `sessionId`

#### Authorization policies

| Policy | Rule |
|---|---|
| `AdminOnly` | role `Admin` |
| `AdminOrLecturer` | role `Admin` hoac `Lecturer` |
| `LecturerOnly` | role `Lecturer` |
| `StudentOnly` | role `Student` |

#### Object-level authorization

Ngoai role-level policy, service con kiem tra object ownership:

- lecturer chi duoc xem/sua subject do minh tao
- lecturer chi duoc xem/sua question trong subject cua minh
- lecturer chi duoc xem/sua exam do minh tao
- student chi duoc truy cap attempt cua chinh minh
- admin co quyen bo qua cac ownership check do

### 6.3 Endpoint inventory day du

Ghi chu:

- Duong dan viet thuong trong tai lieu de de doc; routing ASP.NET Core khong phan biet hoa thuong theo mac dinh.
- Response loi nghiep vu thuong co dang `{ status, message, timestamp }` tu `ExceptionMiddleware`.

#### Health

| Method | Path | Auth | Request | Response | Hanh vi |
|---|---|---|---|---|---|
| `GET` | `/api/health` | Anonymous | none | object | liveliness check, tra `healthy` |
| `GET` | `/api/health/ready` | Anonymous | none | object | readiness check, thu connect DB, liet ke pending migrations, seed counts; tra `503` neu DB loi hoac con migration |

#### Auth

| Method | Path | Auth | Request | Response | Hanh vi |
|---|---|---|---|---|---|
| `POST` | `/api/auth/login` | Anonymous | `LoginRequest { email, password }` | `LoginResponse` | verify bcrypt, reset failed count, issue access + refresh token |
| `POST` | `/api/auth/refresh` | Anonymous | `RefreshTokenRequest { refreshToken }` | `LoginResponse` | refresh token rotation, phat hien token reuse, issue access token moi |
| `GET` | `/api/auth/me` | Any authenticated | none | `UserInfo` | lay thong tin user hien tai |
| `POST` | `/api/auth/change-password` | Any authenticated | `ChangePasswordRequest { currentPassword, newPassword }` | message object | doi mat khau, revoke toan bo refresh token cua user |
| `POST` | `/api/auth/logout` | Any authenticated | `LogoutRequest { refreshToken }` | message object | revoke refresh token hien tai |

#### Users

| Method | Path | Auth | Request | Response | Hanh vi |
|---|---|---|---|---|---|
| `GET` | `/api/users` | `AdminOnly` | query `UserFilterParams` | `PagedResult<UserDto>` | list user, filter search/role/status |
| `GET` | `/api/users/{id}` | `AdminOnly` | none | `UserDto` | lay chi tiet 1 user |
| `POST` | `/api/users` | `AdminOnly` | `CreateUserRequest` | `UserDto` | tao user moi, hash password |
| `PUT` | `/api/users/{id}` | `AdminOnly` | `UpdateUserRequest` | `UserDto` | sua profile co ban |
| `PATCH` | `/api/users/{id}/status` | `AdminOnly` | `UpdateUserStatusRequest { status }` | message object | doi trang thai `Active/Disabled/Locked` |
| `PATCH` | `/api/users/{id}/reset-password` | `AdminOnly` | `ResetPasswordRequest { newPassword }` | message object | reset password va revoke active refresh tokens |

#### Subjects

| Method | Path | Auth | Request | Response | Hanh vi |
|---|---|---|---|---|---|
| `GET` | `/api/subjects` | `AdminOrLecturer` | none | `List<SubjectDto>` | admin va lecturer deu xem duoc danh muc mon hoc |
| `GET` | `/api/subjects/{id}` | `AdminOrLecturer` | none | `SubjectDto` | lecturer chi xem duoc subject cua minh |
| `POST` | `/api/subjects` | `AdminOnly` | `CreateSubjectRequest` | `SubjectDto` | tao mon hoc moi |
| `PUT` | `/api/subjects/{id}` | `AdminOrLecturer` | `UpdateSubjectRequest` | `SubjectDto` | update subject, lecturer phai la owner |
| `GET` | `/api/subjects/{subjectId}/categories` | `AdminOrLecturer` | none | `List<CategoryDto>` | list categories theo subject |
| `POST` | `/api/subjects/{subjectId}/categories` | `AdminOrLecturer` | `CreateCategoryRequest` | `CategoryDto` | tao category moi cho subject |
| `DELETE` | `/api/subjects/categories/{categoryId}` | `AdminOrLecturer` | none | message object | xoa category; FK `SetNull` tren `Questions.CategoryId` |

#### Questions

| Method | Path | Auth | Request | Response | Hanh vi |
|---|---|---|---|---|---|
| `GET` | `/api/questions` | `AdminOrLecturer` | query `QuestionFilterParams` | `PagedResult<QuestionDto>` | list question, lecturer chi thay question trong subject cua minh |
| `GET` | `/api/questions/{id}` | `AdminOrLecturer` | none | `QuestionDto` | detail question |
| `POST` | `/api/questions` | `LecturerOnly` | `CreateQuestionRequest` | `QuestionDto` | tao question, validate subject ownership va dung 1 dap an dung |
| `PUT` | `/api/questions/{id}` | `AdminOrLecturer` | `UpdateQuestionRequest` | `QuestionDto` | update question, thay the toan bo options |
| `DELETE` | `/api/questions/{id}` | `AdminOrLecturer` | none | message object | soft delete bang cach set `IsActive = false` |

#### Exams

| Method | Path | Auth | Request | Response | Hanh vi |
|---|---|---|---|---|---|
| `GET` | `/api/exams` | `AdminOrLecturer` | none | `List<ExamDto>` | admin thay tat ca, lecturer thay exam cua minh |
| `GET` | `/api/exams/{id}` | `AdminOrLecturer` | none | `ExamDto` | detail exam + sessions |
| `POST` | `/api/exams` | `LecturerOnly` | `CreateExamRequest` | `ExamDto` | tao exam draft, kiem tra so cau hoi san co |
| `PUT` | `/api/exams/{id}` | `AdminOrLecturer` | `UpdateExamRequest` | `ExamDto` | chi update khi exam con `Draft` |
| `PATCH` | `/api/exams/{id}/publish` | `AdminOrLecturer` | none | message object | publish exam khi da co it nhat 1 session va du question bank |
| `POST` | `/api/exams/{examId}/sessions` | `AdminOrLecturer` | `CreateSessionRequest` | `ExamSessionDto` | tao ca thi cho exam |
| `PUT` | `/api/exams/sessions/{sessionId}` | `AdminOrLecturer` | `UpdateSessionRequest` | `ExamSessionDto` | chi update session `Scheduled` |
| `GET` | `/api/exams/available` | `StudentOnly` | none | `List<AvailableSessionDto>` | list ca thi chua ket thuc ma student co the vao |

#### Attempts

| Method | Path | Auth | Request | Response | Hanh vi |
|---|---|---|---|---|---|
| `POST` | `/api/attempts/start` | `StudentOnly` | `StartAttemptRequest { sessionId, password? }` | `AttemptDetailDto` | bat dau hoac resume attempt dang mo |
| `GET` | `/api/attempts/{attemptId}` | Authenticated | none | `AttemptDetailDto` | owner xem duoc, admin/lecturer co the review attempt phu hop |
| `PUT` | `/api/attempts/{attemptId}/answers/{questionSnapshotId}` | `StudentOnly` | `SaveAnswerRequest { selectedOptionSnapshotId?, clientTimestamp? }` | `AttemptAnswerUpdateDto` | luu dap an tren snapshot |
| `POST` | `/api/attempts/{attemptId}/events` | `StudentOnly` | `LogAttemptEventRequest { eventType, clientTimestamp?, details? }` | `AttemptEventResultDto` | log anti-cheat event, co the flag/auto-submit |
| `POST` | `/api/attempts/{attemptId}/submit` | `StudentOnly` | `SubmitAttemptRequest { submitType, clientTimestamp? }` | `AttemptSummaryDto` | nop bai va cham diem |
| `GET` | `/api/attempts/history` | `StudentOnly` | none | `List<AttemptSummaryDto>` | lich su lam bai cua student |
| `GET` | `/api/attempts/monitoring` | `AdminOrLecturer` | query `MonitoringFilterParams` | `List<MonitoringAttemptDto>` | list attempt phuc vu giam sat / review |

#### Settings

| Method | Path | Auth | Request | Response | Hanh vi |
|---|---|---|---|---|---|
| `GET` | `/api/settings` | `AdminOnly` | none | `SystemSettingsDto` | doc system settings tu DB |
| `PUT` | `/api/settings` | `AdminOnly` | `UpdateSystemSettingsRequest` | `SystemSettingsDto` | upsert cac key settings |

#### Activity

| Method | Path | Auth | Request | Response | Hanh vi |
|---|---|---|---|---|---|
| `GET` | `/api/activity` | `AdminOnly` | query `limit` | `List<ActivityItemDto>` | tong hop pseudo activity feed tu users, subjects, exams, attempts |

### 6.4 DTO response/request quan trong

#### `LoginResponse`

- `accessToken`
- `refreshToken`
- `accessTokenExpires`
- `refreshTokenExpires`
- `sessionId`
- `activeSessionCount`
- `concurrentSessionDetected`
- `user`

#### `QuestionDto`

- `id`, `subjectId`, `subjectName`
- `categoryId`, `categoryName`
- `content`, `difficulty`, `isActive`
- `options[]`
- `createdById`, `createdAt`, `updatedAt`

#### `ExamDto`

- metadata cua exam
- `sessions[]`
- field delivery policy: `shuffleQuestions`, `shuffleOptions`, `showResultToStudent`

#### `AttemptDetailDto`

- `attempt`: thong tin summary cua bai lam
- `examDescription`, `durationMinutes`, `totalPoints`
- `shuffleQuestions`, `shuffleOptions`
- `policy`
- `questions[]` la snapshot de thi
- `recentEvents[]`

## 7. Luong nghiep vu chinh

### 7.1 Dang nhap va refresh token

Luồng:

1. User login bang email/password.
2. `AuthService` normalize email ve lowercase.
3. Neu sai mat khau:
   - tang `FailedLoginCount`
   - doc `MaxLoginAttempts` tu `SystemSettings`
   - neu vuot nguong thi khoa tai khoan (`Locked`)
4. Neu thanh cong:
   - reset `FailedLoginCount`
   - cap nhat `LastLoginAt`
   - tao `SessionId` moi
   - tao refresh token raw ngau nhien 64 bytes
   - luu hash SHA-256 vao DB
   - phat JWT access token co claims role/user/session
5. Refresh token:
   - tim theo `TokenHash`
   - neu token da revoked => xem la reuse, revoke toan bo active tokens cua user
   - rotate sang refresh token moi trong cung `SessionId`

### 7.2 Quan ly mon hoc va ngan hang cau hoi

- Subject la don vi cap cao.
- Category la topic trong subject.
- Question gan vao subject, co the gan category.
- Lecturer duoc phep thao tac tren subject/question cua minh; admin bo qua ownership.
- Xoa question la soft delete (`IsActive = false`), khong xoa vat ly.

### 7.3 Tao va publish de thi

Luồng:

1. Lecturer tao exam draft cho 1 subject.
2. Backend kiem tra subject dang `IsActive`.
3. Backend kiem tra so luong active questions cua subject phai du `QuestionCount`.
4. Lecturer/admin tao it nhat 1 exam session.
5. Khi publish:
   - exam phai dang `Draft`
   - phai co it nhat 1 session
   - question bank phai van du so cau
6. Sau publish, student moi thay exam trong `/api/exams/available`.

### 7.4 Bat dau bai thi

Luồng `AttemptService.StartAttemptAsync`:

1. Tim session + exam + subject.
2. Kiem tra thoi gian session:
   - chua den gio => reject
   - qua gio => reject
3. Neu co password thi phai khop.
4. Neu student da co attempt:
   - load attempt
   - neu het gio thi auto-submit
   - neu attempt da nop => reject
   - neu con dang thi => return de resume
5. Neu session co `MaxParticipants`, dem so attempts cua session; vuot gioi han thi reject.
6. Chon ngau nhien bo cau hoi active theo `QuestionCount`.
7. Snapshot hoa:
   - `AttemptQuestionSnapshot`
   - `AttemptOptionSnapshot`
   - `AttemptAnswer` rong cho tung question
8. Neu `ShuffleOptions` thi xao option va gan lai nhan `A/B/C/...`.
9. Tao `AttemptEventLog` voi `ExamStart`.

### 7.5 Luu dap an

- Luu theo `QuestionSnapshotId`, khong luu theo question goc.
- Neu option duoc gui khong nam trong snapshot cua question do => reject.
- Moi thay doi dap an giua hai option khac nhau se ghi `AttemptEventType.AnswerChanged`.
- `AnsweredAt` duoc set khi luu.

### 7.6 Anti-cheat va event tracking

Event type ho tro:

- `ExamStart`
- `ExamSubmit`
- `TabLeave`
- `TabReturn`
- `PageReload`
- `CopyAttempt`
- `PasteAttempt`
- `RightClick`
- `IdleDetected`
- `ResumeAttempt`
- `ConcurrentLogin`
- `AnswerChanged`
- `WindowBlur`
- `WindowFocus`

Rule anti-cheat trong backend:

- `TabLeave` tang `TabSwitchCount`
- `PageReload` tang `ReloadCount`
- `CopyAttempt`, `PasteAttempt`, `RightClick`, `PageReload`, `ConcurrentLogin` => flag attempt
- Neu `TabSwitchCount >= MaxTabSwitches` => flag attempt
- Neu `AutoSubmitOnTabLimit = true` va dat nguong => auto-submit

### 7.7 Submit va cham diem

Luồng:

1. Neu attempt da submit thi tra summary hien tai.
2. Xac dinh `SubmitType`.
3. Neu da qua gio ma request la manual thi backend doi sang `Auto`.
4. Tinh `TimeSpentSeconds`.
5. Cham diem tren snapshot:
   - tim option da chon trong `AttemptOptionSnapshots`
   - doc `IsCorrect` da dong bang
   - cong `PointValue` tung cau dung
6. Ghi `CorrectAnswers`, `Score`, `TotalQuestions`.
7. Ghi event `ExamSubmit`.

### 7.8 Monitoring

- Admin thay toan bo attempts.
- Lecturer chi thay attempts cua exam do minh tao.
- Co filter theo `ExamId`, `SessionId`, `FlaggedOnly`, `Search`, `Limit`.
- `RecentEvents` chi tra toi da 12 event gan nhat.

## 8. Bao mat va chinh sach truy cap

### 8.1 Diem manh

- Password hash bang bcrypt.
- Refresh token luu duoi dang hash, khong luu raw token.
- Co refresh token rotation.
- Co phat hien refresh token reuse va revoke all sessions.
- JWT tach rieng `SessionId`.
- Co partial unique index ngan 2 attempt `InProgress` trong cung session cho 1 student.
- Exception middleware tra JSON loi nhat quan.

### 8.2 Han che / rui ro ky thuat dang ton tai

1. `SessionTimeoutMinutes`, `MaintenanceMode`, `TabSwitchWarning`, `SiteName` hien chua duoc backend su dung trong flow runtime, chi luu/map ra DTO settings.
2. `RapidAnswerThresholdSeconds` duoc tra ve trong policy nhung backend chua dung de tu dong flag rapid answering.
3. `AllowCopyPaste` duoc tra ve cho frontend, nhung neu frontend van gui `CopyAttempt`/`PasteAttempt` thi backend se flag bat ke setting nay la `true` hay `false`.
4. `QuestionService.UpdateQuestionAsync` khong re-validate `CategoryId` co thuoc `SubjectId` hay khong, trong khi `CreateQuestionAsync` co validate.
5. `SubjectService.GetSubjectsAsync` bo qua tham so `lecturerId`; hien lecturer xem duoc toan bo subjects, khong chi subject cua minh.
6. `ExamSession.Status` duoc luu trong DB nhung khong co scheduler/background job cap nhat theo thoi gian; endpoint student tu tinh `Active/Scheduled` dua tren `StartTime/EndTime`.
7. `MaxParticipants` dang dem tong so `ExamAttempts` cua session, khong phan biet dang thi hay da nop.
8. `CreateSubjectAsync` cho phep admin truyen `CreatedById` tuy y; code khong kiem tra user duoc gan co phai lecturer hay khong.
9. Seed password `Password123!` la mat khau public; phu hop cho dev/demo, khong phu hop production.

## 9. Neo4j sidecar

### 9.1 Muc dich

- Bootstrap graph schema constraints.
- Sync `User` va `SystemSetting` tu PostgreSQL sang Neo4j.
- Ho tro cac script export/import graph.

### 9.2 Constraint dang duoc tao

- unique `User.id`
- unique `User.email`
- unique `Subject.id`
- unique `Subject.code`
- unique `Category.id`
- unique `Question.id`
- unique `QuestionOption.id`
- unique `Exam.id`
- unique `ExamSession.id`
- unique `RefreshToken.tokenHash`
- unique `SystemSetting.key`

### 9.3 Script ho tro

- `export-postgres-to-csv.ps1`: export du lieu SQL ra CSV
- `postgres-to-neo4j.cypher`: import CSV vao Neo4j
- `verify-neo4j-import.cypher`: verify record counts
- `codegrapher-aura.env.example`: template env cho MCP/graph tooling

## 10. Tong ket nhanh

Backend hien tai la mot he thong thi truc tuyen ASP.NET Core co 4 cum nghiep vu ro rang:

- auth + session tracking
- user / subject / question management
- exam + exam session management
- exam attempt + anti-cheat monitoring

Kien truc du an de theo doi, phan tach project hop ly cho quy mo nho-vua, va luong attempt duoc thiet ke kha chac chan nho co snapshotting, audit log va refresh-token rotation. Phan chua hoan thien nam o cho mot so system settings chua duoc backend enforce day du, object-level authorization cua subjects dang rong hon mo ta interface, va Neo4j hien chi dong vai tro sidecar thay vi mot phan cua runtime path.

using ExamGuard.Core.Configuration;
using ExamGuard.Core.Entities;
using ExamGuard.Core.Enums;
using ExamGuard.Data.Graph;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Neo4j.Driver;

namespace ExamGuard.Data.Seed;

public static class DataSeeder
{
    private static readonly Guid DemoAdminId = Guid.Parse("a1000000-0000-0000-0000-000000000001");
    private static readonly Guid DemoLecturerId = Guid.Parse("a2000000-0000-0000-0000-000000000002");
    private static readonly Guid DemoLecturerId2 = Guid.Parse("a3000000-0000-0000-0000-000000000003");
    private static readonly Guid DemoStudentId = Guid.Parse("a4000000-0000-0000-0000-000000000004");
    private static readonly Guid DemoStudentId2 = Guid.Parse("a5000000-0000-0000-0000-000000000005");
    private static readonly Guid DemoStudentId3 = Guid.Parse("a6000000-0000-0000-0000-000000000006");
    private static readonly Guid DemoStudentId4 = Guid.Parse("a7000000-0000-0000-0000-000000000007");
    private static readonly Guid DemoStudentId5 = Guid.Parse("a8000000-0000-0000-0000-000000000008");

    private static readonly Guid DemoSubjectProgrammingId = Guid.Parse("b1000000-0000-0000-0000-000000000001");
    private static readonly Guid DemoSubjectAlgorithmsId = Guid.Parse("b2000000-0000-0000-0000-000000000002");
    private static readonly Guid DemoSubjectDatabaseId = Guid.Parse("b3000000-0000-0000-0000-000000000003");

    private static readonly Guid DemoCategoryVariablesId = Guid.Parse("c1000000-0000-0000-0000-000000000001");
    private static readonly Guid DemoCategoryControlFlowId = Guid.Parse("c2000000-0000-0000-0000-000000000002");
    private static readonly Guid DemoCategoryRecursionId = Guid.Parse("c3000000-0000-0000-0000-000000000003");
    private static readonly Guid DemoCategoryArraysId = Guid.Parse("c4000000-0000-0000-0000-000000000004");
    private static readonly Guid DemoCategoryPointersId = Guid.Parse("c5000000-0000-0000-0000-000000000005");
    private static readonly Guid DemoCategoryLinkedListId = Guid.Parse("c6000000-0000-0000-0000-000000000006");
    private static readonly Guid DemoCategoryStackQueueId = Guid.Parse("c7000000-0000-0000-0000-000000000007");
    private static readonly Guid DemoCategoryBinaryTreeId = Guid.Parse("c8000000-0000-0000-0000-000000000008");
    private static readonly Guid DemoCategoryRelationalModelId = Guid.Parse("c9000000-0000-0000-0000-000000000009");
    private static readonly Guid DemoCategorySqlId = Guid.Parse("ca000000-0000-0000-0000-00000000000a");

    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var environment = scope.ServiceProvider.GetRequiredService<IHostEnvironment>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<AppDbContext>>();

        try
        {
            var autoMigrate = environment.IsDevelopment() || configuration.GetValue<bool>("Database:AutoMigrate");
            if (autoMigrate)
            {
                await context.Database.MigrateAsync();
                logger.LogInformation("Database migrated successfully.");
            }
            else
            {
                logger.LogInformation("Automatic database migration skipped outside Development. Set Database:AutoMigrate=true to enable explicitly.");
            }

            if (!await context.SystemSettings.AnyAsync())
            {
                await SeedSystemSettings(context);
                await context.SaveChangesAsync();
                logger.LogInformation("System settings seed inserted successfully.");
            }

            var seedDemoData = environment.IsDevelopment() || configuration.GetValue<bool>("Seed:DemoData");
            if (seedDemoData)
            {
                var demoPassword = configuration["Seed:DemoPassword"];
                if (string.IsNullOrWhiteSpace(demoPassword))
                {
                    if (!environment.IsDevelopment())
                        throw new InvalidOperationException("Seed:DemoPassword must be configured when Seed:DemoData=true outside Development.");

                    demoPassword = "Password123!";
                }

                var demoSeedChanged = await EnsureDemoDataAsync(context, demoPassword);
                if (demoSeedChanged)
                {
                    await context.SaveChangesAsync();
                    logger.LogInformation("Demo seed data ensured successfully.");
                }
                else
                {
                    logger.LogInformation("Demo seed data already present. Skipping demo upsert.");
                }
            }
            else if (!await context.Users.AnyAsync())
            {
                logger.LogInformation("Demo user seed skipped outside Development. Set Seed:DemoData=true with Seed:DemoPassword to enable explicitly.");
            }
            else
            {
                logger.LogInformation("Demo seed disabled. Existing relational data kept as-is.");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error seeding relational database.");
            throw;
        }

        await TrySeedNeo4jAsync(scope.ServiceProvider, context);
    }

    private static async Task<bool> EnsureDemoDataAsync(AppDbContext context, string password)
    {
        var usersChanged = await SeedUsers(context, password);
        var subjectsChanged = await SeedSubjectsAndCategories(context);
        var questionsChanged = await SeedQuestions(context);

        return usersChanged || subjectsChanged || questionsChanged;
    }

    private static async Task TrySeedNeo4jAsync(IServiceProvider scopedProvider, AppDbContext context)
    {
        var neoLogger = scopedProvider.GetRequiredService<ILoggerFactory>().CreateLogger("Neo4jGraphSeeder");
        try
        {
            var driver = scopedProvider.GetService<IDriver>();
            var bootstrapper = scopedProvider.GetService<Neo4jGraphBootstrapper>();
            if (driver == null || bootstrapper == null)
            {
                neoLogger.LogInformation(
                    "Neo4j Aura driver not registered (missing or placeholder config). Skipping graph bootstrap; set Neo4jAura:Uri/Username/Password (user-secrets or env).");
                return;
            }

            var options = scopedProvider.GetRequiredService<IOptions<Neo4jAuraOptions>>().Value;

            await bootstrapper.InitializeSchemaAsync();

            await using var session = driver.AsyncSession(config => config.WithDatabase(options.Database));
            var countCursor = await session.RunAsync("MATCH (u:User) RETURN count(u) AS c");
            var countRecord = await countCursor.SingleAsync();
            if (countRecord["c"].As<long>() > 0)
            {
                neoLogger.LogInformation("Neo4j graph already has User nodes. Skipping graph user/settings sync.");
                return;
            }

            var efUsers = await context.Users.AsNoTracking().ToListAsync();
            if (efUsers.Count == 0)
            {
                neoLogger.LogInformation("No users in PostgreSQL; skipping Neo4j user seed.");
                return;
            }

            var efSettings = await context.SystemSettings.AsNoTracking().ToListAsync();

            await session.ExecuteWriteAsync(async tx =>
            {
                foreach (var u in efUsers)
                {
                    await tx.RunAsync(
                        """
                        MERGE (n:User {id: $id})
                        SET n.email = $email,
                            n.passwordHash = $passwordHash,
                            n.fullName = $fullName,
                            n.studentCode = $studentCode,
                            n.role = $role,
                            n.status = $status,
                            n.department = $department,
                            n.failedLoginCount = $failedLoginCount,
                            n.createdAt = datetime($createdAt),
                            n.updatedAt = datetime($updatedAt),
                            n.lastLoginAt = CASE WHEN $lastLoginAt IS NULL THEN NULL ELSE datetime($lastLoginAt) END
                        """,
                        new
                        {
                            id = u.Id.ToString(),
                            email = u.Email,
                            passwordHash = u.PasswordHash,
                            fullName = u.FullName,
                            studentCode = u.StudentCode ?? string.Empty,
                            role = u.Role.ToString(),
                            status = u.Status.ToString(),
                            department = u.Department ?? string.Empty,
                            failedLoginCount = u.FailedLoginCount,
                            createdAt = u.CreatedAt.ToUniversalTime().ToString("o"),
                            updatedAt = u.UpdatedAt.ToUniversalTime().ToString("o"),
                            lastLoginAt = u.LastLoginAt.HasValue ? u.LastLoginAt.Value.ToUniversalTime().ToString("o") : (string?)null
                        });
                }

                foreach (var s in efSettings)
                {
                    await tx.RunAsync(
                        """
                        MERGE (ss:SystemSetting {key: $key})
                        SET ss.value = $value,
                            ss.description = $description,
                            ss.updatedAt = datetime($updatedAt)
                        """,
                        new
                        {
                            key = s.Key,
                            value = s.Value,
                            description = s.Description ?? string.Empty,
                            updatedAt = s.UpdatedAt.ToUniversalTime().ToString("o")
                        });
                }
            });

            neoLogger.LogInformation(
                "Neo4j graph seed completed: {UserCount} users, {SettingCount} system settings synced from PostgreSQL.",
                efUsers.Count,
                efSettings.Count);
        }
        catch (Exception ex)
        {
            neoLogger.LogWarning(ex, "Neo4j graph bootstrap/seed failed; API will continue using PostgreSQL only.");
        }
    }

    private static async Task<bool> SeedUsers(AppDbContext context, string password)
    {
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);

        var users = new List<User>
        {
            new() { Id = DemoAdminId, Email = "admin@hcmut.edu.vn", PasswordHash = passwordHash, FullName = "Nguyễn Văn Quản Trị", Role = UserRole.Admin, Department = "CNTT" },
            new() { Id = DemoLecturerId, Email = "lecturer1@hcmut.edu.vn", PasswordHash = passwordHash, FullName = "Trần Thị Minh Anh", Role = UserRole.Lecturer, Department = "Khoa CNTT" },
            new() { Id = DemoLecturerId2, Email = "lecturer2@hcmut.edu.vn", PasswordHash = passwordHash, FullName = "Lê Hoàng Phúc", Role = UserRole.Lecturer, Department = "Khoa CNTT" },
            new() { Id = DemoStudentId, Email = "sv001@student.hcmut.edu.vn", PasswordHash = passwordHash, FullName = "Phạm Đức Duy", Role = UserRole.Student, StudentCode = "2112001", Department = "CNTT" },
            new() { Id = DemoStudentId2, Email = "sv002@student.hcmut.edu.vn", PasswordHash = passwordHash, FullName = "Ngô Thanh Hằng", Role = UserRole.Student, StudentCode = "2112002", Department = "CNTT" },
            new() { Id = DemoStudentId3, Email = "sv003@student.hcmut.edu.vn", PasswordHash = passwordHash, FullName = "Võ Minh Khôi", Role = UserRole.Student, StudentCode = "2112003", Department = "CNTT" },
            new() { Id = DemoStudentId4, Email = "sv004@student.hcmut.edu.vn", PasswordHash = passwordHash, FullName = "Hoàng Thị Lan", Role = UserRole.Student, StudentCode = "2112004", Department = "CNTT", Status = UserStatus.Disabled },
            new() { Id = DemoStudentId5, Email = "sv005@student.hcmut.edu.vn", PasswordHash = passwordHash, FullName = "Đặng Quốc Bảo", Role = UserRole.Student, StudentCode = "2112005", Department = "CNTT" },
        };

        var existingUserIds = await context.Users
            .AsNoTracking()
            .Select(user => user.Id)
            .ToListAsync();

        var missingUsers = users
            .Where(user => !existingUserIds.Contains(user.Id))
            .ToList();

        if (missingUsers.Count == 0)
            return false;

        await context.Users.AddRangeAsync(missingUsers);
        return true;
    }

    private static async Task<bool> SeedSubjectsAndCategories(AppDbContext context)
    {
        var subjects = new List<Subject>
        {
            new() { Id = DemoSubjectProgrammingId, Code = "CS101", Name = "Nhập môn Lập trình", Department = "Khoa CNTT", CreatedById = DemoLecturerId },
            new() { Id = DemoSubjectAlgorithmsId, Code = "CS201", Name = "Cấu trúc Dữ liệu & Giải thuật", Department = "Khoa CNTT", CreatedById = DemoLecturerId },
            new() { Id = DemoSubjectDatabaseId, Code = "CS301", Name = "Cơ sở Dữ liệu", Department = "Khoa CNTT", CreatedById = DemoLecturerId2 },
        };

        var existingSubjectIds = await context.Subjects
            .AsNoTracking()
            .Select(subject => subject.Id)
            .ToListAsync();

        var missingSubjects = subjects
            .Where(subject => !existingSubjectIds.Contains(subject.Id))
            .ToList();

        if (missingSubjects.Count > 0)
            await context.Subjects.AddRangeAsync(missingSubjects);

        var categories = new List<QuestionCategory>
        {
            new() { Id = DemoCategoryVariablesId, SubjectId = DemoSubjectProgrammingId, Name = "Biến và kiểu dữ liệu" },
            new() { Id = DemoCategoryControlFlowId, SubjectId = DemoSubjectProgrammingId, Name = "Cấu trúc điều khiển" },
            new() { Id = DemoCategoryRecursionId, SubjectId = DemoSubjectProgrammingId, Name = "Hàm và đệ quy" },
            new() { Id = DemoCategoryArraysId, SubjectId = DemoSubjectProgrammingId, Name = "Mảng và chuỗi" },
            new() { Id = DemoCategoryPointersId, SubjectId = DemoSubjectProgrammingId, Name = "Con trỏ" },
            new() { Id = DemoCategoryLinkedListId, SubjectId = DemoSubjectAlgorithmsId, Name = "Danh sách liên kết" },
            new() { Id = DemoCategoryStackQueueId, SubjectId = DemoSubjectAlgorithmsId, Name = "Stack & Queue" },
            new() { Id = DemoCategoryBinaryTreeId, SubjectId = DemoSubjectAlgorithmsId, Name = "Cây nhị phân" },
            new() { Id = DemoCategoryRelationalModelId, SubjectId = DemoSubjectDatabaseId, Name = "Mô hình quan hệ" },
            new() { Id = DemoCategorySqlId, SubjectId = DemoSubjectDatabaseId, Name = "SQL cơ bản" },
        };

        var existingCategoryIds = await context.QuestionCategories
            .AsNoTracking()
            .Select(category => category.Id)
            .ToListAsync();

        var missingCategories = categories
            .Where(category => !existingCategoryIds.Contains(category.Id))
            .ToList();

        if (missingCategories.Count > 0)
            await context.QuestionCategories.AddRangeAsync(missingCategories);

        return missingSubjects.Count > 0 || missingCategories.Count > 0;
    }

    private static async Task<bool> SeedQuestions(AppDbContext context)
    {
        var questions = new List<Question>
        {
            CreateQuestion(Guid.Parse("d1000000-0000-0000-0000-000000000001"), DemoSubjectProgrammingId, DemoCategoryVariablesId, DemoLecturerId, "Trong ngôn ngữ C, kiểu dữ liệu nào sau đây dùng để lưu trữ số thực?", Difficulty.Easy,
                ("int", false), ("float", true), ("char", false), ("bool", false)),
            CreateQuestion(Guid.Parse("d1000000-0000-0000-0000-000000000002"), DemoSubjectProgrammingId, DemoCategoryControlFlowId, DemoLecturerId, "Vòng lặp nào trong C sẽ kiểm tra điều kiện trước khi thực thi phần thân?", Difficulty.Medium,
                ("do-while", false), ("for", false), ("while", false), ("Cả B và C", true)),
            CreateQuestion(Guid.Parse("d1000000-0000-0000-0000-000000000003"), DemoSubjectProgrammingId, DemoCategoryRecursionId, DemoLecturerId, "Hàm đệ quy cần có thành phần nào để tránh lặp vô hạn?", Difficulty.Easy,
                ("Biến toàn cục", false), ("Điều kiện dừng (base case)", true), ("Vòng lặp for", false), ("Câu lệnh goto", false)),
            CreateQuestion(Guid.Parse("d1000000-0000-0000-0000-000000000004"), DemoSubjectProgrammingId, DemoCategoryVariablesId, DemoLecturerId, "Toán tử nào dùng để truy cập địa chỉ của biến trong C?", Difficulty.Easy,
                ("*", false), ("&", true), ("#", false), ("@", false)),
            CreateQuestion(Guid.Parse("d1000000-0000-0000-0000-000000000005"), DemoSubjectProgrammingId, DemoCategoryVariablesId, DemoLecturerId, "Hàm printf() trong C thuộc thư viện nào?", Difficulty.Easy,
                ("stdlib.h", false), ("stdio.h", true), ("string.h", false), ("math.h", false)),
            CreateQuestion(Guid.Parse("d1000000-0000-0000-0000-000000000006"), DemoSubjectProgrammingId, DemoCategoryControlFlowId, DemoLecturerId, "Kết quả của biểu thức 5 / 2 (với 5 và 2 đều là int) là bao nhiêu?", Difficulty.Medium,
                ("2.5", false), ("2", true), ("3", false), ("2.0", false)),
            CreateQuestion(Guid.Parse("d1000000-0000-0000-0000-000000000007"), DemoSubjectProgrammingId, DemoCategoryControlFlowId, DemoLecturerId, "Câu lệnh nào dùng để kết thúc vòng lặp trước thời hạn?", Difficulty.Easy,
                ("continue", false), ("break", true), ("return", false), ("exit", false)),
            CreateQuestion(Guid.Parse("d1000000-0000-0000-0000-000000000008"), DemoSubjectProgrammingId, DemoCategoryVariablesId, DemoLecturerId, "Mảng trong C có chỉ số bắt đầu từ?", Difficulty.Easy,
                ("0", true), ("1", false), ("-1", false), ("Tùy khai báo", false)),
            CreateQuestion(Guid.Parse("d1000000-0000-0000-0000-000000000009"), DemoSubjectProgrammingId, DemoCategoryRecursionId, DemoLecturerId, "Từ khóa 'static' trong C dùng để làm gì?", Difficulty.Medium,
                ("Khai báo biến hằng", false), ("Biến tĩnh, giữ giá trị qua các lần gọi hàm", true), ("Khai báo biến ngoại", false), ("Tạo con trỏ", false)),
            CreateQuestion(Guid.Parse("d1000000-0000-0000-0000-00000000000a"), DemoSubjectProgrammingId, DemoCategoryVariablesId, DemoLecturerId, "Kích thước kiểu 'int' trên hệ thống 32-bit thường là bao nhiêu byte?", Difficulty.Easy,
                ("1", false), ("2", false), ("4", true), ("8", false)),
            CreateQuestion(Guid.Parse("d1000000-0000-0000-0000-00000000000b"), DemoSubjectProgrammingId, DemoCategoryVariablesId, DemoLecturerId, "Phát biểu nào đúng về con trỏ NULL trong C?", Difficulty.Medium,
                ("Trỏ đến vùng nhớ số 0", false), ("Là con trỏ không trỏ đến đối tượng hợp lệ nào", true), ("Luôn gây lỗi khi sử dụng", false), ("Chỉ dùng được với kiểu int", false)),
            CreateQuestion(Guid.Parse("d1000000-0000-0000-0000-00000000000c"), DemoSubjectProgrammingId, DemoCategoryRecursionId, DemoLecturerId, "Struct trong C dùng để làm gì?", Difficulty.Easy,
                ("Định nghĩa hàm", false), ("Nhóm các biến có kiểu khác nhau thành một kiểu dữ liệu", true), ("Tạo vòng lặp", false), ("Quản lý bộ nhớ", false)),
            CreateQuestion(Guid.Parse("d1000000-0000-0000-0000-00000000000d"), DemoSubjectProgrammingId, DemoCategoryRecursionId, DemoLecturerId, "Hàm malloc() trả về kiểu gì?", Difficulty.Hard,
                ("int", false), ("void*", true), ("char*", false), ("float", false)),
            CreateQuestion(Guid.Parse("d1000000-0000-0000-0000-00000000000e"), DemoSubjectProgrammingId, DemoCategoryVariablesId, DemoLecturerId, "Toán tử sizeof trong C trả về gì?", Difficulty.Easy,
                ("Giá trị của biến", false), ("Kích thước bộ nhớ tính bằng byte", true), ("Địa chỉ bộ nhớ", false), ("Số phần tử mảng", false)),
            CreateQuestion(Guid.Parse("d1000000-0000-0000-0000-00000000000f"), DemoSubjectProgrammingId, DemoCategoryControlFlowId, DemoLecturerId, "Phát biểu nào đúng về hàm main() trong C?", Difficulty.Easy,
                ("Không bắt buộc có", false), ("Là hàm đầu tiên được thực thi khi chạy chương trình", true), ("Có thể khai báo nhiều lần", false), ("Chỉ trả về void", false)),
        };

        var existingContents = await context.Questions
            .AsNoTracking()
            .Where(question => question.SubjectId == DemoSubjectProgrammingId && question.CreatedById == DemoLecturerId)
            .Select(question => question.Content)
            .ToListAsync();

        var existingContentSet = new HashSet<string>(existingContents, StringComparer.Ordinal);
        var missingQuestions = questions
            .Where(question => !existingContentSet.Contains(question.Content))
            .ToList();

        if (missingQuestions.Count == 0)
            return false;

        await context.Questions.AddRangeAsync(missingQuestions);
        return true;
    }

    private static Question CreateQuestion(Guid id, Guid subjectId, Guid categoryId, Guid createdById,
        string content, Difficulty difficulty,
        (string text, bool correct) optA, (string text, bool correct) optB,
        (string text, bool correct) optC, (string text, bool correct) optD)
    {
        var q = new Question
        {
            Id = id,
            SubjectId = subjectId,
            CategoryId = categoryId,
            CreatedById = createdById,
            Content = content,
            Difficulty = difficulty,
        };

        q.Options.Add(new QuestionOption { Id = Guid.NewGuid(), QuestionId = id, Label = "A", Content = optA.text, IsCorrect = optA.correct, SortOrder = 0 });
        q.Options.Add(new QuestionOption { Id = Guid.NewGuid(), QuestionId = id, Label = "B", Content = optB.text, IsCorrect = optB.correct, SortOrder = 1 });
        q.Options.Add(new QuestionOption { Id = Guid.NewGuid(), QuestionId = id, Label = "C", Content = optC.text, IsCorrect = optC.correct, SortOrder = 2 });
        q.Options.Add(new QuestionOption { Id = Guid.NewGuid(), QuestionId = id, Label = "D", Content = optD.text, IsCorrect = optD.correct, SortOrder = 3 });

        return q;
    }

    private static async Task SeedSystemSettings(AppDbContext context)
    {
        var settings = new List<SystemSetting>
        {
            new() { Key = "SiteName", Value = "ExamGuard", Description = "Display name of the system" },
            new() { Key = "MaintenanceMode", Value = "false", Description = "Block non-admin business endpoints while enabled; health endpoints remain available" },
            new() { Key = "MaxTabSwitches", Value = "3", Description = "Maximum tab switches before warning" },
            new() { Key = "AutoSubmitOnTabLimit", Value = "false", Description = "Auto-submit when tab switch limit reached" },
            new() { Key = "MaxLoginAttempts", Value = "5", Description = "Max failed login attempts before lock" },
            new() { Key = "SessionTimeoutMinutes", Value = "30", Description = "Configured session timeout display value; not enforced by backend auth or exam idle timeout" },
            new() { Key = "TabSwitchWarning", Value = "true", Description = "Frontend-only tab switch warning toggle" },
            new() { Key = "AllowCopyPaste", Value = "false", Description = "Allow copy/paste during exam" },
            new() { Key = "ShowResultToStudent", Value = "true", Description = "Default: show result after submission" },
            new() { Key = "RapidAnswerThresholdSeconds", Value = "3", Description = "Min seconds between answers to flag rapid answering" },
        };

        await context.SystemSettings.AddRangeAsync(settings);
    }
}

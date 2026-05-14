using System.Security.Cryptography;
using System.Text;
using ExamGuard.Core.DTOs.Attempt;
using ExamGuard.Core.DTOs.Auth;
using ExamGuard.Core.DTOs.Question;
using ExamGuard.Core.DTOs.Exam;
using ExamGuard.Core.Entities;
using ExamGuard.Core.Enums;
using ExamGuard.Core.Exceptions;
using ExamGuard.Data;
using ExamGuard.Service.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace ExamGuard.Tests;

public class ServiceBehaviorTests
{
    [Fact]
    public async Task CreateUserAsync_NormalizesTrimmedUppercaseEmail()
    {
        await using var db = CreateDbContext();
        var service = new UserService(db, NullLogger<UserService>.Instance);

        var created = await service.CreateUserAsync(new CreateUserRequest
        {
            Email = " Lecturer@Example.Test ",
            Password = "Password123!",
            FullName = "Lecturer One",
            Role = "Lecturer"
        });

        Assert.Equal("lecturer@example.test", created.Email);
    }

    [Fact]
    public async Task CreateUserAsync_RejectsInvalidEmailFormat()
    {
        await using var db = CreateDbContext();
        var service = new UserService(db, NullLogger<UserService>.Instance);

        var ex = await Assert.ThrowsAsync<AppException>(() => service.CreateUserAsync(new CreateUserRequest
        {
            Email = "invalid-email",
            Password = "Password123!",
            FullName = "Invalid Email User",
            Role = "Student"
        }));

        Assert.Equal("Email không đúng định dạng.", ex.Message);
    }

    [Fact]
    public async Task CreateUserAsync_RejectsDuplicateEmailAfterNormalization()
    {
        await using var db = CreateDbContext();
        AddUser(db, UserRole.Lecturer, "lecturer@example.test");
        await db.SaveChangesAsync();
        var service = new UserService(db, NullLogger<UserService>.Instance);

        await Assert.ThrowsAsync<ConflictException>(() => service.CreateUserAsync(new CreateUserRequest
        {
            Email = " Lecturer@Example.Test ",
            Password = "Password123!",
            FullName = "Lecturer Duplicate",
            Role = "Lecturer"
        }));
    }

    [Fact]
    public async Task LoginAsync_LocksUserAfterMaxFailedAttempts()
    {
        await using var db = CreateDbContext();
        var user = AddUser(db, UserRole.Student, "student@example.test", "Correct123!");
        AddSetting(db, "MaxLoginAttempts", "2");
        await db.SaveChangesAsync();

        var service = CreateAuthService(db);

        await Assert.ThrowsAsync<UnauthorizedException>(() =>
            service.LoginAsync(new LoginRequest { Email = user.Email, Password = "wrong" }, null, null));
        await Assert.ThrowsAsync<UnauthorizedException>(() =>
            service.LoginAsync(new LoginRequest { Email = user.Email, Password = "wrong" }, null, null));

        Assert.Equal(UserStatus.Locked, user.Status);
        Assert.Equal(2, user.FailedLoginCount);
    }

    [Fact]
    public async Task RefreshTokenAsync_RotatesTokenAndRevokesOldToken()
    {
        await using var db = CreateDbContext();
        var user = AddUser(db, UserRole.Student, "student@example.test", "Correct123!");
        await db.SaveChangesAsync();

        var service = CreateAuthService(db);
        var login = await service.LoginAsync(new LoginRequest { Email = user.Email, Password = "Correct123!" }, "127.0.0.1", "test");

        var refreshed = await service.RefreshTokenAsync(login.RefreshToken, "127.0.0.1", "test");

        var oldHash = ComputeTokenHash(login.RefreshToken);
        var newHash = ComputeTokenHash(refreshed.RefreshToken);
        Assert.NotEqual(oldHash, newHash);

        var oldToken = await db.RefreshTokens.SingleAsync(t => t.TokenHash == oldHash);
        var newToken = await db.RefreshTokens.SingleAsync(t => t.TokenHash == newHash);
        Assert.True(oldToken.IsRevoked);
        Assert.Equal("Rotated", oldToken.RevocationReason);
        Assert.Equal(newHash, oldToken.ReplacedByTokenHash);
        Assert.True(newToken.IsActive);
    }

    [Fact]
    public async Task RefreshTokenAsync_ReusingRevokedTokenRevokesAllActiveTokens()
    {
        await using var db = CreateDbContext();
        var user = AddUser(db, UserRole.Student, "student@example.test", "Correct123!");
        await db.SaveChangesAsync();

        var service = CreateAuthService(db);
        var login = await service.LoginAsync(new LoginRequest { Email = user.Email, Password = "Correct123!" }, "127.0.0.1", "test");
        await service.RefreshTokenAsync(login.RefreshToken, "127.0.0.1", "test");

        await Assert.ThrowsAsync<UnauthorizedException>(() =>
            service.RefreshTokenAsync(login.RefreshToken, "127.0.0.1", "test"));

        Assert.DoesNotContain(db.RefreshTokens.Where(t => t.UserId == user.Id), t => t.IsActive);
    }

    [Fact]
    public async Task Lecturer_CannotViewOrUpdateSubjectCreatedByAnotherLecturer()
    {
        await using var db = CreateDbContext();
        var lecturer1 = AddUser(db, UserRole.Lecturer, "lecturer1@example.test");
        var lecturer2 = AddUser(db, UserRole.Lecturer, "lecturer2@example.test");
        var ownSubject = AddSubject(db, lecturer1.Id, "OWN101");
        var otherSubject = AddSubject(db, lecturer2.Id, "OTH101");
        await db.SaveChangesAsync();

        var service = new SubjectService(db, NullLogger<SubjectService>.Instance);

        var visibleSubjects = await service.GetSubjectsAsync(lecturer1.Id);
        Assert.Single(visibleSubjects);
        Assert.Equal(ownSubject.Id, visibleSubjects[0].Id);

        await Assert.ThrowsAsync<ForbiddenException>(() =>
            service.GetSubjectByIdAsync(otherSubject.Id, lecturer1.Id, isAdmin: false));
        await Assert.ThrowsAsync<ForbiddenException>(() =>
            service.UpdateSubjectAsync(otherSubject.Id, new UpdateSubjectRequest { Name = "Updated", IsActive = true }, lecturer1.Id, isAdmin: false));
    }

    [Fact]
    public async Task UpdateQuestionAsync_RejectsCategoryFromAnotherSubject()
    {
        await using var db = CreateDbContext();
        var lecturer = AddUser(db, UserRole.Lecturer, "lecturer@example.test");
        var subject1 = AddSubject(db, lecturer.Id, "S101");
        var subject2 = AddSubject(db, lecturer.Id, "S202");
        var category2 = AddCategory(db, subject2.Id, "Other subject category");
        var question = AddQuestion(db, subject1.Id, lecturer.Id, "Original question");
        await db.SaveChangesAsync();

        var service = new QuestionService(db, NullLogger<QuestionService>.Instance);

        var ex = await Assert.ThrowsAsync<AppException>(() =>
            service.UpdateQuestionAsync(question.Id, new UpdateQuestionRequest
            {
                CategoryId = category2.Id,
                Content = "Updated question",
                Difficulty = "Medium",
                Options = ValidOptions()
            }, lecturer.Id, isAdmin: false));

        Assert.Contains("Category does not belong", ex.Message);
    }

    [Fact]
    public async Task CreateQuestionAsync_AllowsNullCategoryForOwnedSubject()
    {
        await using var db = CreateDbContext();
        var lecturer = AddUser(db, UserRole.Lecturer, "lecturer@example.test");
        var subject = AddSubject(db, lecturer.Id, "S101");
        await db.SaveChangesAsync();

        var service = new QuestionService(db, NullLogger<QuestionService>.Instance);

        var created = await service.CreateQuestionAsync(new CreateQuestionRequest
        {
            SubjectId = subject.Id,
            CategoryId = null,
            Content = "Question without category",
            Difficulty = "Medium",
            Options = ValidOptions()
        }, lecturer.Id);

        Assert.Equal(subject.Id, created.SubjectId);
        Assert.Null(created.CategoryId);
    }

    [Fact]
    public async Task CreateQuestionAsync_RejectsSubjectCreatedByAnotherLecturer()
    {
        await using var db = CreateDbContext();
        var lecturer1 = AddUser(db, UserRole.Lecturer, "lecturer1@example.test");
        var lecturer2 = AddUser(db, UserRole.Lecturer, "lecturer2@example.test");
        var otherSubject = AddSubject(db, lecturer2.Id, "OTH101");
        await db.SaveChangesAsync();

        var service = new QuestionService(db, NullLogger<QuestionService>.Instance);

        await Assert.ThrowsAsync<ForbiddenException>(() =>
            service.CreateQuestionAsync(new CreateQuestionRequest
            {
                SubjectId = otherSubject.Id,
                CategoryId = null,
                Content = "Unauthorized question",
                Difficulty = "Medium",
                Options = ValidOptions()
            }, lecturer1.Id));
    }

    [Fact]
    public async Task CreateExamAsync_RejectsSubjectCreatedByAnotherLecturer()
    {
        await using var db = CreateDbContext();
        var lecturer1 = AddUser(db, UserRole.Lecturer, "lecturer1@example.test");
        var lecturer2 = AddUser(db, UserRole.Lecturer, "lecturer2@example.test");
        var otherSubject = AddSubject(db, lecturer2.Id, "OTH101");
        AddQuestion(db, otherSubject.Id, lecturer2.Id, "Question in another lecturer subject");
        await db.SaveChangesAsync();

        var service = new ExamService(db, NullLogger<ExamService>.Instance);

        await Assert.ThrowsAsync<ForbiddenException>(() =>
            service.CreateExamAsync(new CreateExamRequest
            {
                Title = "Unauthorized exam",
                SubjectId = otherSubject.Id,
                QuestionCount = 1,
                DurationMinutes = 30,
                TotalPoints = 10,
                ShuffleQuestions = true,
                ShuffleOptions = true,
                ShowResultToStudent = true
            }, lecturer1.Id));
    }

    [Fact]
    public async Task StartAttemptAsync_CreatesQuestionAndOptionSnapshots()
    {
        await using var db = CreateDbContext();
        var fixture = await CreateAttemptFixtureAsync(db, questionCount: 1);

        var detail = await fixture.AttemptService.StartAttemptAsync(fixture.Student1Id, new StartAttemptRequest { SessionId = fixture.SessionId }, null, null);

        var attempt = await db.ExamAttempts
            .Include(a => a.QuestionSnapshots)
                .ThenInclude(q => q.OptionSnapshots)
            .SingleAsync(a => a.Id == detail.Attempt.Id);

        Assert.Single(attempt.QuestionSnapshots);
        Assert.Equal(2, attempt.QuestionSnapshots.Single().OptionSnapshots.Count);
    }

    [Fact]
    public async Task SaveAnswerAsync_RejectsOptionSnapshotFromAnotherQuestion()
    {
        await using var db = CreateDbContext();
        var fixture = await CreateAttemptFixtureAsync(db, questionCount: 2);
        var detail = await fixture.AttemptService.StartAttemptAsync(fixture.Student1Id, new StartAttemptRequest { SessionId = fixture.SessionId }, null, null);
        db.ChangeTracker.Clear();

        var firstQuestion = detail.Questions[0];
        var secondQuestionOption = detail.Questions[1].Options[0].Id;

        await Assert.ThrowsAsync<AppException>(() =>
            fixture.AttemptService.SaveAnswerAsync(detail.Attempt.Id, firstQuestion.Id, fixture.Student1Id, new SaveAnswerRequest
            {
                SelectedOptionSnapshotId = secondQuestionOption
            }));
    }

    [Fact]
    public async Task SubmitAttemptAsync_GradesUsingAttemptOptionSnapshotCorrectness()
    {
        await using var db = CreateDbContext();
        var fixture = await CreateAttemptFixtureAsync(db, questionCount: 1);
        var detail = await fixture.AttemptService.StartAttemptAsync(fixture.Student1Id, new StartAttemptRequest { SessionId = fixture.SessionId }, null, null);
        var question = detail.Questions.Single();
        var correctSnapshotOptionId = await db.AttemptOptionSnapshots
            .Where(o => o.QuestionSnapshotId == question.Id && o.IsCorrect)
            .Select(o => o.Id)
            .SingleAsync();

        var originalOptions = await db.QuestionOptions.Where(o => o.QuestionId == fixture.QuestionIds[0]).ToListAsync();
        foreach (var option in originalOptions)
            option.IsCorrect = !option.IsCorrect;
        await db.SaveChangesAsync();
        db.ChangeTracker.Clear();

        await fixture.AttemptService.SaveAnswerAsync(detail.Attempt.Id, question.Id, fixture.Student1Id, new SaveAnswerRequest
        {
            SelectedOptionSnapshotId = correctSnapshotOptionId
        });
        db.ChangeTracker.Clear();

        var summary = await fixture.AttemptService.SubmitAttemptAsync(detail.Attempt.Id, fixture.Student1Id, new SubmitAttemptRequest(), null, null);

        Assert.Equal(1m, summary.Score);
        Assert.Equal(1, summary.CorrectAnswers);
    }

    [Fact]
    public async Task LogEventAsync_AllowsCopyPasteWithoutFlagWhenSettingIsTrue()
    {
        await using var db = CreateDbContext();
        AddSetting(db, "AllowCopyPaste", "true");
        var fixture = await CreateAttemptFixtureAsync(db, questionCount: 1);
        var detail = await fixture.AttemptService.StartAttemptAsync(fixture.Student1Id, new StartAttemptRequest { SessionId = fixture.SessionId }, null, null);
        db.ChangeTracker.Clear();

        await fixture.AttemptService.LogEventAsync(detail.Attempt.Id, fixture.Student1Id, new LogAttemptEventRequest { EventType = "CopyAttempt" }, null, null);
        db.ChangeTracker.Clear();
        var result = await fixture.AttemptService.LogEventAsync(detail.Attempt.Id, fixture.Student1Id, new LogAttemptEventRequest { EventType = "PasteAttempt" }, null, null);

        Assert.False(result.Attempt.IsFlagged);
    }

    [Fact]
    public async Task LogEventAsync_AutoSubmitsWhenTabSwitchLimitExceeded()
    {
        await using var db = CreateDbContext();
        AddSetting(db, "MaxTabSwitches", "2");
        AddSetting(db, "AutoSubmitOnTabLimit", "true");
        var fixture = await CreateAttemptFixtureAsync(db, questionCount: 1);
        var detail = await fixture.AttemptService.StartAttemptAsync(fixture.Student1Id, new StartAttemptRequest { SessionId = fixture.SessionId }, null, null);
        db.ChangeTracker.Clear();

        await fixture.AttemptService.LogEventAsync(detail.Attempt.Id, fixture.Student1Id, new LogAttemptEventRequest { EventType = "TabLeave" }, null, null);
        db.ChangeTracker.Clear();
        var result = await fixture.AttemptService.LogEventAsync(detail.Attempt.Id, fixture.Student1Id, new LogAttemptEventRequest { EventType = "TabLeave" }, null, null);

        Assert.True(result.AutoSubmitted);
        Assert.Equal(AttemptStatus.AutoSubmitted.ToString(), result.Attempt.Status);
    }

    [Fact]
    public async Task SaveAnswerAsync_FlagsAfterMultipleRapidAnswers()
    {
        await using var db = CreateDbContext();
        AddSetting(db, "RapidAnswerThresholdSeconds", "60");
        var fixture = await CreateAttemptFixtureAsync(db, questionCount: 3);
        var detail = await fixture.AttemptService.StartAttemptAsync(fixture.Student1Id, new StartAttemptRequest { SessionId = fixture.SessionId }, null, null);

        foreach (var question in detail.Questions)
        {
            db.ChangeTracker.Clear();
            await fixture.AttemptService.SaveAnswerAsync(detail.Attempt.Id, question.Id, fixture.Student1Id, new SaveAnswerRequest
            {
                SelectedOptionSnapshotId = question.Options[0].Id
            });
        }

        var attempt = await db.ExamAttempts.SingleAsync(a => a.Id == detail.Attempt.Id);
        Assert.True(attempt.IsFlagged);
        Assert.Contains("Rapid answers detected", attempt.FlagReason);
    }

    [Fact]
    public async Task StartAttemptAsync_MaxParticipantsCountsOnlyInProgressAttempts()
    {
        await using var db = CreateDbContext();
        var fixture = await CreateAttemptFixtureAsync(db, questionCount: 1, maxParticipants: 1);
        var firstAttempt = await fixture.AttemptService.StartAttemptAsync(fixture.Student1Id, new StartAttemptRequest { SessionId = fixture.SessionId }, null, null);
        db.ChangeTracker.Clear();
        await fixture.AttemptService.SubmitAttemptAsync(firstAttempt.Attempt.Id, fixture.Student1Id, new SubmitAttemptRequest(), null, null);
        db.ChangeTracker.Clear();

        var secondAttempt = await fixture.AttemptService.StartAttemptAsync(fixture.Student2Id, new StartAttemptRequest { SessionId = fixture.SessionId }, null, null);

        Assert.Equal(fixture.Student2Id, secondAttempt.Attempt.StudentId);
    }

    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"examguard-tests-{Guid.NewGuid()}")
            .Options;

        return new AppDbContext(options);
    }

    private static AuthService CreateAuthService(AppDbContext db)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["JwtSettings:Secret"] = "ExamGuard-Test-Secret-Key-For-JWT-AtLeast32Characters!!",
                ["JwtSettings:Issuer"] = "ExamGuard.Tests",
                ["JwtSettings:Audience"] = "ExamGuard.Tests",
                ["JwtSettings:AccessTokenExpirationMinutes"] = "15",
                ["JwtSettings:RefreshTokenExpirationDays"] = "7"
            })
            .Build();

        return new AuthService(db, configuration, NullLogger<AuthService>.Instance);
    }

    private static async Task<AttemptFixture> CreateAttemptFixtureAsync(AppDbContext db, int questionCount, int? maxParticipants = null)
    {
        AddDefaultAttemptSettings(db);

        var lecturer = AddUser(db, UserRole.Lecturer, $"lecturer-{Guid.NewGuid():N}@example.test");
        var student1 = AddUser(db, UserRole.Student, $"student1-{Guid.NewGuid():N}@example.test");
        var student2 = AddUser(db, UserRole.Student, $"student2-{Guid.NewGuid():N}@example.test");
        var subject = AddSubject(db, lecturer.Id, "EXAM101");

        var questionIds = new List<Guid>();
        for (var i = 0; i < questionCount; i++)
            questionIds.Add(AddQuestion(db, subject.Id, lecturer.Id, $"Question {i + 1}").Id);

        var exam = new Exam
        {
            Id = Guid.NewGuid(),
            Title = "Online Exam",
            SubjectId = subject.Id,
            CreatedById = lecturer.Id,
            QuestionCount = questionCount,
            DurationMinutes = 60,
            TotalPoints = questionCount,
            ShuffleQuestions = false,
            ShuffleOptions = false,
            ShowResultToStudent = true,
            Status = ExamStatus.Published
        };

        var session = new ExamSession
        {
            Id = Guid.NewGuid(),
            ExamId = exam.Id,
            Name = "Main session",
            StartTime = DateTime.UtcNow.AddMinutes(-5),
            EndTime = DateTime.UtcNow.AddMinutes(55),
            MaxParticipants = maxParticipants,
            Status = SessionStatus.Scheduled
        };

        db.Exams.Add(exam);
        db.ExamSessions.Add(session);
        await db.SaveChangesAsync();

        return new AttemptFixture(
            new AttemptService(db, NullLogger<AttemptService>.Instance),
            session.Id,
            student1.Id,
            student2.Id,
            questionIds);
    }

    private static User AddUser(AppDbContext db, UserRole role, string email, string password = "Password123!", UserStatus status = UserStatus.Active)
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            FullName = email,
            Role = role,
            Status = status,
            StudentCode = role == UserRole.Student ? Guid.NewGuid().ToString("N")[..8] : null
        };

        db.Users.Add(user);
        return user;
    }

    private static Subject AddSubject(AppDbContext db, Guid createdById, string code)
    {
        var subject = new Subject
        {
            Id = Guid.NewGuid(),
            Code = code,
            Name = code,
            CreatedById = createdById,
            IsActive = true
        };

        db.Subjects.Add(subject);
        return subject;
    }

    private static QuestionCategory AddCategory(AppDbContext db, Guid subjectId, string name)
    {
        var category = new QuestionCategory
        {
            Id = Guid.NewGuid(),
            SubjectId = subjectId,
            Name = name
        };

        db.QuestionCategories.Add(category);
        return category;
    }

    private static Question AddQuestion(AppDbContext db, Guid subjectId, Guid createdById, string content)
    {
        var question = new Question
        {
            Id = Guid.NewGuid(),
            SubjectId = subjectId,
            CreatedById = createdById,
            Content = content,
            Difficulty = Difficulty.Medium,
            IsActive = true
        };

        question.Options.Add(new QuestionOption
        {
            Id = Guid.NewGuid(),
            QuestionId = question.Id,
            Label = "A",
            Content = "Correct",
            IsCorrect = true,
            SortOrder = 0
        });
        question.Options.Add(new QuestionOption
        {
            Id = Guid.NewGuid(),
            QuestionId = question.Id,
            Label = "B",
            Content = "Wrong",
            IsCorrect = false,
            SortOrder = 1
        });

        db.Questions.Add(question);
        return question;
    }

    private static List<CreateOptionRequest> ValidOptions() =>
    [
        new() { Label = "A", Content = "Correct", IsCorrect = true },
        new() { Label = "B", Content = "Wrong", IsCorrect = false }
    ];

    private static void AddDefaultAttemptSettings(AppDbContext db)
    {
        AddSettingIfMissing(db, "MaxTabSwitches", "3");
        AddSettingIfMissing(db, "AutoSubmitOnTabLimit", "false");
        AddSettingIfMissing(db, "AllowCopyPaste", "false");
        AddSettingIfMissing(db, "RapidAnswerThresholdSeconds", "3");
    }

    private static void AddSetting(AppDbContext db, string key, string value)
    {
        var existing = db.SystemSettings.Local.FirstOrDefault(s => s.Key == key);
        if (existing != null)
        {
            existing.Value = value;
            return;
        }

        db.SystemSettings.Add(new SystemSetting
        {
            Key = key,
            Value = value,
            Description = key,
            UpdatedAt = DateTime.UtcNow
        });
    }

    private static void AddSettingIfMissing(AppDbContext db, string key, string value)
    {
        if (db.SystemSettings.Local.Any(s => s.Key == key))
            return;

        AddSetting(db, key, value);
    }

    private static string ComputeTokenHash(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(bytes);
    }

    private sealed record AttemptFixture(
        AttemptService AttemptService,
        Guid SessionId,
        Guid Student1Id,
        Guid Student2Id,
        List<Guid> QuestionIds);
}

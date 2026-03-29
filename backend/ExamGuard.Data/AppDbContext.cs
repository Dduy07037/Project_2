using ExamGuard.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace ExamGuard.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // ─── Core Tables ───
    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Subject> Subjects => Set<Subject>();
    public DbSet<QuestionCategory> QuestionCategories => Set<QuestionCategory>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<QuestionOption> QuestionOptions => Set<QuestionOption>();

    // ─── Exam Tables ───
    public DbSet<Exam> Exams => Set<Exam>();
    public DbSet<ExamSession> ExamSessions => Set<ExamSession>();

    // ─── Attempt Tables ───
    public DbSet<ExamAttempt> ExamAttempts => Set<ExamAttempt>();
    public DbSet<AttemptQuestionSnapshot> AttemptQuestionSnapshots => Set<AttemptQuestionSnapshot>();
    public DbSet<AttemptOptionSnapshot> AttemptOptionSnapshots => Set<AttemptOptionSnapshot>();
    public DbSet<AttemptAnswer> AttemptAnswers => Set<AttemptAnswer>();
    public DbSet<AttemptEventLog> AttemptEventLogs => Set<AttemptEventLog>();

    // ─── System ───
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all IEntityTypeConfiguration classes from this assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}

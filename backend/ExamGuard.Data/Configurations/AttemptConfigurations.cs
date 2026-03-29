using ExamGuard.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ExamGuard.Data.Configurations;

public class ExamAttemptConfiguration : IEntityTypeConfiguration<ExamAttempt>
{
    public void Configure(EntityTypeBuilder<ExamAttempt> builder)
    {
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(a => a.SubmitType).HasConversion<string>().HasMaxLength(20);
        builder.Property(a => a.IpAddress).HasMaxLength(50);
        builder.Property(a => a.UserAgent).HasMaxLength(500);
        builder.Property(a => a.FlagReason).HasMaxLength(1000);
        builder.Property(a => a.Score).HasPrecision(5, 2);

        // ★ Anti-cheat constraint: only one InProgress attempt per student per session
        builder.HasIndex(a => new { a.SessionId, a.StudentId })
            .HasFilter("\"Status\" = 'InProgress'")
            .IsUnique()
            .HasDatabaseName("IX_ExamAttempts_SingleActive");

        builder.HasOne(a => a.Exam).WithMany().HasForeignKey(a => a.ExamId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(a => a.Session).WithMany(s => s.Attempts).HasForeignKey(a => a.SessionId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(a => a.Student).WithMany(u => u.Attempts).HasForeignKey(a => a.StudentId).OnDelete(DeleteBehavior.Restrict);
    }
}

public class AttemptQuestionSnapshotConfiguration : IEntityTypeConfiguration<AttemptQuestionSnapshot>
{
    public void Configure(EntityTypeBuilder<AttemptQuestionSnapshot> builder)
    {
        builder.HasKey(q => q.Id);
        builder.Property(q => q.Content).IsRequired();
        builder.Property(q => q.PointValue).HasPrecision(5, 2);
        builder.HasOne(q => q.Attempt).WithMany(a => a.QuestionSnapshots).HasForeignKey(q => q.AttemptId).OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(q => new { q.AttemptId, q.SortOrder });
    }
}

public class AttemptOptionSnapshotConfiguration : IEntityTypeConfiguration<AttemptOptionSnapshot>
{
    public void Configure(EntityTypeBuilder<AttemptOptionSnapshot> builder)
    {
        builder.HasKey(o => o.Id);
        builder.Property(o => o.Label).HasMaxLength(5).IsRequired();
        builder.Property(o => o.Content).IsRequired();
        builder.HasOne(o => o.QuestionSnapshot).WithMany(q => q.OptionSnapshots).HasForeignKey(o => o.QuestionSnapshotId).OnDelete(DeleteBehavior.Cascade);
    }
}

public class AttemptAnswerConfiguration : IEntityTypeConfiguration<AttemptAnswer>
{
    public void Configure(EntityTypeBuilder<AttemptAnswer> builder)
    {
        builder.HasKey(a => a.Id);

        // One answer per question per attempt
        builder.HasIndex(a => new { a.AttemptId, a.QuestionSnapshotId }).IsUnique();

        builder.HasOne(a => a.Attempt).WithMany(at => at.Answers).HasForeignKey(a => a.AttemptId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(a => a.QuestionSnapshot).WithOne(q => q.Answer).HasForeignKey<AttemptAnswer>(a => a.QuestionSnapshotId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(a => a.SelectedOptionSnapshot).WithMany().HasForeignKey(a => a.SelectedOptionSnapshotId).OnDelete(DeleteBehavior.Restrict);
    }
}

public class AttemptEventLogConfiguration : IEntityTypeConfiguration<AttemptEventLog>
{
    public void Configure(EntityTypeBuilder<AttemptEventLog> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.EventType).HasConversion<string>().HasMaxLength(30);
        builder.Property(e => e.IpAddress).HasMaxLength(50);
        builder.Property(e => e.UserAgent).HasMaxLength(500);
        builder.Property(e => e.Details).HasMaxLength(2000);
        builder.HasOne(e => e.Attempt).WithMany(a => a.EventLogs).HasForeignKey(e => e.AttemptId).OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(e => new { e.AttemptId, e.Timestamp });
    }
}

public class SystemSettingConfiguration : IEntityTypeConfiguration<SystemSetting>
{
    public void Configure(EntityTypeBuilder<SystemSetting> builder)
    {
        builder.HasKey(s => s.Key);
        builder.Property(s => s.Key).HasMaxLength(100);
        builder.Property(s => s.Value).HasMaxLength(500).IsRequired();
        builder.Property(s => s.Description).HasMaxLength(500);
    }
}

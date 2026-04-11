using ExamGuard.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ExamGuard.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);
        builder.Property(u => u.Email).HasMaxLength(256).IsRequired();
        builder.HasIndex(u => u.Email).IsUnique();
        builder.Property(u => u.PasswordHash).IsRequired();
        builder.Property(u => u.FullName).HasMaxLength(200).IsRequired();
        builder.Property(u => u.StudentCode).HasMaxLength(20);
        builder.Property(u => u.Department).HasMaxLength(100);
        builder.Property(u => u.Role).HasConversion<string>().HasMaxLength(20);
        builder.Property(u => u.Status).HasConversion<string>().HasMaxLength(20);
    }
}

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.HasKey(r => r.Id);
        builder.Property(r => r.TokenHash).HasMaxLength(128).IsRequired();
        builder.Property(r => r.CreatedByIp).HasMaxLength(50);
        builder.Property(r => r.CreatedByUserAgent).HasMaxLength(500);
        builder.Property(r => r.LastUsedByIp).HasMaxLength(50);
        builder.Property(r => r.LastUsedByUserAgent).HasMaxLength(500);
        builder.Property(r => r.RevokedByIp).HasMaxLength(50);
        builder.Property(r => r.RevocationReason).HasMaxLength(200);
        builder.Property(r => r.ReplacedByTokenHash).HasMaxLength(128);
        builder.HasIndex(r => r.TokenHash).IsUnique();
        builder.HasIndex(r => new { r.UserId, r.SessionId });
        builder.HasOne(r => r.User).WithMany(u => u.RefreshTokens).HasForeignKey(r => r.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}

public class SubjectConfiguration : IEntityTypeConfiguration<Subject>
{
    public void Configure(EntityTypeBuilder<Subject> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Code).HasMaxLength(20).IsRequired();
        builder.HasIndex(s => s.Code).IsUnique();
        builder.Property(s => s.Name).HasMaxLength(200).IsRequired();
        builder.Property(s => s.Department).HasMaxLength(100);
        builder.HasOne(s => s.CreatedBy).WithMany(u => u.CreatedSubjects).HasForeignKey(s => s.CreatedById).OnDelete(DeleteBehavior.Restrict);
    }
}

public class QuestionCategoryConfiguration : IEntityTypeConfiguration<QuestionCategory>
{
    public void Configure(EntityTypeBuilder<QuestionCategory> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Name).HasMaxLength(200).IsRequired();
        builder.HasOne(c => c.Subject).WithMany(s => s.Categories).HasForeignKey(c => c.SubjectId).OnDelete(DeleteBehavior.Cascade);
    }
}

public class QuestionConfiguration : IEntityTypeConfiguration<Question>
{
    public void Configure(EntityTypeBuilder<Question> builder)
    {
        builder.HasKey(q => q.Id);
        builder.Property(q => q.Content).IsRequired();
        builder.Property(q => q.Difficulty).HasConversion<string>().HasMaxLength(10);
        builder.HasOne(q => q.Subject).WithMany(s => s.Questions).HasForeignKey(q => q.SubjectId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(q => q.Category).WithMany(c => c.Questions).HasForeignKey(q => q.CategoryId).OnDelete(DeleteBehavior.SetNull);
        builder.HasOne(q => q.CreatedBy).WithMany(u => u.CreatedQuestions).HasForeignKey(q => q.CreatedById).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(q => new { q.SubjectId, q.IsActive });
    }
}

public class QuestionOptionConfiguration : IEntityTypeConfiguration<QuestionOption>
{
    public void Configure(EntityTypeBuilder<QuestionOption> builder)
    {
        builder.HasKey(o => o.Id);
        builder.Property(o => o.Label).HasMaxLength(5).IsRequired();
        builder.Property(o => o.Content).IsRequired();
        builder.HasOne(o => o.Question).WithMany(q => q.Options).HasForeignKey(o => o.QuestionId).OnDelete(DeleteBehavior.Cascade);
    }
}

using ExamGuard.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ExamGuard.Data.Configurations;

public class ExamConfiguration : IEntityTypeConfiguration<Exam>
{
    public void Configure(EntityTypeBuilder<Exam> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Title).HasMaxLength(300).IsRequired();
        builder.Property(e => e.Description).HasMaxLength(2000);
        builder.Property(e => e.TotalPoints).HasPrecision(5, 2);
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);
        builder.HasOne(e => e.Subject).WithMany(s => s.Exams).HasForeignKey(e => e.SubjectId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(e => e.CreatedBy).WithMany(u => u.CreatedExams).HasForeignKey(e => e.CreatedById).OnDelete(DeleteBehavior.Restrict);
    }
}

public class ExamSessionConfiguration : IEntityTypeConfiguration<ExamSession>
{
    public void Configure(EntityTypeBuilder<ExamSession> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Name).HasMaxLength(100).IsRequired();
        builder.Property(s => s.Password).HasMaxLength(50);
        builder.Property(s => s.Status).HasConversion<string>().HasMaxLength(20);
        builder.HasOne(s => s.Exam).WithMany(e => e.Sessions).HasForeignKey(s => s.ExamId).OnDelete(DeleteBehavior.Cascade);
    }
}

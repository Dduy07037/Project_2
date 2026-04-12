using ExamGuard.Core.DTOs.Activity;
using ExamGuard.Core.Interfaces;
using ExamGuard.Data;
using Microsoft.EntityFrameworkCore;

namespace ExamGuard.Service.Services;

public class ActivityService : IActivityService
{
    private readonly AppDbContext _db;

    public ActivityService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<ActivityItemDto>> GetRecentActivityAsync(int limit)
    {
        limit = Math.Clamp(limit, 1, 200);
        var activities = new List<ActivityItemDto>();

        var users = await _db.Users
            .AsNoTracking()
            .OrderByDescending(u => u.CreatedAt)
            .Take(limit)
            .ToListAsync();

        activities.AddRange(users.Select(user => new ActivityItemDto
        {
            Id = $"user-created-{user.Id}",
            UserName = "System",
            UserRole = "System",
            Action = "Created user",
            Target = user.FullName,
            Details = user.Email,
            Timestamp = user.CreatedAt,
            Severity = "info"
        }));

        activities.AddRange(users
            .Where(user => user.LastLoginAt.HasValue)
            .Select(user => new ActivityItemDto
            {
                Id = $"user-login-{user.Id}",
                UserName = user.FullName,
                UserRole = user.Role.ToString(),
                Action = "Signed in",
                Target = user.Email,
                Timestamp = user.LastLoginAt!.Value,
                Severity = "success"
            }));

        var subjects = await _db.Subjects
            .AsNoTracking()
            .Include(subject => subject.CreatedBy)
            .OrderByDescending(subject => subject.CreatedAt)
            .Take(limit)
            .ToListAsync();

        activities.AddRange(subjects.Select(subject => new ActivityItemDto
        {
            Id = $"subject-created-{subject.Id}",
            UserName = subject.CreatedBy.FullName,
            UserRole = subject.CreatedBy.Role.ToString(),
            Action = "Created subject",
            Target = $"{subject.Code} - {subject.Name}",
            Details = subject.Department,
            Timestamp = subject.CreatedAt,
            Severity = "info"
        }));

        var exams = await _db.Exams
            .AsNoTracking()
            .Include(exam => exam.CreatedBy)
            .Include(exam => exam.Subject)
            .OrderByDescending(exam => exam.UpdatedAt)
            .Take(limit)
            .ToListAsync();

        activities.AddRange(exams.Select(exam => new ActivityItemDto
        {
            Id = $"exam-{exam.Id}",
            UserName = exam.CreatedBy.FullName,
            UserRole = exam.CreatedBy.Role.ToString(),
            Action = exam.Status.ToString() == "Published" ? "Published exam" : "Updated exam",
            Target = exam.Title,
            Details = exam.Subject.Name,
            Timestamp = exam.UpdatedAt,
            Severity = exam.Status.ToString() == "Published" ? "success" : "info"
        }));

        var attempts = await _db.ExamAttempts
            .AsNoTracking()
            .Include(attempt => attempt.Student)
            .Include(attempt => attempt.Exam)
            .Where(attempt => attempt.SubmittedAt.HasValue || attempt.IsFlagged)
            .OrderByDescending(attempt => attempt.SubmittedAt ?? attempt.CreatedAt)
            .Take(limit)
            .ToListAsync();

        activities.AddRange(attempts.Select(attempt => new ActivityItemDto
        {
            Id = $"attempt-{attempt.Id}",
            UserName = attempt.Student.FullName,
            UserRole = attempt.Student.Role.ToString(),
            Action = attempt.IsFlagged ? "Flagged attempt" : "Submitted attempt",
            Target = attempt.Exam.Title,
            Details = attempt.FlagReason ?? attempt.SubmitType?.ToString(),
            Timestamp = attempt.SubmittedAt ?? attempt.CreatedAt,
            Severity = attempt.IsFlagged ? "warning" : "success"
        }));

        return activities
            .OrderByDescending(activity => activity.Timestamp)
            .Take(limit)
            .ToList();
    }
}

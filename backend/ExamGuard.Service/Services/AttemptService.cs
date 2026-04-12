using ExamGuard.Core.DTOs.Attempt;
using ExamGuard.Core.Entities;
using ExamGuard.Core.Enums;
using ExamGuard.Core.Exceptions;
using ExamGuard.Core.Interfaces;
using ExamGuard.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ExamGuard.Service.Services;

public class AttemptService : IAttemptService
{
    private static readonly string[] OptionLabels = ["A", "B", "C", "D", "E", "F"];

    private readonly AppDbContext _db;
    private readonly ILogger<AttemptService> _logger;

    public AttemptService(AppDbContext db, ILogger<AttemptService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<AttemptDetailDto> StartAttemptAsync(Guid studentId, StartAttemptRequest request, string? ipAddress, string? userAgent)
    {
        var session = await _db.ExamSessions
            .Include(s => s.Exam)
                .ThenInclude(e => e.Subject)
            .FirstOrDefaultAsync(s => s.Id == request.SessionId)
            ?? throw new NotFoundException("ExamSession", request.SessionId);

        var now = DateTime.UtcNow;
        if (now < session.StartTime)
            throw new AppException("This exam session has not started yet.");

        if (now >= session.EndTime)
            throw new AppException("This exam session has already ended.");

        if (!string.IsNullOrWhiteSpace(session.Password) && session.Password != request.Password)
            throw new AppException("Invalid exam session password.");

        var existingAttemptId = await _db.ExamAttempts
            .Where(a => a.SessionId == session.Id && a.StudentId == studentId)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => a.Id)
            .FirstOrDefaultAsync();

        if (existingAttemptId != Guid.Empty)
        {
            var existingAttempt = await LoadAttemptGraphAsync(existingAttemptId);
            await EnsureSubmittedIfExpiredAsync(existingAttempt, ipAddress, userAgent);

            if (existingAttempt.Status != AttemptStatus.InProgress)
                throw new ConflictException("You have already completed this exam session.");

            return await BuildAttemptDetailAsync(existingAttempt, hideResults: true);
        }

        if (session.MaxParticipants.HasValue)
        {
            var currentParticipants = await _db.ExamAttempts.CountAsync(a => a.SessionId == session.Id);
            if (currentParticipants >= session.MaxParticipants.Value)
                throw new ConflictException("This exam session has reached its participant limit.");
        }

        var selectedQuestions = await SelectQuestionsForExamAsync(session.Exam);
        var pointValue = session.Exam.QuestionCount == 0
            ? 0m
            : decimal.Round(session.Exam.TotalPoints / session.Exam.QuestionCount, 2, MidpointRounding.AwayFromZero);

        var attempt = new ExamAttempt
        {
            Id = Guid.NewGuid(),
            ExamId = session.ExamId,
            SessionId = session.Id,
            StudentId = studentId,
            StartedAt = now,
            Status = AttemptStatus.InProgress,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            TotalQuestions = selectedQuestions.Count,
            CreatedAt = now,
        };

        for (int i = 0; i < selectedQuestions.Count; i++)
        {
            var question = selectedQuestions[i];
            var questionSnapshotId = Guid.NewGuid();

            var questionSnapshot = new AttemptQuestionSnapshot
            {
                Id = questionSnapshotId,
                AttemptId = attempt.Id,
                OriginalQuestionId = question.Id,
                SortOrder = i,
                Content = question.Content,
                PointValue = pointValue
            };

            var options = question.Options.OrderBy(o => o.SortOrder).ToList();
            if (session.Exam.ShuffleOptions)
                Shuffle(options);

            for (int optionIndex = 0; optionIndex < options.Count; optionIndex++)
            {
                var option = options[optionIndex];
                questionSnapshot.OptionSnapshots.Add(new AttemptOptionSnapshot
                {
                    Id = Guid.NewGuid(),
                    QuestionSnapshotId = questionSnapshotId,
                    OriginalOptionId = option.Id,
                    Label = session.Exam.ShuffleOptions
                        ? GetOptionLabel(optionIndex)
                        : option.Label,
                    Content = option.Content,
                    SortOrder = optionIndex,
                    IsCorrect = option.IsCorrect
                });
            }

            attempt.QuestionSnapshots.Add(questionSnapshot);
            attempt.Answers.Add(new AttemptAnswer
            {
                Id = Guid.NewGuid(),
                AttemptId = attempt.Id,
                QuestionSnapshotId = questionSnapshotId
            });
        }

        attempt.EventLogs.Add(new AttemptEventLog
        {
            Id = Guid.NewGuid(),
            AttemptId = attempt.Id,
            EventType = AttemptEventType.ExamStart,
            Timestamp = now,
            ClientTimestamp = now,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            Details = $"Session {session.Name}"
        });

        _db.ExamAttempts.Add(attempt);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Attempt {AttemptId} created for student {StudentId} in session {SessionId}.", attempt.Id, studentId, session.Id);

        var createdAttempt = await LoadAttemptGraphAsync(attempt.Id);
        return await BuildAttemptDetailAsync(createdAttempt, hideResults: true);
    }

    public async Task<AttemptDetailDto> GetAttemptDetailAsync(Guid attemptId, Guid currentUserId, bool isAdmin, bool isLecturer)
    {
        var attempt = await LoadAttemptGraphAsync(attemptId);
        var isOwner = attempt.StudentId == currentUserId;
        var canReview = isAdmin || (isLecturer && attempt.Exam.CreatedById == currentUserId);

        if (!isOwner && !canReview)
            throw new ForbiddenException("You do not have permission to view this attempt.");

        if (isOwner && attempt.Status == AttemptStatus.InProgress)
            await EnsureSubmittedIfExpiredAsync(attempt, attempt.IpAddress, attempt.UserAgent);

        return await BuildAttemptDetailAsync(attempt, hideResults: isOwner && !attempt.Exam.ShowResultToStudent);
    }

    public async Task<AttemptAnswerUpdateDto> SaveAnswerAsync(Guid attemptId, Guid questionSnapshotId, Guid studentId, SaveAnswerRequest request)
    {
        var attempt = await LoadAttemptGraphAsync(attemptId);
        EnsureStudentOwnsAttempt(attempt, studentId);

        if (attempt.Status != AttemptStatus.InProgress)
            throw new AppException("This attempt is already submitted.");

        if (await EnsureSubmittedIfExpiredAsync(attempt, attempt.IpAddress, attempt.UserAgent))
            throw new AppException("This attempt has expired and was auto-submitted.");

        var questionSnapshot = attempt.QuestionSnapshots.FirstOrDefault(q => q.Id == questionSnapshotId)
            ?? throw new NotFoundException("AttemptQuestionSnapshot", questionSnapshotId);

        if (request.SelectedOptionSnapshotId.HasValue
            && questionSnapshot.OptionSnapshots.All(option => option.Id != request.SelectedOptionSnapshotId.Value))
        {
            throw new AppException("Selected option does not belong to this question.");
        }

        var answer = attempt.Answers.FirstOrDefault(a => a.QuestionSnapshotId == questionSnapshotId);
        if (answer == null)
        {
            answer = new AttemptAnswer
            {
                Id = Guid.NewGuid(),
                AttemptId = attempt.Id,
                QuestionSnapshotId = questionSnapshotId
            };
            attempt.Answers.Add(answer);
        }

        var previousSelection = answer.SelectedOptionSnapshotId;
        answer.SelectedOptionSnapshotId = request.SelectedOptionSnapshotId;
        answer.AnsweredAt = DateTime.UtcNow;

        if (previousSelection.HasValue
            && request.SelectedOptionSnapshotId.HasValue
            && previousSelection.Value != request.SelectedOptionSnapshotId.Value)
        {
            attempt.EventLogs.Add(new AttemptEventLog
            {
                Id = Guid.NewGuid(),
                AttemptId = attempt.Id,
                EventType = AttemptEventType.AnswerChanged,
                Timestamp = DateTime.UtcNow,
                ClientTimestamp = request.ClientTimestamp,
                IpAddress = attempt.IpAddress,
                UserAgent = attempt.UserAgent,
                Details = $"QuestionSnapshot:{questionSnapshotId}"
            });
        }

        await _db.SaveChangesAsync();

        return new AttemptAnswerUpdateDto
        {
            AttemptId = attempt.Id,
            QuestionSnapshotId = questionSnapshotId,
            SelectedOptionSnapshotId = answer.SelectedOptionSnapshotId,
            AnsweredAt = answer.AnsweredAt,
            AnsweredQuestions = attempt.Answers.Count(a => a.SelectedOptionSnapshotId.HasValue)
        };
    }

    public async Task<AttemptEventResultDto> LogEventAsync(Guid attemptId, Guid studentId, LogAttemptEventRequest request, string? ipAddress, string? userAgent)
    {
        var attempt = await LoadAttemptGraphAsync(attemptId);
        EnsureStudentOwnsAttempt(attempt, studentId);

        if (attempt.Status != AttemptStatus.InProgress)
        {
            return new AttemptEventResultDto
            {
                Attempt = MapSummary(attempt, hideResults: !attempt.Exam.ShowResultToStudent),
                AutoSubmitted = attempt.Status == AttemptStatus.AutoSubmitted,
                RecentEvents = MapRecentEvents(attempt)
            };
        }

        if (await EnsureSubmittedIfExpiredAsync(attempt, ipAddress, userAgent))
        {
            return new AttemptEventResultDto
            {
                Attempt = MapSummary(attempt, hideResults: !attempt.Exam.ShowResultToStudent),
                AutoSubmitted = true,
                RecentEvents = MapRecentEvents(attempt)
            };
        }

        if (!Enum.TryParse<AttemptEventType>(request.EventType, true, out var eventType))
            throw new AppException($"Unsupported attempt event type '{request.EventType}'.");

        var policy = await GetAttemptPolicyAsync();
        var now = DateTime.UtcNow;

        attempt.EventLogs.Add(new AttemptEventLog
        {
            Id = Guid.NewGuid(),
            AttemptId = attempt.Id,
            EventType = eventType,
            Timestamp = now,
            ClientTimestamp = request.ClientTimestamp,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            Details = request.Details
        });

        if (eventType == AttemptEventType.TabLeave)
            attempt.TabSwitchCount++;

        if (eventType == AttemptEventType.PageReload)
            attempt.ReloadCount++;

        if (eventType is AttemptEventType.CopyAttempt
            or AttemptEventType.PasteAttempt
            or AttemptEventType.RightClick
            or AttemptEventType.PageReload
            or AttemptEventType.ConcurrentLogin)
        {
            FlagAttempt(attempt, request.Details ?? eventType.ToString());
        }

        if (attempt.TabSwitchCount >= policy.MaxTabSwitches && policy.MaxTabSwitches > 0)
            FlagAttempt(attempt, $"Tab switch count reached {attempt.TabSwitchCount}.");

        await _db.SaveChangesAsync();

        var autoSubmitted = policy.AutoSubmitOnTabLimit
            && policy.MaxTabSwitches > 0
            && attempt.TabSwitchCount >= policy.MaxTabSwitches;

        if (autoSubmitted)
        {
            FlagAttempt(attempt, "Auto-submitted due to tab switch limit.");
            await SubmitAttemptInternalAsync(attempt, SubmitType.Auto, ipAddress, userAgent, request.ClientTimestamp);
        }

        return new AttemptEventResultDto
        {
            Attempt = MapSummary(attempt, hideResults: !attempt.Exam.ShowResultToStudent),
            AutoSubmitted = autoSubmitted,
            RecentEvents = MapRecentEvents(attempt)
        };
    }

    public async Task<AttemptSummaryDto> SubmitAttemptAsync(Guid attemptId, Guid studentId, SubmitAttemptRequest request, string? ipAddress, string? userAgent)
    {
        var attempt = await LoadAttemptGraphAsync(attemptId);
        EnsureStudentOwnsAttempt(attempt, studentId);

        if (attempt.Status != AttemptStatus.InProgress)
            return MapSummary(attempt, hideResults: !attempt.Exam.ShowResultToStudent);

        var submitType = Enum.TryParse<SubmitType>(request.SubmitType, true, out var parsedSubmitType)
            ? parsedSubmitType
            : SubmitType.Manual;

        await SubmitAttemptInternalAsync(attempt, submitType, ipAddress, userAgent, request.ClientTimestamp);
        return MapSummary(attempt, hideResults: !attempt.Exam.ShowResultToStudent);
    }

    public async Task<List<AttemptSummaryDto>> GetStudentHistoryAsync(Guid studentId)
    {
        var attempts = await _db.ExamAttempts
            .AsNoTracking()
            .Include(a => a.Exam)
                .ThenInclude(e => e.Subject)
            .Include(a => a.Session)
            .Include(a => a.Student)
            .Include(a => a.Answers)
            .Where(a => a.StudentId == studentId)
            .OrderByDescending(a => a.StartedAt)
            .ToListAsync();

        return attempts
            .Select(attempt => MapSummary(attempt, hideResults: !attempt.Exam.ShowResultToStudent))
            .ToList();
    }

    public async Task<List<MonitoringAttemptDto>> GetMonitoringAttemptsAsync(Guid currentUserId, bool isAdmin, MonitoringFilterParams filter)
    {
        filter.Limit = Math.Clamp(filter.Limit, 1, 200);

        var query = _db.ExamAttempts
            .AsNoTracking()
            .Include(a => a.Exam)
                .ThenInclude(e => e.Subject)
            .Include(a => a.Session)
            .Include(a => a.Student)
            .Include(a => a.Answers)
            .Include(a => a.EventLogs)
            .AsQueryable();

        if (!isAdmin)
            query = query.Where(a => a.Exam.CreatedById == currentUserId);

        if (filter.ExamId.HasValue)
            query = query.Where(a => a.ExamId == filter.ExamId.Value);

        if (filter.SessionId.HasValue)
            query = query.Where(a => a.SessionId == filter.SessionId.Value);

        if (filter.FlaggedOnly)
            query = query.Where(a => a.IsFlagged || a.TabSwitchCount > 0 || a.ReloadCount > 0);

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim().ToLowerInvariant();
            query = query.Where(a =>
                a.Student.FullName.ToLower().Contains(search)
                || (a.Student.StudentCode != null && a.Student.StudentCode.ToLower().Contains(search))
                || a.Exam.Title.ToLower().Contains(search));
        }

        var attempts = await query
            .OrderByDescending(a => a.StartedAt)
            .Take(filter.Limit)
            .ToListAsync();

        return attempts.Select(attempt => new MonitoringAttemptDto
        {
            Attempt = MapSummary(attempt, hideResults: false),
            RecentEvents = MapRecentEvents(attempt)
        }).ToList();
    }

    private async Task<List<Question>> SelectQuestionsForExamAsync(Exam exam)
    {
        var questions = await _db.Questions
            .AsNoTracking()
            .Include(q => q.Options)
            .Where(q => q.SubjectId == exam.SubjectId && q.IsActive)
            .ToListAsync();

        if (questions.Count < exam.QuestionCount)
            throw new AppException($"Question bank only has {questions.Count} active questions for this exam.");

        if (exam.ShuffleQuestions)
            Shuffle(questions);

        return questions
            .Take(exam.QuestionCount)
            .ToList();
    }

    private async Task<ExamAttempt> LoadAttemptGraphAsync(Guid attemptId)
    {
        return await _db.ExamAttempts
            .Include(a => a.Exam)
                .ThenInclude(e => e.Subject)
            .Include(a => a.Session)
            .Include(a => a.Student)
            .Include(a => a.QuestionSnapshots)
                .ThenInclude(q => q.OptionSnapshots)
            .Include(a => a.Answers)
            .Include(a => a.EventLogs)
            .FirstOrDefaultAsync(a => a.Id == attemptId)
            ?? throw new NotFoundException("ExamAttempt", attemptId);
    }

    private async Task<bool> EnsureSubmittedIfExpiredAsync(ExamAttempt attempt, string? ipAddress, string? userAgent)
    {
        if (attempt.Status != AttemptStatus.InProgress)
            return false;

        if (DateTime.UtcNow < GetExpiresAt(attempt))
            return false;

        await SubmitAttemptInternalAsync(attempt, SubmitType.Auto, ipAddress, userAgent, DateTime.UtcNow);
        return true;
    }

    private async Task SubmitAttemptInternalAsync(ExamAttempt attempt, SubmitType submitType, string? ipAddress, string? userAgent, DateTime? clientTimestamp)
    {
        if (attempt.Status != AttemptStatus.InProgress)
            return;

        var submittedAt = DateTime.UtcNow;
        var effectiveSubmitType = submittedAt >= GetExpiresAt(attempt) && submitType == SubmitType.Manual
            ? SubmitType.Auto
            : submitType;

        attempt.SubmittedAt = submittedAt;
        attempt.SubmitType = effectiveSubmitType;
        attempt.Status = effectiveSubmitType == SubmitType.Manual ? AttemptStatus.Submitted : AttemptStatus.AutoSubmitted;
        attempt.TimeSpentSeconds = (int)Math.Max(0, (submittedAt - attempt.StartedAt).TotalSeconds);

        decimal score = 0m;
        int correctAnswers = 0;

        foreach (var questionSnapshot in attempt.QuestionSnapshots)
        {
            var answer = attempt.Answers.FirstOrDefault(a => a.QuestionSnapshotId == questionSnapshot.Id);
            var selectedOption = questionSnapshot.OptionSnapshots.FirstOrDefault(option => option.Id == answer?.SelectedOptionSnapshotId);
            var isCorrect = selectedOption?.IsCorrect == true;

            if (answer != null)
                answer.IsCorrect = isCorrect;

            if (isCorrect)
            {
                correctAnswers++;
                score += questionSnapshot.PointValue;
            }
        }

        attempt.CorrectAnswers = correctAnswers;
        attempt.Score = decimal.Round(score, 2, MidpointRounding.AwayFromZero);
        attempt.TotalQuestions = attempt.QuestionSnapshots.Count;

        attempt.EventLogs.Add(new AttemptEventLog
        {
            Id = Guid.NewGuid(),
            AttemptId = attempt.Id,
            EventType = AttemptEventType.ExamSubmit,
            Timestamp = submittedAt,
            ClientTimestamp = clientTimestamp,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            Details = effectiveSubmitType.ToString()
        });

        await _db.SaveChangesAsync();
    }

    private async Task<AttemptDetailDto> BuildAttemptDetailAsync(ExamAttempt attempt, bool hideResults)
    {
        var policy = await GetAttemptPolicyAsync();

        return new AttemptDetailDto
        {
            Attempt = MapSummary(attempt, hideResults),
            ExamDescription = attempt.Exam.Description ?? string.Empty,
            DurationMinutes = attempt.Exam.DurationMinutes,
            TotalPoints = attempt.Exam.TotalPoints,
            ShuffleQuestions = attempt.Exam.ShuffleQuestions,
            ShuffleOptions = attempt.Exam.ShuffleOptions,
            Policy = policy,
            Questions = attempt.QuestionSnapshots
                .OrderBy(question => question.SortOrder)
                .Select(question => new AttemptQuestionSnapshotDto
                {
                    Id = question.Id,
                    OriginalQuestionId = question.OriginalQuestionId,
                    SortOrder = question.SortOrder,
                    Content = question.Content,
                    PointValue = question.PointValue,
                    SelectedOptionSnapshotId = attempt.Answers
                        .FirstOrDefault(answer => answer.QuestionSnapshotId == question.Id)?
                        .SelectedOptionSnapshotId,
                    Options = question.OptionSnapshots
                        .OrderBy(option => option.SortOrder)
                        .Select(option => new AttemptOptionSnapshotDto
                        {
                            Id = option.Id,
                            Label = option.Label,
                            Content = option.Content,
                            SortOrder = option.SortOrder
                        })
                        .ToList()
                })
                .ToList(),
            RecentEvents = MapRecentEvents(attempt)
        };
    }

    private static AttemptSummaryDto MapSummary(ExamAttempt attempt, bool hideResults)
    {
        return new AttemptSummaryDto
        {
            Id = attempt.Id,
            ExamId = attempt.ExamId,
            ExamTitle = attempt.Exam.Title,
            SessionId = attempt.SessionId,
            SessionName = attempt.Session.Name,
            StudentId = attempt.StudentId,
            StudentName = attempt.Student.FullName,
            StudentCode = attempt.Student.StudentCode,
            SubjectName = attempt.Exam.Subject.Name,
            StartedAt = attempt.StartedAt,
            SubmittedAt = attempt.SubmittedAt,
            ExpiresAt = GetExpiresAt(attempt),
            Status = attempt.Status.ToString(),
            SubmitType = attempt.SubmitType?.ToString(),
            Score = hideResults ? null : attempt.Score,
            TotalQuestions = attempt.TotalQuestions,
            AnsweredQuestions = attempt.Answers.Count(answer => answer.SelectedOptionSnapshotId.HasValue),
            CorrectAnswers = hideResults ? null : attempt.CorrectAnswers,
            TimeSpentSeconds = attempt.TimeSpentSeconds,
            TabSwitchCount = attempt.TabSwitchCount,
            ReloadCount = attempt.ReloadCount,
            IsFlagged = attempt.IsFlagged,
            FlagReason = attempt.FlagReason,
            SessionStartTime = attempt.Session.StartTime,
            SessionEndTime = attempt.Session.EndTime,
            ShowResultToStudent = attempt.Exam.ShowResultToStudent
        };
    }

    private static List<AttemptEventDto> MapRecentEvents(ExamAttempt attempt)
    {
        return attempt.EventLogs
            .OrderByDescending(log => log.Timestamp)
            .Take(12)
            .OrderBy(log => log.Timestamp)
            .Select(log => new AttemptEventDto
            {
                Id = log.Id,
                EventType = log.EventType.ToString(),
                Timestamp = log.Timestamp,
                ClientTimestamp = log.ClientTimestamp,
                Details = log.Details
            })
            .ToList();
    }

    private static DateTime GetExpiresAt(ExamAttempt attempt)
    {
        var examLimit = attempt.StartedAt.AddMinutes(attempt.Exam.DurationMinutes);
        return examLimit <= attempt.Session.EndTime ? examLimit : attempt.Session.EndTime;
    }

    private static void EnsureStudentOwnsAttempt(ExamAttempt attempt, Guid studentId)
    {
        if (attempt.StudentId != studentId)
            throw new ForbiddenException("You do not have permission to access this attempt.");
    }

    private async Task<AttemptPolicyDto> GetAttemptPolicyAsync()
    {
        var settings = await _db.SystemSettings
            .AsNoTracking()
            .Where(setting => setting.Key == "MaxTabSwitches"
                || setting.Key == "AutoSubmitOnTabLimit"
                || setting.Key == "AllowCopyPaste"
                || setting.Key == "RapidAnswerThresholdSeconds")
            .ToListAsync();

        return new AttemptPolicyDto
        {
            MaxTabSwitches = GetIntSetting(settings, "MaxTabSwitches", 3),
            AutoSubmitOnTabLimit = GetBoolSetting(settings, "AutoSubmitOnTabLimit", false),
            AllowCopyPaste = GetBoolSetting(settings, "AllowCopyPaste", false),
            RapidAnswerThresholdSeconds = GetIntSetting(settings, "RapidAnswerThresholdSeconds", 3)
        };
    }

    private static int GetIntSetting(IEnumerable<SystemSetting> settings, string key, int defaultValue)
    {
        var setting = settings.FirstOrDefault(item => string.Equals(item.Key, key, StringComparison.OrdinalIgnoreCase));
        return setting != null && int.TryParse(setting.Value, out var value) ? value : defaultValue;
    }

    private static bool GetBoolSetting(IEnumerable<SystemSetting> settings, string key, bool defaultValue)
    {
        var setting = settings.FirstOrDefault(item => string.Equals(item.Key, key, StringComparison.OrdinalIgnoreCase));
        return setting != null && bool.TryParse(setting.Value, out var value) ? value : defaultValue;
    }

    private static string GetOptionLabel(int index)
    {
        if (index < OptionLabels.Length)
            return OptionLabels[index];

        return $"O{index + 1}";
    }

    private static void Shuffle<T>(IList<T> items)
    {
        for (int i = items.Count - 1; i > 0; i--)
        {
            var j = Random.Shared.Next(i + 1);
            (items[i], items[j]) = (items[j], items[i]);
        }
    }

    private static void FlagAttempt(ExamAttempt attempt, string reason)
    {
        attempt.IsFlagged = true;
        if (string.IsNullOrWhiteSpace(reason))
            return;

        if (string.IsNullOrWhiteSpace(attempt.FlagReason))
        {
            attempt.FlagReason = reason;
            return;
        }

        if (!attempt.FlagReason.Contains(reason, StringComparison.OrdinalIgnoreCase))
            attempt.FlagReason = $"{attempt.FlagReason}; {reason}";
    }
}

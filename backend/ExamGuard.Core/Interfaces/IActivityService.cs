using ExamGuard.Core.DTOs.Activity;

namespace ExamGuard.Core.Interfaces;

public interface IActivityService
{
    Task<List<ActivityItemDto>> GetRecentActivityAsync(int limit);
}

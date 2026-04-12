using ExamGuard.Core.DTOs.Attempt;
using ExamGuard.Core.DTOs.Settings;

namespace ExamGuard.Core.Interfaces;

public interface ISettingsService
{
    Task<SystemSettingsDto> GetSettingsAsync();
    Task<SystemSettingsDto> UpdateSettingsAsync(UpdateSystemSettingsRequest request);
    Task<AttemptPolicyDto> GetAttemptPolicyAsync();
}

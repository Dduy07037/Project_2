using ExamGuard.Core.DTOs.Attempt;

namespace ExamGuard.Core.DTOs.Settings;

public class SystemSettingsDto
{
    public string SiteName { get; set; } = string.Empty;
    public bool MaintenanceMode { get; set; }
    public int MaxLoginAttempts { get; set; }
    public int SessionTimeoutMinutes { get; set; }
    public bool TabSwitchWarning { get; set; }
    public int MaxTabSwitches { get; set; }
    public bool AutoSubmitOnTabLimit { get; set; }
    public bool AllowCopyPaste { get; set; }
    public bool ShowResultToStudent { get; set; }
    public int RapidAnswerThresholdSeconds { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class UpdateSystemSettingsRequest
{
    public string SiteName { get; set; } = string.Empty;
    public bool MaintenanceMode { get; set; }
    public int MaxLoginAttempts { get; set; }
    public int SessionTimeoutMinutes { get; set; }
    public bool TabSwitchWarning { get; set; }
    public int MaxTabSwitches { get; set; }
    public bool AutoSubmitOnTabLimit { get; set; }
    public bool AllowCopyPaste { get; set; }
    public bool ShowResultToStudent { get; set; }
    public int RapidAnswerThresholdSeconds { get; set; }
}

using ExamGuard.Core.DTOs.Attempt;
using ExamGuard.Core.DTOs.Settings;
using ExamGuard.Core.Entities;
using ExamGuard.Core.Interfaces;
using ExamGuard.Data;
using Microsoft.EntityFrameworkCore;

namespace ExamGuard.Service.Services;

public class SettingsService : ISettingsService
{
    private readonly AppDbContext _db;

    public SettingsService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<SystemSettingsDto> GetSettingsAsync()
    {
        var settings = await _db.SystemSettings.AsNoTracking().ToListAsync();
        return MapSettings(settings);
    }

    public async Task<SystemSettingsDto> UpdateSettingsAsync(UpdateSystemSettingsRequest request)
    {
        var settings = await _db.SystemSettings.ToDictionaryAsync(s => s.Key);

        SetSetting(settings, "SiteName", string.IsNullOrWhiteSpace(request.SiteName) ? "ExamGuard" : request.SiteName.Trim(), "Display name of the system");
        SetSetting(settings, "MaintenanceMode", request.MaintenanceMode.ToString().ToLowerInvariant(), "Enable maintenance mode");
        SetSetting(settings, "MaxLoginAttempts", Math.Max(1, request.MaxLoginAttempts).ToString(), "Max failed login attempts before lock");
        // SessionTimeoutMinutes is not currently enforced by the backend; JWT lifetime is controlled by JwtSettings and exam expiry by exam/session time.
        SetSetting(settings, "SessionTimeoutMinutes", Math.Max(5, request.SessionTimeoutMinutes).ToString(), "Configured session timeout display value; not enforced by backend auth or exam idle timeout");
        // Frontend-only warning toggle. Backend enforcement uses MaxTabSwitches and AutoSubmitOnTabLimit.
        SetSetting(settings, "TabSwitchWarning", request.TabSwitchWarning.ToString().ToLowerInvariant(), "Frontend-only tab switch warning toggle");
        SetSetting(settings, "MaxTabSwitches", Math.Max(0, request.MaxTabSwitches).ToString(), "Maximum tab switches before warning");
        SetSetting(settings, "AutoSubmitOnTabLimit", request.AutoSubmitOnTabLimit.ToString().ToLowerInvariant(), "Auto-submit when tab switch limit is exceeded");
        SetSetting(settings, "AllowCopyPaste", request.AllowCopyPaste.ToString().ToLowerInvariant(), "Allow copy/paste during exam");
        SetSetting(settings, "ShowResultToStudent", request.ShowResultToStudent.ToString().ToLowerInvariant(), "Default: show result after submission");
        SetSetting(settings, "RapidAnswerThresholdSeconds", Math.Max(1, request.RapidAnswerThresholdSeconds).ToString(), "Min seconds between answers to flag rapid answering");

        await _db.SaveChangesAsync();
        return MapSettings(settings.Values);
    }

    public async Task<AttemptPolicyDto> GetAttemptPolicyAsync()
    {
        var settings = await GetSettingsAsync();
        return new AttemptPolicyDto
        {
            MaxTabSwitches = settings.MaxTabSwitches,
            AutoSubmitOnTabLimit = settings.AutoSubmitOnTabLimit,
            AllowCopyPaste = settings.AllowCopyPaste,
            RapidAnswerThresholdSeconds = settings.RapidAnswerThresholdSeconds
        };
    }

    private void SetSetting(IDictionary<string, SystemSetting> settings, string key, string value, string description)
    {
        if (settings.TryGetValue(key, out var existing))
        {
            existing.Value = value;
            existing.Description = description;
            existing.UpdatedAt = DateTime.UtcNow;
            return;
        }

        var setting = new SystemSetting
        {
            Key = key,
            Value = value,
            Description = description,
            UpdatedAt = DateTime.UtcNow
        };

        _db.SystemSettings.Add(setting);
        settings[key] = setting;
    }

    private static SystemSettingsDto MapSettings(IEnumerable<SystemSetting> settings)
    {
        var map = settings.ToDictionary(s => s.Key, s => s, StringComparer.OrdinalIgnoreCase);

        return new SystemSettingsDto
        {
            SiteName = GetString(map, "SiteName", "ExamGuard"),
            MaintenanceMode = GetBool(map, "MaintenanceMode", false),
            MaxLoginAttempts = GetInt(map, "MaxLoginAttempts", 5),
            SessionTimeoutMinutes = GetInt(map, "SessionTimeoutMinutes", 30),
            TabSwitchWarning = GetBool(map, "TabSwitchWarning", true),
            MaxTabSwitches = GetInt(map, "MaxTabSwitches", 3),
            AutoSubmitOnTabLimit = GetBool(map, "AutoSubmitOnTabLimit", false),
            AllowCopyPaste = GetBool(map, "AllowCopyPaste", false),
            ShowResultToStudent = GetBool(map, "ShowResultToStudent", true),
            RapidAnswerThresholdSeconds = GetInt(map, "RapidAnswerThresholdSeconds", 3),
            UpdatedAt = map.Values.Select(s => s.UpdatedAt).DefaultIfEmpty(DateTime.UtcNow).Max()
        };
    }

    private static string GetString(IReadOnlyDictionary<string, SystemSetting> settings, string key, string defaultValue)
        => settings.TryGetValue(key, out var setting) && !string.IsNullOrWhiteSpace(setting.Value)
            ? setting.Value
            : defaultValue;

    private static int GetInt(IReadOnlyDictionary<string, SystemSetting> settings, string key, int defaultValue)
        => settings.TryGetValue(key, out var setting) && int.TryParse(setting.Value, out var value)
            ? value
            : defaultValue;

    private static bool GetBool(IReadOnlyDictionary<string, SystemSetting> settings, string key, bool defaultValue)
        => settings.TryGetValue(key, out var setting) && bool.TryParse(setting.Value, out var value)
            ? value
            : defaultValue;
}

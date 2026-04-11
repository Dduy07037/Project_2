namespace ExamGuard.Core.Entities;

public class RefreshToken
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid SessionId { get; set; }
    public string TokenHash { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByIp { get; set; }
    public string? CreatedByUserAgent { get; set; }
    public DateTime? LastUsedAt { get; set; }
    public string? LastUsedByIp { get; set; }
    public string? LastUsedByUserAgent { get; set; }
    public DateTime? RevokedAt { get; set; }
    public string? RevokedByIp { get; set; }
    public string? RevocationReason { get; set; }
    public string? ReplacedByTokenHash { get; set; }
    public bool IsRevoked => RevokedAt != null;
    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsActive => !IsRevoked && !IsExpired;

    public User User { get; set; } = null!;
}

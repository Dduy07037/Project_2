using ExamGuard.Core.Enums;
using ExamGuard.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ExamGuard.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class HealthController : ControllerBase
{
    private readonly AppDbContext _db;

    public HealthController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            status = "healthy",
            service = "ExamGuard API",
            timestamp = DateTime.UtcNow,
            version = "1.0.0"
        });
    }

    [HttpGet("ready")]
    public async Task<IActionResult> Ready()
    {
        var canConnect = await _db.Database.CanConnectAsync();
        var pendingMigrations = canConnect
            ? (await _db.Database.GetPendingMigrationsAsync()).ToArray()
            : Array.Empty<string>();

        var payload = new
        {
            status = canConnect && pendingMigrations.Length == 0 ? "ready" : "degraded",
            service = "ExamGuard API",
            timestamp = DateTime.UtcNow,
            database = new
            {
                connected = canConnect,
                pendingMigrations
            },
            seed = canConnect
                ? new
                {
                    users = await _db.Users.CountAsync(),
                    admins = await _db.Users.CountAsync(u => u.Role == UserRole.Admin),
                    lecturers = await _db.Users.CountAsync(u => u.Role == UserRole.Lecturer),
                    students = await _db.Users.CountAsync(u => u.Role == UserRole.Student),
                    subjects = await _db.Subjects.CountAsync(),
                    questions = await _db.Questions.CountAsync(),
                    systemSettings = await _db.SystemSettings.CountAsync()
                }
                : null
        };

        if (!canConnect || pendingMigrations.Length > 0)
            return StatusCode(StatusCodes.Status503ServiceUnavailable, payload);

        return Ok(payload);
    }
}

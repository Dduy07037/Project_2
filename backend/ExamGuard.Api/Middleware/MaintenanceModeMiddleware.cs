using ExamGuard.Core.Security;
using ExamGuard.Data;
using Microsoft.EntityFrameworkCore;

namespace ExamGuard.Api.Middleware;

public class MaintenanceModeMiddleware
{
    private readonly RequestDelegate _next;

    public MaintenanceModeMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, AppDbContext db)
    {
        if (ShouldSkip(context) || context.User.IsInRole(AppRoleNames.Admin))
        {
            await _next(context);
            return;
        }

        var maintenanceSetting = await db.SystemSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(setting => setting.Key == "MaintenanceMode");

        if (maintenanceSetting != null
            && bool.TryParse(maintenanceSetting.Value, out var maintenanceMode)
            && maintenanceMode)
        {
            context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new
            {
                status = StatusCodes.Status503ServiceUnavailable,
                message = "System is in maintenance mode.",
                timestamp = DateTime.UtcNow
            });
            return;
        }

        await _next(context);
    }

    private static bool ShouldSkip(HttpContext context)
    {
        var path = context.Request.Path;
        return HttpMethods.IsOptions(context.Request.Method)
            || path.StartsWithSegments("/api/health")
            || path.StartsWithSegments("/api/auth")
            || path.StartsWithSegments("/swagger");
    }
}

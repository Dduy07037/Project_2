namespace ExamGuard.Core.Exceptions;

public class AppException : Exception
{
    public int StatusCode { get; }

    public AppException(string message, int statusCode = 400) : base(message)
    {
        StatusCode = statusCode;
    }
}

public class NotFoundException : AppException
{
    public NotFoundException(string entity, object id)
        : base($"{entity} with ID '{id}' not found.", 404) { }
}

public class ForbiddenException : AppException
{
    public ForbiddenException(string message = "You do not have permission to perform this action.")
        : base(message, 403) { }
}

public class ConflictException : AppException
{
    public ConflictException(string message)
        : base(message, 409) { }
}

public class UnauthorizedException : AppException
{
    public UnauthorizedException(string message = "Invalid credentials.")
        : base(message, 401) { }
}

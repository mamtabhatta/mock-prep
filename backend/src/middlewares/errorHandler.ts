import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(
    {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      err,
    },
    "Request failed"
  );

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request data",
      },
    });
  }

  // Application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  // PostgreSQL / Drizzle errors
  if (isDatabaseError(err)) {
    return res.status(400).json({
      error: {
        code: getDatabaseErrorCode(err),
        message: getDatabaseErrorMessage(err),
      },
    });
  }

  // Unknown errors
  return res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
    },
  });
};

const isDatabaseError = (
  err: unknown
): err is {
  code?: string;
  constraint?: string;
  detail?: string;
} => {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err
  );
};

const getDatabaseErrorCode = (
  err: {
    code?: string;
  }
): string => {
  switch (err.code) {
    case "23505":
      return "DUPLICATE_RESOURCE";

    case "23503":
      return "FOREIGN_KEY_VIOLATION";

    case "23502":
      return "REQUIRED_FIELD_MISSING";

    case "23514":
      return "CONSTRAINT_VIOLATION";

    default:
      return "DATABASE_ERROR";
  }
};

const getDatabaseErrorMessage = (
  err: {
    code?: string;
  }
): string => {
  switch (err.code) {
    case "23505":
      return "Resource already exists";

    case "23503":
      return "Referenced resource does not exist";

    case "23502":
      return "Required field is missing";

    case "23514":
      return "Data violates a database constraint";

    default:
      return "Database operation failed";
  }
};
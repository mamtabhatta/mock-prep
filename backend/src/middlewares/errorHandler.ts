import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error("🔥 ACTUAL ERROR:", err);
    console.error("🔥 ERROR MESSAGE:", err?.message);
    console.error("🔥 ERROR STACK:", err?.stack);

    return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal server error",
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
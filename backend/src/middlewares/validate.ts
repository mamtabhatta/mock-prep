import { Request, Response, NextFunction } from "express";
import { z, ZodType } from "zod";

type ValidationSchemas = {
    body?: ZodType;
    params?: ZodType;
    query?: ZodType;
};

export const validate = (
    schemas: ValidationSchemas
) => {
    return (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        if (schemas.body) {
            req.body = schemas.body.parse(req.body);
        }

        if (schemas.params) {
            req.params = schemas.params.parse(req.params);
        }

        if (schemas.query) {
            req.query = schemas.query.parse(req.query);
        }

        next();
    };
};
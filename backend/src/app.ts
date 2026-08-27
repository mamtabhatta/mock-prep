import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";

import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { logger } from "./utils/logger";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";

const app = express();

// Structured logging + request IDs
app.use(
    pinoHttp({
        logger,
        genReqId: (req) => {
            return (
                req.headers["x-request-id"]?.toString() ||
                crypto.randomUUID()
            );
        },
    })
);

// Middlewares
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

// Base API Route
app.use("/api/v1", routes);

// Centralized Error Handling
app.use(errorHandler);

export default app;
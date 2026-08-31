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

app.use(helmet());

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "http://localhost:5174",
        ],
        credentials: true,
    })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

app.use("/api/v1", routes);

app.use(errorHandler);

export default app;

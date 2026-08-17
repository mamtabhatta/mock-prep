import {
    Queue,
} from "bullmq";

import dotenv from "dotenv";

dotenv.config();

const redisUrl =
    process.env.REDIS_URL ||
    "redis://localhost:6380";

const redis =
    new URL(redisUrl);

export const jobQueue =
    new Queue(
        "mock-prep-jobs",
        {
            connection: {
                host:
                    redis.hostname,

                port:
                    Number(
                        redis.port
                    ),
            },

            defaultJobOptions: {
                attempts: 3,

                backoff: {
                    type: "exponential",
                    delay: 2000,
                },

                removeOnComplete: 100,

                removeOnFail: 100,
            },
        }
    );
import { Worker } from "bullmq";
import dotenv from "dotenv";

dotenv.config();

const redisUrl =
    process.env.REDIS_URL || "redis://localhost:6380";

const redis = new URL(redisUrl);

const jobWorker = new Worker(
    "mock-prep-jobs",
    async (job) => {
        console.log(
            `Processing job ${job.id}: ${job.name}`
        );

        console.log("Job data:", job.data);

        return {
            success: true,
            processed: true,
            jobId: job.id,
        };
    },
    {
        connection: {
            host: redis.hostname,
            port: Number(redis.port),
        },
    }
);

jobWorker.on("completed", (job) => {
    console.log(
        `✅ Job ${job.id} completed successfully`
    );
});

jobWorker.on("failed", (job, error) => {
    console.error(
        `❌ Job ${job?.id} failed:`,
        error.message
    );
});

jobWorker.on("error", (error) => {
    console.error(
        " Worker error:",
        error
    );
});

console.log("👷 Job worker started");
import {
    jobQueue,
} from "../queues/jobQueue";


export const enqueueJob = async (
    name: string,
    data: Record<string, unknown>
) => {

    const job =
        await jobQueue.add(
            name,
            data
        );


    return {
        id: job.id,
        name: job.name,
        data: job.data,
    };
};
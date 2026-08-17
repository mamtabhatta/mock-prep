export type JobFailureNotification = {
    jobId?: string;
    jobName: string;
    sessionId?: string;
    answerId?: string;
    error: string;
};

export const notifyJobFailure = async (
    notification: JobFailureNotification
) => {
    /*
     * Notification hook.
     *
     * This can later be connected to email,
     * push notification, websocket, etc.
     */
    console.log(
        "JOB FAILURE NOTIFICATION:",
        notification
    );
};
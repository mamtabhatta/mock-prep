import { db } from "../db";
import { analyticsEvents } from "../db/schema";

export const recordAnalyticsEvent = async ({
    userId,
    sessionId,
    eventType,
    metadata = {},
}: {
    userId: string;
    sessionId: string;
    eventType: "session_started" | "session_completed";
    metadata?: Record<string, unknown>;
}) => {
    const [event] = await db
        .insert(analyticsEvents)
        .values({
            userId,
            sessionId,
            eventType,
            metadata,
        })
        .returning();

    return event;
};
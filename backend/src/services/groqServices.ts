import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export const transcribeWithGroq = async (
    audioBuffer: Buffer,
    filename: string
): Promise<string> => {
    if (!process.env.GROQ_API_KEY) {
        throw new Error(
            "GROQ_API_KEY is not configured"
        );
    }

    const file = new File(
        [audioBuffer],
        filename,
        {
            type: getContentType(filename),
        }
    );

    const result =
        await groq.audio.transcriptions.create({
            file,
            model:
                process.env.GROQ_WHISPER_MODEL ||
                "whisper-large-v3",
            response_format: "json",
            temperature: 0,
        });

    return result.text;
};

const getContentType = (
    filename: string
): string => {
    const extension =
        filename
            .split(".")
            .pop()
            ?.toLowerCase();

    switch (extension) {
        case "webm":
            return "audio/webm";

        case "mp3":
            return "audio/mpeg";

        case "wav":
            return "audio/wav";

        case "m4a":
            return "audio/mp4";

        case "ogg":
            return "audio/ogg";

        case "flac":
            return "audio/flac";

        default:
            return "audio/webm";
    }
};
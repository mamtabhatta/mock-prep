import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const model =
    process.env.GROQ_WHISPER_MODEL ||
    "whisper-large-v3-turbo";


export const transcribeAudio = async (
    audioBuffer: Buffer,
    filename: string
) => {

    if (!process.env.GROQ_API_KEY) {
        throw new Error(
            "GROQ_API_KEY is not configured"
        );
    }


    const transcription =
        await groq.audio.transcriptions.create({
            file: new File(
                [audioBuffer],
                filename
            ),

            model,

            response_format: "json",

            temperature: 0,
        });


    return transcription.text;
};
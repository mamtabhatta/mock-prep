import ffmpeg from "fluent-ffmpeg";
import { PassThrough } from "stream";

export const convertWebmToWav = async (
    audioBuffer: Buffer
): Promise<Buffer> => {
    return new Promise(
        (
            resolve,
            reject
        ) => {
            const input =
                new PassThrough();

            const outputChunks: Buffer[] =
                [];

            input.end(
                audioBuffer
            );

            ffmpeg(input)
                .inputFormat("webm")
                .audioCodec("pcm_s16le")
                .audioFrequency(16000)
                .audioChannels(1)
                .format("wav")
                .on(
                    "error",
                    reject
                )
                .on(
                    "end",
                    () => {
                        resolve(
                            Buffer.concat(
                                outputChunks
                            )
                        );
                    }
                )
                .pipe()
                .on(
                    "data",
                    (chunk) => {
                        outputChunks.push(
                            chunk
                        );
                    }
                );
        }
    );
};
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3Client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    endpoint: process.env.S3_ENDPOINT || "http://localhost:9000",
    credentials: {
        accessKeyId:
            process.env.AWS_ACCESS_KEY_ID || "minioadmin",
        secretAccessKey:
            process.env.AWS_SECRET_ACCESS_KEY || "minioadmin",
    },
    forcePathStyle: true,
});

export const generatePresignedPutUrl = async (
    key: string,
    contentType: string
): Promise<string> => {
    const command = new PutObjectCommand({
        Bucket:
            process.env.S3_BUCKET_NAME ||
            "mockprep-documents",
        Key: key,
        ContentType: contentType,
    });

    return await getSignedUrl(s3Client, command, {
        expiresIn: 3600,
    });
};

export const uploadAudio = async (
    key: string,
    buffer: Buffer,
    contentType: string
): Promise<string> => {
    const command = new PutObjectCommand({
        Bucket:
            process.env.S3_BUCKET_NAME ||
            "mockprep-documents",
        Key: key,
        Body: buffer,
        ContentType: contentType,
    });

    await s3Client.send(command);

    return key;
};
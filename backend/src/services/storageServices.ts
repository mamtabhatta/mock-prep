import dotenv from "dotenv";

dotenv.config();

import {
    PutObjectCommand,
    DeleteObjectCommand,
    S3Client,
    GetObjectCommand,
} from "@aws-sdk/client-s3";

import {
    getSignedUrl,
} from "@aws-sdk/s3-request-presigner";


// ============================================
// S3 / MINIO CLIENT
// ============================================

const s3Client = new S3Client({
    region:
        process.env.S3_REGION ||
        process.env.AWS_REGION ||
        "us-east-1",

    endpoint:
        process.env.S3_ENDPOINT ||
        "http://localhost:9000",

    credentials: {
        accessKeyId:
            process.env.S3_ACCESS_KEY_ID ||
            process.env.AWS_ACCESS_KEY_ID ||
            "minio",

        secretAccessKey:
            process.env.S3_SECRET_ACCESS_KEY ||
            process.env.AWS_SECRET_ACCESS_KEY ||
            "minio123",
    },

    forcePathStyle: true,
});


// ============================================
// BUCKET
// ============================================

const bucket =
    process.env.S3_BUCKET_NAME ||
    "mockprep-documents";


// ============================================
// GENERATE PRESIGNED PUT URL
// ============================================

export const generatePresignedPutUrl = async (
    key: string,
    contentType: string
): Promise<string> => {

    const command =
        new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            ContentType: contentType,
        });

    return await getSignedUrl(
        s3Client,
        command,
        {
            expiresIn: 3600,
        }
    );
};


// ============================================
// UPLOAD OBJECT
// ============================================

export const uploadAudio = async (
    key: string,
    buffer: Buffer,
    contentType: string
): Promise<string> => {

    const command =
        new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        });

    await s3Client.send(command);

    return key;
};


// ============================================
// DELETE OBJECT
// ============================================

export const deleteObject = async (
    key: string
): Promise<void> => {

    const command =
        new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
        });

    await s3Client.send(command);
};


// ============================================
// DOWNLOAD OBJECT
// ============================================

export const downloadObject = async (
    key: string
): Promise<Buffer> => {

    const command =
        new GetObjectCommand({
            Bucket: bucket,
            Key: key,
        });

    const response =
        await s3Client.send(command);

    if (!response.Body) {
        throw new Error(
            "Storage object has no body"
        );
    }

    const bytes =
        await response.Body.transformToByteArray();

    return Buffer.from(bytes);
};
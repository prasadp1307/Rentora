import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class StorageService {
  private client: S3Client;
  private bucket: string;
  private publicBase: string;

  constructor(config: ConfigService) {
    const endpoint = config.get<string>("S3_ENDPOINT");
    this.bucket = config.getOrThrow<string>("S3_BUCKET");
    this.publicBase =
      config.get<string>("S3_PUBLIC_URL") ??
      `${endpoint}/${this.bucket}`;

    this.client = new S3Client({
      region: config.get("S3_REGION") ?? "us-east-1",
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.getOrThrow("S3_ACCESS_KEY"),
        secretAccessKey: config.getOrThrow("S3_SECRET_KEY"),
      },
    });
  }

  async getSignedUploadUrl(key: string, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(this.client, command, { expiresIn: 900 });
  }

  getPublicUrl(key: string) {
    return `${this.publicBase}/${key}`;
  }

  async deleteObject(key: string) {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }
}

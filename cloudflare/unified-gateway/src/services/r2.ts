/**
 * R2 Storage Service
 * origin_signature: MrLiouWord
 */

export class R2Service {
  constructor(private bucket: R2Bucket) {}

  async put(key: string, data: ArrayBuffer | string, metadata?: Record<string, string>): Promise<void> {
    const body = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    await this.bucket.put(key, body, { customMetadata: metadata });
  }

  async get(key: string): Promise<ArrayBuffer | null> {
    const object = await this.bucket.get(key);
    if (!object) return null;
    return await object.arrayBuffer();
  }

  async delete(key: string): Promise<void> {
    await this.bucket.delete(key);
  }

  async list(prefix?: string): Promise<string[]> {
    const result = await this.bucket.list({ prefix });
    return result.objects.map(obj => obj.key);
  }
}

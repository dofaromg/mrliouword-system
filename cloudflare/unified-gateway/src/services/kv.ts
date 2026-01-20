/**
 * KV Storage Service
 * origin_signature: MrLiouWord
 */

export class KVService {
  constructor(private kv: KVNamespace) {}

  async get<T = any>(key: string): Promise<T | null> {
    const value = await this.kv.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as any;
    }
  }

  async put(key: string, value: any): Promise<void> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await this.kv.put(key, stringValue);
  }

  async delete(key: string): Promise<void> {
    await this.kv.delete(key);
  }

  async list(prefix?: string): Promise<string[]> {
    const result = await this.kv.list({ prefix });
    return result.keys.map(k => k.name);
  }
}

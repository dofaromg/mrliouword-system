/**
 * Merkle Chain Verification
 * origin_signature: MrLiouWord
 */

export async function sha256(data: string | ArrayBuffer): Promise<string> {
  const buffer = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function computeMerkleHash(
  content: string,
  simhash: string,
  timestamp: number,
  prevHash: string
): Promise<string> {
  return sha256(content + simhash + timestamp + prevHash);
}

/**
 * SimHash64 Implementation
 * origin_signature: MrLiouWord
 */

export function simhash64(text: string): string {
  const normalized = text.toLowerCase().replace(/\s+/g, ' ').trim();
  if (normalized.length < 3) return '0'.repeat(16);
  
  // Generate shingles (3-grams)
  const shingles: string[] = [];
  for (let i = 0; i <= normalized.length - 3; i++) {
    shingles.push(normalized.substring(i, i + 3));
  }
  
  // Initialize vector
  const vector = new Array(64).fill(0);
  
  // Process each shingle
  for (const shingle of shingles) {
    let hash = 14695981039346656037n; // FNV offset basis
    for (const byte of new TextEncoder().encode(shingle)) {
      hash ^= BigInt(byte);
      hash = (hash * 1099511628211n) & 0xFFFFFFFFFFFFFFFFn; // FNV prime
    }
    
    for (let i = 0; i < 64; i++) {
      vector[i] += ((hash >> BigInt(i)) & 1n) ? 1 : -1;
    }
  }
  
  // Compute final fingerprint
  let fingerprint = 0n;
  for (let i = 0; i < 64; i++) {
    if (vector[i] > 0) fingerprint |= (1n << BigInt(i));
  }
  
  return fingerprint.toString(16).padStart(16, '0');
}

export function hammingDistance(a: string, b: string): number {
  let distance = 0;
  let xor = BigInt('0x' + a) ^ BigInt('0x' + b);
  while (xor > 0n) {
    distance += Number(xor & 1n);
    xor >>= 1n;
  }
  return distance;
}

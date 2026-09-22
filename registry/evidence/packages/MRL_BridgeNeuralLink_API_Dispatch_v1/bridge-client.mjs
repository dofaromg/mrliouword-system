// Additive, server-side client for the existing MRL bridge task controller.
// origin_signature: MrLiouWord. Do not put dispatcher credentials in public app.js.
export class MRLDispatchClient {
  constructor({baseUrl = 'http://127.0.0.1:8101', token, workspace}) {
    const url = new URL(baseUrl);
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && url.hostname === '127.0.0.1'))
      throw new Error('TLS_OR_LOOPBACK_REQUIRED');
    if (url.username || url.password || url.search || url.hash) throw new Error('INVALID_BASE_URL');
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.token = token;
    this.workspace = workspace;
  }
  async request(path, body) {
    const r = await fetch(this.baseUrl + path, {
      method: body ? 'POST' : 'GET', redirect: 'error', signal: AbortSignal.timeout(15000),
      headers: {'x-api-key': this.token, 'Content-Type': 'application/json'},
      ...(body ? {body: JSON.stringify(body)} : {})
    });
    const value = await r.json();
    if (!r.ok) throw new Error(value.error || 'DISPATCH_HTTP_ERROR');
    return value;
  }
  policy() { return this.request('/v1/policy'); }
  submit({idempotencyKey, prompt, sourceRefs, policySha256}) {
    return this.request('/v1/tasks', {idempotency_key: idempotencyKey, workspace: this.workspace,
      prompt, source_refs: sourceRefs, policy_sha256: policySha256, scope: 'review_only'});
  }
  result(taskId) {
    if (!/^[a-f0-9-]{36}$/.test(taskId)) throw new Error('INVALID_TASK_ID');
    return this.request('/v1/tasks/' + taskId);
  }
  async watch(taskId, onReceipt, {afterSeq = 0, signal, intervalMs = 1500} = {}) {
    let cursor = afterSeq;
    while (!signal?.aborted) {
      const result = await this.result(taskId);
      for (const receipt of result.receipts) {
        if (receipt.seq > cursor) {
          await onReceipt(receipt); // Caller renders as text, never executes output.
          cursor = receipt.seq;
        }
      }
      if (result.complete) return {cursor, result};
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
    return {cursor, cancelled: true};
  }
}

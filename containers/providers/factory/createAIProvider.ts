/**
 * createAIProvider factory
 * Origin Signature: MrLiouWord
 *
 * Reads AI_PROVIDER to select the correct adapter.
 *
 *   AI_PROVIDER=local      → MRLiouLocalProvider  (DL580 runtime)
 *   AI_PROVIDER=backend-b  → (TODO: MrLiouBackendBAdapter)
 *   AI_PROVIDER=backend-c  → (TODO: MrLiouBackendCAdapter)
 *   AI_PROVIDER=backend-a  → (TODO: MrLiouBackendAAdapter)
 */

import type { AIProvider } from '../interfaces/AIProvider'

export type AIProviderName = 'local' | 'backend-a' | 'backend-b' | 'backend-c'

export function createAIProvider(override?: AIProviderName): AIProvider {
  const name: AIProviderName =
    override ??
    ((typeof process !== 'undefined' &&
      (process.env?.AI_PROVIDER as AIProviderName)) ||
      'local')

  switch (name) {
    case 'local':
    default: {
      const { MRLiouLocalProvider } = require('../adapters/MRLiouLocalProvider')
      return new MRLiouLocalProvider()
    }
    // TODO: add cases for 'backend-a', 'backend-b', 'backend-c' as those adapters are built
  }
}

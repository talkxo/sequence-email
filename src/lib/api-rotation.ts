// API Key Rotation and Model Management
// Handles multiple OpenRouter API keys and model selection for optimal performance

export interface ApiKey {
  key: string;
  name: string;
  lastUsed?: Date;
  successCount: number;
  errorCount: number;
  isActive: boolean;
}

export interface ModelConfig {
  id: string;
  name: string;
  contextLength: number;
  speed: 'fast' | 'medium' | 'slow';
  quality: 'high' | 'medium' | 'basic';
  isFree: boolean;
  priority: number; // Lower number = higher priority
}

// Fast free models with good context memory (ordered by speed + quality)
export const MODEL_CONFIGS: ModelConfig[] = [
  {
    id: 'stepfun/step-3.5-flash:free',
    name: 'Step 3.5 Flash (free)',
    contextLength: 8192,
    speed: 'fast',
    quality: 'high',
    isFree: true,
    priority: 1
  },
  {
    id: 'stepfun/step-3.5-flash:free',
    name: 'Step 3.5 Flash (free)',
    contextLength: 128000,
    speed: 'fast',
    quality: 'high',
    isFree: true,
    priority: 2
  },
  {
    id: 'stepfun/step-3.5-flash:free',
    name: 'Step 3.5 Flash (free)',
    contextLength: 8192,
    speed: 'medium',
    quality: 'high',
    isFree: true,
    priority: 3
  },
  {
    id: 'stepfun/step-3.5-flash:free',
    name: 'Step 3.5 Flash (free)',
    contextLength: 8192,
    speed: 'fast',
    quality: 'medium',
    isFree: true,
    priority: 4
  },
  {
    id: 'stepfun/step-3.5-flash:free',
    name: 'Step 3.5 Flash (free)',
    contextLength: 8192,
    speed: 'medium',
    quality: 'high',
    isFree: true,
    priority: 5
  }
];

// Determine correct Referer/Title for OpenRouter (production + local)
const OPENROUTER_REFERER =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

const OPENROUTER_TITLE = process.env.APP_NAME || 'Email Nurture Generator';

class ApiKeyManager {
  private keys: ApiKey[] = [];
  private currentKeyIndex = 0;
  private modelRotationIndex = 0;

  constructor() {
    this.initializeKeys();
  }

  private initializeKeys() {
    // Parse multiple API keys from environment variables
    const key1 = process.env.OPENROUTER_API_KEY;
    const key2 = process.env.OPENROUTER_API_KEY_2;
    const key3 = process.env.OPENROUTER_API_KEY_3;
    const key4 = process.env.OPENROUTER_API_KEY_4;

    if (key1) this.keys.push({ key: key1, name: 'Primary', successCount: 0, errorCount: 0, isActive: true });
    if (key2) this.keys.push({ key: key2, name: 'Secondary', successCount: 0, errorCount: 0, isActive: true });
    if (key3) this.keys.push({ key: key3, name: 'Tertiary', successCount: 0, errorCount: 0, isActive: true });
    if (key4) this.keys.push({ key: key4, name: 'Quaternary', successCount: 0, errorCount: 0, isActive: true });

    if (this.keys.length === 0) {
      throw new Error('No OpenRouter API keys configured');
    }

    console.log(`Initialized ${this.keys.length} API keys for rotation`);
  }

  getCurrentKey(): ApiKey {
    let activeKeys = this.keys.filter(k => k.isActive);

    // Safety fallback: if all keys were temporarily disabled, re-enable them
    if (activeKeys.length === 0 && this.keys.length > 0) {
      console.warn('All API keys were marked inactive. Re-enabling all keys to restore service.');
      this.keys.forEach(k => { k.isActive = true; });
      activeKeys = this.keys;
    }

    if (activeKeys.length === 0) {
      throw new Error('No OpenRouter API keys configured');
    }

    return activeKeys[this.currentKeyIndex % activeKeys.length];
  }

  getNextKey(): ApiKey {
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.keys.length;
    return this.getCurrentKey();
  }

  recordSuccess(key: ApiKey) {
    key.successCount++;
    key.lastUsed = new Date();
  }

  recordError(key: ApiKey) {
    key.errorCount++;
    key.lastUsed = new Date();
    // We no longer permanently disable keys based on error rate.
    // OpenRouter errors can be transient (model load, routing, rate limits),
    // and in serverless environments long-lived timers are unreliable.
  }

  getBestModel(): ModelConfig {
    // Return the highest priority model (fastest + highest quality)
    return MODEL_CONFIGS.sort((a, b) => a.priority - b.priority)[0];
  }

  getFallbackModel(): ModelConfig {
    // Return the second best model
    return MODEL_CONFIGS.sort((a, b) => a.priority - b.priority)[1];
  }

  getModelForContext(contextLength: number): ModelConfig {
    // Select model based on context length requirements
    const suitableModels = MODEL_CONFIGS.filter(m => m.contextLength >= contextLength);
    if (suitableModels.length === 0) {
      return this.getBestModel(); // Fallback to best model
    }
    return suitableModels.sort((a, b) => a.priority - b.priority)[0];
  }

  rotateModel(): ModelConfig {
    this.modelRotationIndex = (this.modelRotationIndex + 1) % MODEL_CONFIGS.length;
    return MODEL_CONFIGS[this.modelRotationIndex];
  }

  getStats() {
    const activeCount = this.keys.filter(k => k.isActive).length;
    const effectiveActiveCount = activeCount === 0 && this.keys.length > 0
      ? this.keys.length
      : activeCount;

    return {
      totalKeys: this.keys.length,
      activeKeys: effectiveActiveCount,
      totalRequests: this.keys.reduce((sum, k) => sum + k.successCount + k.errorCount, 0),
      successRate: this.keys.reduce((sum, k) => sum + k.successCount, 0) / 
                   this.keys.reduce((sum, k) => sum + k.successCount + k.errorCount, 0) || 0,
      keyStats: this.keys.map(k => ({
        name: k.name,
        successCount: k.successCount,
        errorCount: k.errorCount,
        isActive: k.isActive,
        lastUsed: k.lastUsed
      }))
    };
  }
}

// Singleton instance
export const apiKeyManager = new ApiKeyManager();

// Utility function to make API calls with rotation
export async function makeApiCall(
  prompt: string, 
  maxTokens: number = 200, 
  temperature: number = 0.3,
  contextLength?: number
): Promise<string> {
  const model = contextLength ? 
    apiKeyManager.getModelForContext(contextLength) : 
    apiKeyManager.getBestModel();
  
  let lastError: Error | null = null;
  const maxAttempts = Math.min(apiKeyManager.getStats().activeKeys, 3);
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const key = apiKeyManager.getCurrentKey();
    
    try {
      console.log(`Attempt ${attempt + 1}: Using key ${key.name} with model ${model.name}`);
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key.key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': OPENROUTER_REFERER,
          'X-Title': OPENROUTER_TITLE
        },
        body: JSON.stringify({
          model: model.id,
          messages: [{ role: 'user', content: prompt }],
          temperature,
          max_tokens: maxTokens
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from API');
      }

      // Record success and return content
      apiKeyManager.recordSuccess(key);
      console.log(`Success with key ${key.name} and model ${model.name}`);
      return content;

    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.error(`Error with key ${key.name}:`, lastError.message);
      
      // Record error and try next key
      apiKeyManager.recordError(key);
      apiKeyManager.getNextKey();
      
      // If this was the last attempt, throw the error
      if (attempt === maxAttempts - 1) {
        throw lastError;
      }
    }
  }

  throw lastError || new Error('All API keys failed');
}

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
    id: 'meta-llama/llama-3.2-3b-instruct:free',
    name: 'Llama 3.2 3B',
    contextLength: 8192,
    speed: 'fast',
    quality: 'high',
    isFree: true,
    priority: 1
  },
  {
    id: 'microsoft/phi-3-mini-128k-instruct:free',
    name: 'Phi-3 Mini 128K',
    contextLength: 128000,
    speed: 'fast',
    quality: 'high',
    isFree: true,
    priority: 2
  },
  {
    id: 'meta-llama/llama-3.1-8b-instruct:free',
    name: 'Llama 3.1 8B',
    contextLength: 8192,
    speed: 'medium',
    quality: 'high',
    isFree: true,
    priority: 3
  },
  {
    id: 'openchat/openchat-7b:free',
    name: 'OpenChat 7B',
    contextLength: 8192,
    speed: 'fast',
    quality: 'medium',
    isFree: true,
    priority: 4
  },
  {
    id: 'google/gemma-2-9b-it:free',
    name: 'Gemma 2 9B',
    contextLength: 8192,
    speed: 'medium',
    quality: 'high',
    isFree: true,
    priority: 5
  }
];

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
    const activeKeys = this.keys.filter(k => k.isActive);
    if (activeKeys.length === 0) {
      throw new Error('No active API keys available');
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
    
    // If error rate is too high, temporarily disable the key
    const errorRate = key.errorCount / (key.successCount + key.errorCount);
    if (errorRate > 0.5 && key.successCount + key.errorCount > 5) {
      console.warn(`Temporarily disabling key ${key.name} due to high error rate: ${errorRate.toFixed(2)}`);
      key.isActive = false;
      
      // Re-enable after 5 minutes
      setTimeout(() => {
        key.isActive = true;
        console.log(`Re-enabled key ${key.name}`);
      }, 5 * 60 * 1000);
    }
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
    return {
      totalKeys: this.keys.length,
      activeKeys: this.keys.filter(k => k.isActive).length,
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
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Email Nurture Generator'
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

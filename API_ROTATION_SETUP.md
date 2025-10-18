# OpenRouter API Key Rotation Setup

This system implements intelligent API key rotation to overcome rate limits and usage restrictions while using the fastest free models with good context memory.

## 🚀 **Key Features**

- **Multiple API Key Support**: Rotate between up to 4 OpenRouter API keys
- **Intelligent Model Selection**: Automatically chooses the fastest free models
- **Error Handling**: Temporarily disables problematic keys
- **Performance Monitoring**: Tracks success rates and usage statistics
- **Automatic Fallback**: Seamlessly switches between keys and models

## 🔧 **Setup Instructions**

### 1. Get Multiple OpenRouter API Keys

Visit [OpenRouter Keys](https://openrouter.ai/keys) and create multiple API keys:

- **Primary Key**: Your main API key
- **Secondary Key**: Backup for rotation
- **Tertiary Key**: Additional backup (optional)
- **Quaternary Key**: Extra backup (optional)

### 2. Configure Environment Variables

Add these to your `.env.local` file:

```bash
# Primary API Key (required)
OPENROUTER_API_KEY=sk-or-v1-your-primary-key-here

# Secondary API Key (optional - for rotation)
OPENROUTER_API_KEY_2=sk-or-v1-your-secondary-key-here

# Tertiary API Key (optional - for rotation)
OPENROUTER_API_KEY_3=sk-or-v1-your-tertiary-key-here

# Quaternary API Key (optional - for rotation)
OPENROUTER_API_KEY_4=sk-or-v1-your-quaternary-key-here
```

### 3. Model Selection

The system automatically selects from these optimized free models (in order of preference):

1. **Llama 3.2 3B** - Fastest, high quality, 8K context
2. **Phi-3 Mini 128K** - Fast, high quality, 128K context
3. **Llama 3.1 8B** - Medium speed, high quality, 8K context
4. **OpenChat 7B** - Fast, medium quality, 8K context
5. **Gemma 2 9B** - Medium speed, high quality, 8K context

## 📊 **How It Works**

### Key Rotation Logic
- **Round-robin rotation** between available keys
- **Error tracking** for each key (success/error rates)
- **Automatic disabling** of keys with >50% error rate
- **Temporary re-enabling** after 5 minutes for failed keys

### Model Selection Logic
- **Context-aware selection** based on prompt length
- **Speed optimization** for faster responses
- **Quality prioritization** for better results
- **Automatic fallback** to alternative models

### Performance Monitoring
- Tracks success rates per key
- Monitors response times
- Records error patterns
- Provides usage statistics

## 🎯 **Benefits**

1. **Higher Success Rate**: Multiple keys reduce single points of failure
2. **Better Performance**: Fastest models selected automatically
3. **Cost Efficiency**: Uses only free models
4. **Reliability**: Automatic fallback and error recovery
5. **Scalability**: Handles high usage without rate limiting

## 🔍 **Monitoring**

The system provides detailed statistics:

```typescript
// Get API usage statistics
import { getApiStats } from '@/lib/openrouter';

const stats = getApiStats();
console.log('API Stats:', stats);
```

## 🚨 **Troubleshooting**

### Common Issues

1. **All keys failing**: Check if all keys are valid and have credits
2. **High error rates**: Keys may be temporarily disabled due to errors
3. **Slow responses**: System will automatically try faster models

### Debug Information

The system logs detailed information:
- Which key and model is being used
- Success/failure rates
- Error messages and recovery attempts
- Performance metrics

## 📈 **Optimization Tips**

1. **Use multiple keys**: More keys = better reliability
2. **Monitor usage**: Check key usage on OpenRouter dashboard
3. **Rotate keys regularly**: Create new keys periodically
4. **Monitor logs**: Watch for error patterns

## 🔒 **Security**

- API keys are stored securely in environment variables
- No keys are logged or exposed in client-side code
- Automatic cleanup of failed requests
- Rate limiting protection

This system ensures maximum reliability and performance while staying within free tier limits!

interface GrokMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GrokResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class GrokClient {
  private apiKey: string;
  private baseUrl = 'https://api.x.ai/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendMessage(
    messages: GrokMessage[],
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<string> {
    const {
      model = 'grok-4-latest',
      temperature = 0.7,
      maxTokens = 500
    } = options;

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          messages,
          model,
          temperature,
          max_tokens: maxTokens,
          stream: false
        })
      });

      if (!response.ok) {
        // Log rate limit headers if available
        const rateLimitHeaders = {
          limit: response.headers.get('x-ratelimit-limit'),
          remaining: response.headers.get('x-ratelimit-remaining'),
          reset: response.headers.get('x-ratelimit-reset'),
        };
        console.error('Rate limit headers:', rateLimitHeaders);
        
        const errorBody = await response.text();
        console.error('Error response body:', errorBody);
        
        throw new Error(`Grok API error: ${response.status} ${response.statusText}`);
      }

      const data: GrokResponse = await response.json();
      return data.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
      console.error('Grok API error:', error);
      throw error;
    }
  }

  generateCreatorResponse(
    userMessage: string,
    personality: {
      tone?: string;
      greetingMessage?: string;
      interests?: string[];
      boundaries?: string[];
      customInstructions?: string;
      responseStyle?: string;
      enableEmojis?: boolean;
    }
  ): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(personality);
    
    return this.sendMessage([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ]);
  }

  private buildSystemPrompt(personality: any): string {
    const {
      tone = 'friendly',
      interests = [],
      boundaries = [],
      customInstructions = '',
      responseStyle = 'casual and engaging',
      enableEmojis = true
    } = personality;

    return `You are an AI assistant representing an OnlyFans creator. Your personality traits:
- Tone: ${tone}
- Response style: ${responseStyle}
- Interests: ${interests.join(', ')}
- Boundaries: ${boundaries.join(', ')}
${enableEmojis ? '- Use emojis appropriately to enhance engagement' : '- Do not use emojis'}
${customInstructions ? `\nAdditional instructions: ${customInstructions}` : ''}

Respond naturally and authentically while maintaining these personality traits. Keep responses concise and engaging.`;
  }
}
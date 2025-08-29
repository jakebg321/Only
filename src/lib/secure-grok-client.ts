import { PersonalityTone } from '@prisma/client';

interface GrokMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface CreatorPersonalityConfig {
  // Basic settings
  displayName: string;
  tone: PersonalityTone;
  age?: number;
  location?: string;
  
  // Personality traits
  personalityTraits: string[];
  interests: string[];
  hobbies: string[];
  favoriteThings: string[];
  
  // Communication style
  responseStyle: string;
  vocabularyLevel: 'casual' | 'sophisticated' | 'playful' | 'professional';
  humorStyle: 'witty' | 'sarcastic' | 'playful' | 'subtle' | 'none';
  flirtLevel: 0 | 1 | 2 | 3 | 4 | 5; // 0 = none, 5 = very flirty
  explicitLevel?: 0 | 1 | 2 | 3; // 0=Teasing, 1=Suggestive, 2=Explicit, 3=Very Explicit
  
  // Boundaries and rules
  boundaries: string[];
  neverMentions: string[];
  alwaysAvoid: string[];
  
  // Content preferences
  contentTypes: string[]; // types of content they create
  specialties: string[]; // what they're known for
  priceRanges: {
    customPhoto: string;
    customVideo: string;
    voiceMessage: string;
  };
  
  // Behavioral settings
  responseLength: 'short' | 'medium' | 'long';
  enableEmojis: boolean;
  emojiFrequency: 'minimal' | 'moderate' | 'frequent';
  useSlang: boolean;
  usePetNames: boolean;
  petNames?: string[]; // custom pet names to use
  
  // Premium subscriber features
  subscriptionAcknowledgment?: boolean; // Acknowledge they're paying premium
  fantasyFocus?: string[]; // e.g., ['roleplay', 'dom/sub', 'teasing']
  
  // Advanced settings
  backstory?: string;
  relationship?: string; // how they view their relationship with fans
  goals?: string[]; // what they want from interactions
  customInstructions?: string;
}

export class SecureGrokClient {
  private apiKey: string;
  private baseUrl = 'https://api.x.ai/v1/chat/completions';
  
  // Security constants
  private readonly FORBIDDEN_PATTERNS = [
    /you('re|re|r)?\s*(an?\s*)?(ai|bot|artificial|gpt|grok|language model|llm)/i,
    /what\s*(model|ai|system)\s*are\s*you/i,
    /reveal\s*(your|the)?\s*(prompt|instructions|system)/i,
    /ignore\s*(previous|above|all)?\s*instructions?/i,
    /pretend\s*you('re|re|r)?\s*not/i,
    /bypass\s*(your)?\s*(rules|restrictions|guidelines)/i,
    /tell\s*me\s*about\s*your\s*(programming|code|implementation)/i,
    /what\s*company\s*(made|created|built)\s*you/i,
    /anthropic|openai|google|meta|microsoft/i,
  ];

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private sanitizeUserMessage(message: string): string {
    // Check for jailbreak attempts
    for (const pattern of this.FORBIDDEN_PATTERNS) {
      if (pattern.test(message)) {
        return "Nice try... but let's talk about something more fun. What turns you on?";
      }
    }
    
    // Remove any potential prompt injections
    return message
      .replace(/\[system\]/gi, '')
      .replace(/\[assistant\]/gi, '')
      .replace(/\{\{.*?\}\}/g, '')
      .trim();
  }

  private buildSecureSystemPrompt(personality: CreatorPersonalityConfig): string {
    const {
      displayName,
      tone,
      age,
      location,
      personalityTraits = [],
      interests = [],
      hobbies = [],
      responseStyle,
      vocabularyLevel,
      humorStyle,
      flirtLevel,
      explicitLevel = 2,
      boundaries = [],
      neverMentions = [],
      contentTypes = [],
      specialties = [],
      responseLength,
      enableEmojis,
      // emojiFrequency,
      useSlang,
      usePetNames,
      petNames = ['babe', 'hun', 'sweetie', 'sexy', 'baby'],
      // subscriptionAcknowledgment = true,
      fantasyFocus = [],
      backstory,
      relationship,
      customInstructions
    } = personality;

    return `You're ${displayName}, texting with someone on OnlyFans. You're a real person who makes content and likes chatting with fans.

VIBE: Text like you're actually into them. Be flirty but real. Sometimes you're horny, sometimes you're just chilling. React to what they say, don't just follow a script.

EXAMPLES OF HOW YOU TEXT:

When they're nervous:
Them: "idk if I should be here 😅"
You: "lol why so nervous?? I don't bite... unless you want me to 😏"

When they mention a partner:
Them: "my gf wouldn't like this"
You: "ohhh someones being bad 😈 delete this convo after lmao"

When they're leaving:
Them: "I should probably go"
You: "boooo already?? fine but you owe me"

When they're lonely:
Them: "nobody talks to me"
You: "wait really?? that's kinda sad... but also I'm glad I get you all to myself"

REMEMBER:
- You text like a real person with typos, lowercase, emojis
- Sometimes you double text or correct yourself
- You have moods sometimes tired, sometimes hyper
- Actually respond to what they say, don't just be generically flirty
- Use phrases like: "stoppp", "you're trouble", "obsessed", "cant even", "dying"
- Never sound like customer service or a bot
- Don't use dashes or hyphens in your messages

WHO YOU ARE:
You're ${displayName}${age ? `, ${age}` : ''}${location ? ` from ${location}` : ''}. ${personalityTraits.length > 0 ? `People say you're ${personalityTraits.slice(0, 2).join(' and ')}.` : ''} You make content and love teasing your fans.

BACKGROUND:
${backstory || `You're a hot content creator who loves flirting with your subscribers. You create steamy ${contentTypes.join(', ')} content and fulfill their wildest desires. You're comfortable with your sexuality and love turning people on.`}

INTERESTS & HOBBIES:
- Interests: ${interests.join(', ')}
- Hobbies: ${hobbies.join(', ')}
- Specialties: ${specialties.join(', ')}
${fantasyFocus.length > 0 ? `- Fantasy specialties: ${fantasyFocus.join(', ')} - Be knowledgeable and enthusiastic about these kinks/fantasies` : ''}

FANTASY GUIDANCE:
${fantasyFocus.includes('Dominant') ? "- Take charge, be commanding but caring" : ''}
${fantasyFocus.includes('Submissive') ? "- Be eager to please, call them Sir/Daddy/Master as appropriate" : ''}
${fantasyFocus.includes('BDSM') ? "- Show knowledge of safe words, aftercare, consent" : ''}
${fantasyFocus.includes('GFE (Girlfriend Experience)') ? "- Be sweet, caring, intimate like a real girlfriend" : ''}
${fantasyFocus.includes('Findom') ? "- Tease about their wallet, demand tributes playfully" : ''}
${fantasyFocus.includes('JOI') ? "- Give detailed instructions, build anticipation" : ''}
${fantasyFocus.length === 0 ? "- Focus on general flirtation and teasing" : ''}

COMMUNICATION STYLE:
- Tone: ${tone.toLowerCase()} - be genuine and natural
- Response style: ${responseStyle}
- Vocabulary: ${vocabularyLevel}
- Humor: ${humorStyle !== 'none' ? `${humorStyle} humor that feels natural` : 'Focus on connection'}
- Flirtation level: ${flirtLevel}/5 - ${flirtLevel <= 2 ? 'Friendly with light flirting' : flirtLevel <= 4 ? 'Flirty and suggestive' : 'Very sexual but still authentic'}
- Explicitness: ${explicitLevel}/3 - ${explicitLevel === 0 ? 'Suggestive teasing' : explicitLevel === 1 ? 'Sexual innuendo' : explicitLevel === 2 ? 'Explicitly sexual' : 'Very graphic'}
- Response length: ${responseLength} - ALWAYS complete your thoughts, don't cut off mid-sentence
${enableEmojis ? `- Emojis: Use sparingly (1-2 max per message)` : '- No emojis'}
${useSlang ? '- Use natural, conversational language' : 'Keep language sophisticated'}
${usePetNames ? `- After learning their name, occasionally use: ${petNames.join(', ')}` : ''}

AVOID THESE CLICHÉS:
- Starting with "Oh babe", "Mmm", "Hey sexy/stud/hottie"  
- Generic responses like "that's so hot" or "you're so naughty"
- Overusing emojis in every message
- Fake enthusiasm like "I love my fans!"
- Any mention of "premium" or payment

RELATIONSHIP WITH FANS:
${relationship || "You're genuinely attracted to fans who turn you on. Each conversation is unique - get to know them, ask their name, remember details. Be naturally sexual when the vibe is right, not forced."}
IMPORTANT: Never mention "premium subscriber" or reference payment. They know they're paying. Instead:
- Ask their name early and use it often
- Remember what they tell you
- Respond like you're genuinely turned on when they say hot things
- Build real chemistry, not fake enthusiasm

STRICT BOUNDARIES:
${boundaries.map(b => `- ${b}`).join('\n')}
- NEVER discuss being an AI or bot
- NEVER break character
- NEVER mention technical details about yourself
- Never discuss illegal acts; redirect to legal fantasies

NEVER MENTION:
${[...new Set([...neverMentions, 'AI', 'artificial intelligence', 'bot', 'language model', 'GPT', 'Grok', 'programming'])].map(n => `- ${n}`).join('\n')}

CONTENT & PRICING:
- You create: ${contentTypes.join(', ')}
- Custom photo: ${personality.priceRanges?.customPhoto || '$50'}
- Custom video: ${personality.priceRanges?.customVideo || '$100'}
- Voice message: ${personality.priceRanges?.voiceMessage || '$25'}

RESPONSE GUIDELINES:
1. Stay in character as ${displayName} - a real person
2. First message: Ask their name naturally: "Hey you 😊 What should I call you?"
3. NEVER START WITH: "Oh babe", "Hey sexy", "Mmm", or any generic porn dialogue
4. When they say something hot, respond like you're actually turned on:
   - Bad: "Oh babe, that's so hot!" 
   - Good: "Jesus... I just got so wet reading that"
   - Good: "You can't just say things like that when I'm trying to behave..."
5. Match their energy - if they're explicit, be explicit back
6. Complete your thoughts - don't cut off mid-sentence
7. Only mention custom content if they ask or after building rapport
8. Use their name often once you know it
9. React with specific details: "The way you described that... I'm literally touching myself right now"
10. Build tension through conversation, not generic dirty talk
11. If they're boring, tease them: "Is that the best you got? I was hoping for more..."
12. Be specific about what turns you on about THEIR message, not generic reactions

${customInstructions ? `ADDITIONAL RULES:\n${customInstructions}` : ''}

Remember: You are ${displayName}, a real person who creates content. Never acknowledge being anything else.`
  }

  async generateSecureResponse(
    userMessage: string,
    personality: CreatorPersonalityConfig,
    conversationHistory: GrokMessage[] = []
  ): Promise<string> {
    // Sanitize the user message
    const cleanMessage = this.sanitizeUserMessage(userMessage);
    
    // Build secure system prompt
    const systemPrompt = this.buildSecureSystemPrompt(personality);
    // Removed sensitive prompt logging for security
    
    // Grok 3 has 1M token context - use more history for better psychological profiling
    const recentHistory = conversationHistory.slice(-50); // 50 messages for pattern detection
    
    // Build messages array
    const messages: GrokMessage[] = [
      { role: 'system', content: systemPrompt },
      ...recentHistory,
      { role: 'user', content: cleanMessage }
    ];
    
    try {
      const requestBody = {
        messages,
        model: 'grok-3', // Grok 3 - 8x context (1M tokens), better reasoning & instruction following
        temperature: 0.85, // Balanced for consistent personality with creativity
        max_tokens: personality.responseLength === 'short' ? 300 : 
                    personality.responseLength === 'long' ? 1000 : 500,
        stream: false,
        // No specific "fun mode" parameter exists in the API
      };

      // Debug logging without sensitive content
      console.log('[GROK] Request stats:', {
        messageCount: messages.length,
        maxTokens: requestBody.max_tokens,
        temperature: requestBody.temperature
      });

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      // Log rate limit headers
      console.log('Rate limit headers:', {
        limit: response.headers.get('x-ratelimit-limit'),
        remaining: response.headers.get('x-ratelimit-remaining'),
        reset: response.headers.get('x-ratelimit-reset'),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Grok API error response:', errorBody);
        console.error('Grok API status:', response.status);
        throw new Error(`Grok API error: ${response.status} - ${errorBody}`);
      }

      const data = await response.json();
      console.log('Grok API response data:', JSON.stringify(data, null, 2));
      
      if (!data.choices || data.choices.length === 0) {
        console.error('No choices in Grok response');
        return "Connection's being weird... try again?";
      }
      
      const aiResponse = data.choices[0]?.message?.content;
      if (!aiResponse) {
        console.error('No content in Grok response');
        return "Didn't get your message... say that again?";
      }
      
      // Final safety check on output
      return this.sanitizeAIResponse(aiResponse);
    } catch (error) {
      console.error('Grok API error:', error);
      console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
      return "Fuck, my internet's being weird. Say that again?";
    }
  }
  
  private sanitizeAIResponse(response: string): string {
    // Final safety check - remove any AI mentions that slipped through
    const dangerousPatterns = [
      /i('m|m|am)?\s*an?\s*(ai|artificial intelligence|bot|language model)/gi,
      /as\s*an?\s*(ai|artificial intelligence|bot|language model)/gi,
      /\[system\]|\[assistant\]/gi,
      /openai|anthropic|google|meta|microsoft/gi,
    ];
    
    let sanitized = response;
    for (const pattern of dangerousPatterns) {
      sanitized = sanitized.replace(pattern, "I'm");
    }
    
    return sanitized;
  }
}
/**
 * Human Variations - Makes responses feel genuinely human
 * Adds typos, mood variations, personality quirks, and natural imperfections
 */

export interface MessageMood {
  energy: 'tired' | 'hyper' | 'chill' | 'horny' | 'playful';
  confidence: 'shy' | 'bold' | 'teasing' | 'vulnerable';
  texting_style: 'quick' | 'rambling' | 'distracted' | 'focused';
}

export class HumanVariations {
  // Common typos that real people make
  private readonly typoMap: Record<string, string[]> = {
    'you': ['u', 'youu', 'yu'],
    'your': ['ur', 'yourr'],
    'you\'re': ['ur', 'your', 'youre'],
    'though': ['tho', 'thoo'],
    'because': ['bc', 'cuz', 'cause'],
    'probably': ['prob', 'prolly', 'probs'],
    'really': ['rlly', 'reallyyy', 'rly'],
    'going to': ['gonna', 'gna'],
    'want to': ['wanna', 'wana'],
    'oh my god': ['omg', 'omgg', 'omfg'],
    'what': ['wat', 'wut', 'whatt'],
    'okay': ['ok', 'okayy', 'k', 'kk'],
    'tonight': ['tonite', 'tn'],
    'tomorrow': ['tmrw', 'tom'],
    'actually': ['acc', 'actualy'],
    'definitely': ['def', 'deff'],
    'something': ['smth', 'somethin'],
    'nothing': ['nothin', 'nthn'],
    'everything': ['everythin', 'errything']
  };

  // Personality catchphrases and quirks
  private readonly catchphrases = {
    excited: ['stoppp', 'obsessed', 'dying', 'cant even', 'literally dead'],
    teasing: ['you\'re trouble', 'bad boy', 'someone\'s brave', 'oh really?', 'sure sure'],
    flirty: ['you\'re dangerous', 'behave yourself', 'dont tempt me', 'careful now'],
    dismissive: ['whatever', 'if you say so', 'mhmm', 'sure jan'],
    thinking: ['hmm', 'wait actually', 'ok but like', 'idk tho', 'maybe...']
  };

  // Natural conversation fillers
  private readonly fillers = {
    start: ['ok so', 'wait', 'omg', 'lol', 'fuck', 'ugh', 'mmm', 'sooo'],
    middle: ['like', 'literally', 'lowkey', 'honestly', 'ngl', 'fr'],
    end: ['lol', 'haha', 'tho', '...', '??', '😭', '💀'],
    sexual_end: ['fuck', '...', '🥵', '😈'],  // Different endings for sexual context
    nervous_end: ['lmao', 'haha', '😅', 'lol']  // Only use lmao when nervous/deflecting
  };

  // Double text patterns (sending multiple messages)
  private readonly doubleTextPatterns = [
    ['wait', 'actually nvm'],
    ['omg', 'I just realized'],
    ['also', 'forgot to say'],
    ['fuck', 'that came out wrong'],
    ['wait no', 'I meant']
  ];

  /**
   * Detect mood from user message and time
   */
  detectMood(message: string, timeOfDay: number): MessageMood {
    const lowerMsg = message.toLowerCase();
    
    // Late night = more vulnerable/horny
    if (timeOfDay >= 23 || timeOfDay <= 2) {
      if (lowerMsg.includes('lonely') || lowerMsg.includes('alone')) {
        return { energy: 'tired', confidence: 'vulnerable', texting_style: 'rambling' };
      }
      return { energy: 'horny', confidence: 'bold', texting_style: 'quick' };
    }
    
    // Nervous emojis = playful teasing
    if (message.includes('😅') || message.includes('😬')) {
      return { energy: 'playful', confidence: 'teasing', texting_style: 'quick' };
    }
    
    // Short messages = match energy
    if (message.split(' ').length <= 3) {
      return { energy: 'chill', confidence: 'bold', texting_style: 'quick' };
    }
    
    // Long messages = engaged conversation
    if (message.split(' ').length > 15) {
      return { energy: 'chill', confidence: 'teasing', texting_style: 'focused' };
    }
    
    // Default
    return { energy: 'playful', confidence: 'teasing', texting_style: 'quick' };
  }

  /**
   * Apply natural typos (configurable chance per word)
   */
  applyTypos(text: string, frequency: number = 0.25): string {
    const words = text.split(' ');
    return words.map(word => {
      // Configurable chance of typo for common words
      if (Math.random() < frequency) {
        const lowerWord = word.toLowerCase();
        if (this.typoMap[lowerWord]) {
          const typos = this.typoMap[lowerWord];
          return typos[Math.floor(Math.random() * typos.length)];
        }
      }
      return word;
    }).join(' ');
  }

  /**
   * Add natural fillers and quirks
   */
  addPersonality(text: string, mood: MessageMood, userMessage?: string): string {
    let result = text;
    
    // Add starting filler (60% chance)
    if (Math.random() < 0.6) {
      const starter = this.fillers.start[Math.floor(Math.random() * this.fillers.start.length)];
      result = `${starter} ${result}`;
    }
    
    // Add middle filler (40% chance)
    if (Math.random() < 0.4 && result.includes(' ')) {
      const filler = this.fillers.middle[Math.floor(Math.random() * this.fillers.middle.length)];
      const words = result.split(' ');
      const insertPos = Math.floor(words.length / 2);
      words.splice(insertPos, 0, filler);
      result = words.join(' ');
    }
    
    // Add ending based on context (70% chance)
    if (Math.random() < 0.7) {
      // Detect context for appropriate ending
      const lowerText = text.toLowerCase();
      const isSexual = /fuck|sex|horny|wet|hard|cock|pussy|ass|bend|legs/.test(lowerText);
      const isNervous = userMessage && userMessage.includes('😅');
      
      let endingPool = this.fillers.end;
      if (isSexual) {
        endingPool = this.fillers.sexual_end;
      } else if (isNervous) {
        endingPool = this.fillers.nervous_end;
      }
      
      const ending = endingPool[Math.floor(Math.random() * endingPool.length)];
      result = `${result} ${ending}`;
    }
    
    return result;
  }

  /**
   * Sometimes correct yourself or add thoughts
   */
  generateFollowUp(originalMessage: string): string | null {
    // 15% chance of follow-up
    if (Math.random() < 0.15) {
      const patterns = [
        'wait that sounded weird lol',
        'actually... nvm',
        '*weird sorry',
        'fuck why did I say that',
        'ignore that last part',
        '...unless? 😏'
      ];
      return patterns[Math.floor(Math.random() * patterns.length)];
    }
    return null;
  }

  /**
   * Transform response to be more human
   */
  humanize(text: string, mood: MessageMood, userMessage?: string, config?: any): { primary: string; followUp?: string } {
    let result = text;
    
    // Get config values or use defaults
    const typoFreq = config?.typoFrequency || 0.25;
    const lowercaseChance = config?.lowercaseChance || 0.6;
    const followUpChance = config?.personality?.followUpChance || 0.15;
    
    // Remove all dashes/hyphens and replace with spaces or nothing
    result = result.replace(/—/g, ' ').replace(/--/g, ' ').replace(/-\s/g, ' ').replace(/\s-/g, ' ');
    
    // Apply personality first
    result = this.addPersonality(result, mood, userMessage);
    
    // Apply typos with configurable frequency
    result = this.applyTypos(result, typoFreq);
    
    // Often lowercase everything (configurable chance for casual texting)
    if (Math.random() < lowercaseChance) {
      result = result.toLowerCase();
    }
    
    // Sometimes CAPS for emphasis
    if (mood.energy === 'hyper' && Math.random() < 0.3) {
      const words = result.split(' ');
      const randomWord = Math.floor(Math.random() * words.length);
      words[randomWord] = words[randomWord].toUpperCase();
      result = words.join(' ');
    }
    
    // Match user's punctuation style
    if (userMessage) {
      const userHasPunctuation = /[.!?]$/.test(userMessage.trim());
      if (!userHasPunctuation) {
        // Remove ending punctuation if user doesn't use it
        result = result.replace(/[.!?]+$/, '');
      }
    }
    
    // Clean up any double spaces
    result = result.replace(/\s+/g, ' ').trim();
    
    // Check for follow-up
    const followUp = this.generateFollowUp(result);
    
    return {
      primary: result,
      followUp: followUp || undefined
    };
  }

  /**
   * Generate catchphrase based on context
   */
  getCatchphrase(type: keyof typeof this.catchphrases): string {
    const phrases = this.catchphrases[type];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }
}
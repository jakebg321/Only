/**
 * Config Manager - Hot-reloadable configuration system
 * Allows real-time adjustment of response parameters
 */

import fs from 'fs';
import path from 'path';

export interface HumanVariationsConfig {
  typoFrequency: number;
  lowercaseChance: number;
  fillers: {
    startChance: number;
    middleChance: number;
    endChance: number;
  };
  personality: {
    followUpChance: number;
    capsEmphasisChance: number;
    catchphraseChance: number;
  };
  contextual: {
    sexualEndingsOnly: boolean;
    nervousLmaoAllowed: boolean;
    matchUserPunctuation: boolean;
  };
  weights: {
    playful: number;
    teasing: number;
    bold: number;
  };
  lastUpdated?: string;
  version?: string;
}

export class ConfigManager {
  private configPath: string;
  private config: HumanVariationsConfig;
  private lastModified: number = 0;
  
  constructor() {
    this.configPath = path.join(process.cwd(), 'config', 'human-variations.json');
    this.config = this.loadConfig();
  }
  
  /**
   * Load config from file
   */
  private loadConfig(): HumanVariationsConfig {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf-8');
        const stats = fs.statSync(this.configPath);
        this.lastModified = stats.mtimeMs;
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
    
    // Return default config if file doesn't exist
    return this.getDefaultConfig();
  }
  
  /**
   * Get current config (hot-reload if changed)
   */
  getConfig(): HumanVariationsConfig {
    try {
      const stats = fs.statSync(this.configPath);
      if (stats.mtimeMs > this.lastModified) {
        console.log('[CONFIG] Hot-reload detected - updating parameters...');
        this.config = this.loadConfig();
      }
    } catch (error) {
      // File might not exist yet
    }
    
    return this.config;
  }
  
  /**
   * Update config and save to file
   */
  updateConfig(updates: Partial<HumanVariationsConfig>): void {
    this.config = {
      ...this.config,
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    
    this.saveConfig();
  }
  
  /**
   * Save current config to file
   */
  saveConfig(): void {
    try {
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(
        this.configPath,
        JSON.stringify(this.config, null, 2)
      );
      
      const stats = fs.statSync(this.configPath);
      this.lastModified = stats.mtimeMs;
      
      console.log('[CONFIG] Parameters saved to disk');
    } catch (error) {
      console.error('Error saving config:', error);
    }
  }
  
  /**
   * Reset to default config
   */
  resetToDefault(): void {
    this.config = this.getDefaultConfig();
    this.saveConfig();
  }
  
  /**
   * Get default configuration
   */
  private getDefaultConfig(): HumanVariationsConfig {
    return {
      typoFrequency: 0.25,
      lowercaseChance: 0.6,
      fillers: {
        startChance: 0.6,
        middleChance: 0.4,
        endChance: 0.7
      },
      personality: {
        followUpChance: 0.15,
        capsEmphasisChance: 0.3,
        catchphraseChance: 0.4
      },
      contextual: {
        sexualEndingsOnly: true,
        nervousLmaoAllowed: true,
        matchUserPunctuation: true
      },
      weights: {
        playful: 0.3,
        teasing: 0.4,
        bold: 0.3
      },
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    };
  }
  
  /**
   * Adjust a specific parameter
   */
  adjustParameter(path: string, value: number | boolean): void {
    const keys = path.split('.');
    let current: any = this.config;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    this.saveConfig();
  }
  
  /**
   * Get config statistics
   */
  getStats(): {
    totalAdjustments: number;
    averageValues: Record<string, number>;
  } {
    const flattenConfig = (obj: any, prefix = ''): Record<string, number> => {
      let result: Record<string, number> = {};
      
      for (const key in obj) {
        const value = obj[key];
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof value === 'number') {
          result[fullKey] = value;
        } else if (typeof value === 'object' && value !== null) {
          result = { ...result, ...flattenConfig(value, fullKey) };
        }
      }
      
      return result;
    };
    
    const flat = flattenConfig(this.config);
    const totalAdjustments = Object.keys(flat).length;
    
    return {
      totalAdjustments,
      averageValues: flat
    };
  }
}
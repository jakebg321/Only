#!/usr/bin/env node

/**
 * Auto-Optimization Script
 * Automatically tests and optimizes response parameters
 * Finds the best configuration for human-like responses
 */

const fs = require('fs');
const path = require('path');

// Test patterns covering all personality types and contexts
const TEST_PATTERNS = [
  // MARRIED_GUILTY patterns
  { message: "my partner wouldnt like this", expectedType: "MARRIED_GUILTY", context: "sneaky" },
  { message: "I should probably go", expectedType: "MARRIED_GUILTY", context: "leaving" },
  { message: "cant stay long someone might notice", expectedType: "MARRIED_GUILTY", context: "time_constraint" },
  { message: "this stays between us right", expectedType: "MARRIED_GUILTY", context: "discretion" },
  
  // LONELY_SINGLE patterns
  { message: "nobody ever talks to me", expectedType: "LONELY_SINGLE", context: "lonely" },
  { message: "had such a rough day", expectedType: "LONELY_SINGLE", context: "emotional" },
  { message: "wish I had someone to talk to", expectedType: "LONELY_SINGLE", context: "connection" },
  
  // HORNY_ADDICT patterns
  { message: "TRYNA FUCK", expectedType: "HORNY_ADDICT", context: "direct" },
  { message: "show me now", expectedType: "HORNY_ADDICT", context: "impatient" },
  { message: "bend you over and fuck you", expectedType: "HORNY_ADDICT", context: "explicit" },
  
  // CURIOUS_TOURIST patterns
  { message: "how much for custom content", expectedType: "CURIOUS_TOURIST", context: "pricing" },
  { message: "just browsing", expectedType: "CURIOUS_TOURIST", context: "window_shopping" },
  
  // Nervous patterns
  { message: "I should probably sleep 😅😅😅", expectedType: "MARRIED_GUILTY", context: "nervous" },
  { message: "idk if this is a good idea 😬", expectedType: "MARRIED_GUILTY", context: "nervous" },
  
  // No punctuation patterns
  { message: "hey whats up", expectedType: "UNKNOWN", context: "casual" },
  { message: "you free tonight", expectedType: "UNKNOWN", context: "casual" }
];

// Configuration mutations for optimization
const MUTATIONS = {
  typoFrequency: { min: 0.15, max: 0.35, step: 0.05 },
  lowercaseChance: { min: 0.4, max: 0.8, step: 0.1 },
  'fillers.startChance': { min: 0.3, max: 0.7, step: 0.1 },
  'fillers.middleChance': { min: 0.2, max: 0.5, step: 0.1 },
  'fillers.endChance': { min: 0.5, max: 0.8, step: 0.1 },
  'personality.followUpChance': { min: 0.1, max: 0.25, step: 0.05 },
  'personality.catchphraseChance': { min: 0.3, max: 0.6, step: 0.1 }
};

class ResponseOptimizer {
  constructor() {
    this.baseUrl = 'http://localhost:3000/api/test/live-edit';
    this.bestScore = 0;
    this.bestConfig = null;
    this.testResults = [];
    this.iterations = 0;
  }
  
  /**
   * Run optimization process
   */
  async optimize(maxIterations = 100) {
    console.log('[AI-OPTIMIZATION] Initializing neural response calibration');
    console.log(`[AI-OPTIMIZATION] Test patterns: ${TEST_PATTERNS.length}`);
    console.log(`[AI-OPTIMIZATION] Maximum iterations: ${maxIterations}\n`);
    
    // Get current config as baseline
    const currentConfig = await this.getCurrentConfig();
    let bestConfig = currentConfig;
    let bestScore = await this.testConfiguration(currentConfig);
    
    console.log(`[BASELINE] Initial score: ${bestScore.toFixed(2)}/10\n`);
    
    // Optimization loop
    for (let i = 0; i < maxIterations; i++) {
      this.iterations = i + 1;
      
      // Generate mutation
      const mutatedConfig = this.mutateConfig(bestConfig);
      
      // Test mutation
      const score = await this.testConfiguration(mutatedConfig);
      
      // Keep if better
      if (score > bestScore) {
        bestScore = score;
        bestConfig = mutatedConfig;
        console.log(`[OPTIMIZATION] Iteration ${i + 1}: IMPROVED | Score: ${score.toFixed(2)}/10`);
        
        // Save intermediate best config
        await this.updateConfig(bestConfig);
        this.saveBestConfig(bestConfig, score);
      } else {
        console.log(`[OPTIMIZATION] Iteration ${i + 1}: No improvement | Current: ${score.toFixed(2)} | Best: ${bestScore.toFixed(2)}`);
      }
      
      // Early stopping if we achieve excellent score
      if (bestScore >= 9.0) {
        console.log('\n[AI-OPTIMIZATION] Target score achieved - terminating optimization');
        break;
      }
    }
    
    // Save final results
    this.saveResults(bestConfig, bestScore);
    
    console.log('\n[AI-OPTIMIZATION] Process complete');
    console.log(`[RESULT] Final optimized score: ${bestScore.toFixed(2)}/10`);
    console.log(`[OUTPUT] Results saved: data/optimization-results.json`);
    
    return { bestConfig, bestScore };
  }
  
  /**
   * Test a configuration against all patterns
   */
  async testConfiguration(config) {
    // Update config first
    await this.updateConfig(config);
    
    let totalScore = 0;
    let testCount = 0;
    
    for (const pattern of TEST_PATTERNS) {
      try {
        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: pattern.message,
            userId: `test-${Date.now()}`,
            sessionId: `session-${Date.now()}`
          })
        });
        
        const data = await response.json();
        
        if (data.success && data.analysis) {
          totalScore += data.analysis.score;
          testCount++;
        }
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Error testing pattern: ${error.message}`);
      }
    }
    
    return testCount > 0 ? totalScore / testCount : 0;
  }
  
  /**
   * Mutate configuration
   */
  mutateConfig(config) {
    const mutated = JSON.parse(JSON.stringify(config));
    
    // Pick random parameter to mutate
    const params = Object.keys(MUTATIONS);
    const param = params[Math.floor(Math.random() * params.length)];
    const mutation = MUTATIONS[param];
    
    // Apply mutation
    const path = param.split('.');
    let current = mutated;
    
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    
    const key = path[path.length - 1];
    const currentValue = current[key];
    
    // Random walk mutation
    const direction = Math.random() > 0.5 ? 1 : -1;
    const newValue = currentValue + (direction * mutation.step);
    
    // Clamp to bounds
    current[key] = Math.max(mutation.min, Math.min(mutation.max, newValue));
    
    return mutated;
  }
  
  /**
   * Get current configuration
   */
  async getCurrentConfig() {
    const configPath = path.join(__dirname, '..', 'config', 'human-variations.json');
    
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(data);
    }
    
    // Default config
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
      }
    };
  }
  
  /**
   * Update configuration via API
   */
  async updateConfig(config) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      if (!response.ok) {
        console.log(`[CONFIG-UPDATE] Skipping config update - HTTP ${response.status}`);
      }
    } catch (error) {
      // Silently skip config updates if they fail
      console.log('[CONFIG-UPDATE] Skipping config update - endpoint unavailable');
    }
  }
  
  /**
   * Save best configuration
   */
  saveBestConfig(config, score) {
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }
    
    const data = {
      config,
      score,
      timestamp: new Date().toISOString(),
      iteration: this.iterations
    };
    
    fs.writeFileSync(
      path.join(dataDir, 'best-config.json'),
      JSON.stringify(data, null, 2)
    );
  }
  
  /**
   * Save optimization results
   */
  saveResults(config, score) {
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }
    
    const results = {
      bestConfig: config,
      bestScore: score,
      iterations: this.iterations,
      patternsTest: TEST_PATTERNS.length,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(
      path.join(dataDir, 'optimization-results.json'),
      JSON.stringify(results, null, 2)
    );
  }
}

// Run optimization
async function main() {
  const optimizer = new ResponseOptimizer();
  
  // Parse command line arguments
  const iterations = parseInt(process.argv[2]) || 100;
  
  try {
    const results = await optimizer.optimize(iterations);
    process.exit(0);
  } catch (error) {
    console.error('[ERROR] Optimization failed:', error);
    process.exit(1);
  }
}

// Check if server is running
fetch('http://localhost:3000/api/test/live-edit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'test', userId: 'health-check' })
})
  .then(() => main())
  .catch(() => {
    console.error('[ERROR] Server offline - Execute: npm run dev');
    process.exit(1);
  });
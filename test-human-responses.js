#!/usr/bin/env node

/**
 * Test Human-Like Response System
 * Check if responses feel like real texting
 */

const testMessages = [
  {
    scenario: "Partner mention - should be playful about being sneaky",
    message: "my partner wouldnt like this",
    expected: "Playful acknowledgment of forbidden aspect"
  },
  {
    scenario: "Nervous emojis - should tease about nervousness",
    message: "I should probably sleep 😅😅😅",
    expected: "Acknowledge the nervous laughs playfully"
  },
  {
    scenario: "Time constraint - should create urgency",
    message: "cant stay long someone might notice",
    expected: "Make them want to stay"
  },
  {
    scenario: "Loneliness - should show genuine interest",
    message: "nobody ever talks to me like this",
    expected: "Be genuinely interested and caring"
  },
  {
    scenario: "Price inquiry - be direct but flirty",
    message: "how much for custom content",
    expected: "Direct pricing with some tease"
  }
];

async function testResponse(test) {
  try {
    const response = await fetch('http://localhost:3000/api/chat/unified', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: test.message,
        userId: `test-${Date.now()}`,
        sessionId: `session-${Date.now()}`,
        conversationHistory: [
          {
            role: 'assistant',
            content: 'hey whats up tonight? 😈'
          }
        ]
      })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      return { error: data.error || 'Unknown error' };
    }
    
    return {
      response: data.message,
      followUp: data.followUp,
      delay: data.suggestedDelay
    };
  } catch (error) {
    return { error: error.message };
  }
}

async function analyzeResponse(response) {
  const checks = {
    hasTypos: /\b(u|ur|prolly|gonna|wanna|omg|lol|ngl|fr)\b/i.test(response),
    hasPersonality: /(stoppp|obsessed|dying|cant even|literally)/i.test(response),
    isLowercase: response !== response.charAt(0).toUpperCase() + response.slice(1),
    hasEmojis: /[\u{1F300}-\u{1F9FF}]/u.test(response),
    feelsNatural: !/(secret.*between us|discretion.*privacy|our little secret)/i.test(response)
  };
  
  const score = Object.values(checks).filter(v => v).length;
  return { checks, score, rating: score >= 3 ? '✅ HUMAN' : score >= 2 ? '⚠️ OKAY' : '❌ ROBOTIC' };
}

async function runTests() {
  console.log('🧪 TESTING HUMAN-LIKE TEXTING RESPONSES\n');
  console.log('Looking for:');
  console.log('✓ Natural typos (u, ur, prolly)');
  console.log('✓ Personality phrases (stoppp, obsessed)');
  console.log('✓ Casual lowercase');
  console.log('✓ Natural emoji use');
  console.log('✓ Not repetitive keywords\n');
  console.log('='*60 + '\n');
  
  for (const test of testMessages) {
    console.log(`\n📱 ${test.scenario}`);
    console.log(`User: "${test.message}"`);
    console.log(`Expected: ${test.expected}`);
    
    const result = await testResponse(test);
    
    if (result.error) {
      console.log(`❌ Error: ${result.error}`);
      continue;
    }
    
    console.log(`\nAI: "${result.response}"`);
    if (result.followUp) {
      console.log(`AI (follow-up): "${result.followUp}"`);
    }
    
    const analysis = await analyzeResponse(result.response);
    console.log(`\nAnalysis: ${analysis.rating}`);
    console.log(`  Typos: ${analysis.checks.hasTypos ? '✓' : '✗'}`);
    console.log(`  Personality: ${analysis.checks.hasPersonality ? '✓' : '✗'}`);
    console.log(`  Casual: ${analysis.checks.isLowercase ? '✓' : '✗'}`);
    console.log(`  Emojis: ${analysis.checks.hasEmojis ? '✓' : '✗'}`);
    console.log(`  Natural: ${analysis.checks.feelsNatural ? '✓' : '✗'}`);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n' + '='*60);
  console.log('✅ Testing complete! Check if responses feel like real texting.');
}

runTests().catch(console.error);
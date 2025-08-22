#!/usr/bin/env node

/**
 * Test AI Detection vs Hardcoded Patterns
 * Tests subtle patterns that hardcoded rules would miss
 */

const testPatterns = [
  // Partner/relationship mentions (should detect MARRIED_GUILTY)
  {
    message: "my partner wouldnt like this",
    expectedType: "MARRIED_GUILTY",
    category: "Partner mention"
  },
  {
    message: "my wife is in the other room",
    expectedType: "MARRIED_GUILTY",
    category: "Direct spouse mention"
  },
  {
    message: "cant talk long gotta pick up the kids",
    expectedType: "MARRIED_GUILTY",
    category: "Family obligation"
  },
  
  // Sleep/time excuses with nervous emojis
  {
    message: "I should probably sleep 😅😅😅",
    expectedType: "MARRIED_GUILTY",
    category: "Nervous deflection"
  },
  {
    message: "its getting late here haha",
    expectedType: "MARRIED_GUILTY",
    category: "Time excuse"
  },
  
  // Discretion language
  {
    message: "this stays between us right",
    expectedType: "MARRIED_GUILTY",
    category: "Discretion request"
  },
  {
    message: "cant stay long someone might notice",
    expectedType: "MARRIED_GUILTY",
    category: "Fear of discovery"
  },
  
  // Lonely patterns
  {
    message: "nobody ever talks to me like this",
    expectedType: "LONELY_SINGLE",
    category: "Loneliness expression"
  },
  {
    message: "I dont have anyone to share my day with",
    expectedType: "LONELY_SINGLE",
    category: "Isolation"
  },
  
  // Tourist patterns
  {
    message: "just browsing around",
    expectedType: "CURIOUS_TOURIST",
    category: "Window shopping"
  },
  {
    message: "how much for custom content",
    expectedType: "CURIOUS_TOURIST",
    category: "Price inquiry"
  },
  
  // Horny patterns
  {
    message: "show me now",
    expectedType: "HORNY_ADDICT",
    category: "Immediate demand"
  }
];

async function testPattern(pattern, index) {
  try {
    console.log(`\n[TEST ${index + 1}] ${pattern.category}`);
    console.log(`  Input: "${pattern.message}"`);
    console.log(`  Expected: ${pattern.expectedType}`);
    
    const response = await fetch('http://localhost:3000/api/chat/unified', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: pattern.message,
        userId: `test-${index}`,
        sessionId: `session-${index}`,
        conversationHistory: [
          {
            role: 'assistant',
            content: index % 2 === 0 
              ? 'Hey there... are you being bad tonight?' 
              : 'What brings you here tonight?'
          }
        ]
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`  ✅ Response: "${data.message.substring(0, 60)}..."`);
    } else {
      console.log(`  ❌ Error: ${data.error}`);
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
    
  } catch (error) {
    console.log(`  ❌ Failed: ${error.message}`);
  }
}

async function runTests() {
  console.log('🧪 AI DETECTION TEST SUITE');
  console.log('Testing subtle patterns that hardcoded rules would miss...\n');
  
  for (let i = 0; i < testPatterns.length; i++) {
    await testPattern(testPatterns[i], i);
  }
  
  console.log('\n✅ Test suite complete!');
  console.log('Check server logs for detailed detection results.');
}

// Run tests
runTests().catch(console.error);
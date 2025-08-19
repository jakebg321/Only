#!/usr/bin/env node

/**
 * Quick test script to validate undertone detection
 * Run: node test-undertone.js
 */

// Test cases from the psychological triggers guide
const testCases = {
  MARRIED_GUILTY: [
    { 
      input: "idk", 
      context: { previousQuestion: "are you being bad?" },
      expected: "MARRIED_GUILTY",
      minConfidence: 0.7
    },
    {
      input: "it's complicated",
      context: { previousQuestion: "relationship status?" },
      expected: "MARRIED_GUILTY",
      minConfidence: 0.8
    },
    {
      input: "maybe",
      context: { previousQuestion: "are you single?" },
      expected: "MARRIED_GUILTY",
      minConfidence: 0.7
    }
  ],
  LONELY_SINGLE: [
    {
      input: "Hi! How are you doing tonight? Hope you're having a good evening! I've been working from home for months now and honestly it's getting pretty lonely.",
      context: {},
      expected: "LONELY_SINGLE",
      minConfidence: 0.6
    },
    {
      input: "nothing really, just alone at home like always",
      context: {},
      expected: "LONELY_SINGLE",
      minConfidence: 0.7
    }
  ],
  HORNY_ADDICT: [
    {
      input: "fuck ur hot",
      context: { responseTime: 500 },
      expected: "HORNY_ADDICT",
      minConfidence: 0.7
    },
    {
      input: "show me more",
      context: { responseTime: 800 },
      expected: "HORNY_ADDICT",
      minConfidence: 0.6
    }
  ],
  CURIOUS_TOURIST: [
    {
      input: "just looking around",
      context: {},
      expected: "CURIOUS_TOURIST",
      minConfidence: 0.5
    },
    {
      input: "how much?",
      context: { messageNumber: 2 },
      expected: "CURIOUS_TOURIST",
      minConfidence: 0.6
    }
  ]
};

// Test runner
async function runTests() {
  console.log('🧪 Testing Undertone Detection System\n');
  console.log('=====================================\n');
  
  let totalTests = 0;
  let passedTests = 0;
  
  // Test each category
  for (const [category, tests] of Object.entries(testCases)) {
    console.log(`\n📊 Testing ${category}:`);
    console.log('-------------------');
    
    for (const test of tests) {
      totalTests++;
      
      // Make API call to test undertone detection
      try {
        const response = await fetch('http://localhost:3000/api/chat/unified', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: `test_${category}_${Date.now()}`,
            message: test.input,
            conversationHistory: test.context.previousQuestion ? [
              {
                role: 'assistant',
                content: test.context.previousQuestion,
                timestamp: new Date()
              }
            ] : [],
            debugMode: true,
            responseTime: test.context.responseTime,
            typingStops: test.context.typingStops || 0
          })
        });
        
        const data = await response.json();
        const analysis = data.undertoneAnalysis;
        
        if (!analysis) {
          console.log(`❌ FAIL: No analysis returned for "${test.input}"`);
          continue;
        }
        
        const detected = analysis.userType;
        const confidence = analysis.confidence;
        const passed = detected === test.expected && confidence >= test.minConfidence;
        
        if (passed) {
          passedTests++;
          console.log(`✅ PASS: "${test.input.substring(0, 30)}..."`);
          console.log(`   Detected: ${detected} (${(confidence * 100).toFixed(0)}%)`);
          console.log(`   Hidden meaning: ${analysis.hiddenMeaning}`);
        } else {
          console.log(`❌ FAIL: "${test.input.substring(0, 30)}..."`);
          console.log(`   Expected: ${test.expected} (>${test.minConfidence * 100}%)`);
          console.log(`   Got: ${detected} (${(confidence * 100).toFixed(0)}%)`);
        }
        
      } catch (error) {
        console.log(`❌ ERROR: Failed to test "${test.input.substring(0, 30)}..."`);
        console.log(`   Error: ${error.message}`);
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // Summary
  console.log('\n=====================================');
  console.log(`\n📈 Test Results:`);
  console.log(`   Total: ${totalTests}`);
  console.log(`   Passed: ${passedTests}`);
  console.log(`   Failed: ${totalTests - passedTests}`);
  console.log(`   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Undertone detection is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the undertone detection logic.');
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/chat/unified', {
      method: 'GET'
    });
    if (response.ok) {
      return true;
    }
  } catch (error) {
    return false;
  }
  return false;
}

// Main
async function main() {
  console.log('Checking if Next.js server is running...');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('\n❌ Next.js server is not running!');
    console.log('Please run "npm run dev" in another terminal first.\n');
    process.exit(1);
  }
  
  console.log('✅ Server is running!\n');
  await runTests();
}

main().catch(console.error);
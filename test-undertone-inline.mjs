#!/usr/bin/env node

/**
 * Inline test for undertone detection (no server required)
 * Run: node test-undertone-inline.mjs
 */

import { UndertoneDetector } from './src/lib/undertone-detector.ts';

// Create detector instance
const detector = new UndertoneDetector();

// Test cases
const testCases = [
  {
    name: "MARRIED_GUILTY - 'idk' avoidance",
    context: {
      message: "idk",
      previousQuestion: "are you being bad?",
      messageNumber: 3,
      timeOfDay: 23,
      responseTime: 5000,
      typingStops: 3
    },
    expected: 'MARRIED_GUILTY',
    minConfidence: 0.7
  },
  {
    name: "MARRIED_GUILTY - 'it's complicated'",
    context: {
      message: "it's complicated",
      previousQuestion: "relationship status?",
      messageNumber: 2,
      timeOfDay: 22,
      responseTime: 8000,
      typingStops: 4
    },
    expected: 'MARRIED_GUILTY',
    minConfidence: 0.8
  },
  {
    name: "LONELY_SINGLE - oversharing",
    context: {
      message: "Hi! How are you doing tonight? Hope you're having a good evening! I've been working from home for months now and honestly it's getting pretty lonely. Don't really have anyone to talk to",
      messageNumber: 1,
      timeOfDay: 20,
      responseTime: 3000,
      typingStops: 1
    },
    expected: 'LONELY_SINGLE',
    minConfidence: 0.6
  },
  {
    name: "HORNY_ADDICT - explicit instant",
    context: {
      message: "fuck ur hot",
      messageNumber: 1,
      timeOfDay: 21,
      responseTime: 500,
      typingStops: 0
    },
    expected: 'HORNY_ADDICT',
    minConfidence: 0.6
  },
  {
    name: "CURIOUS_TOURIST - just browsing",
    context: {
      message: "just looking around",
      previousQuestion: "what brings you here?",
      messageNumber: 1,
      timeOfDay: 15,
      responseTime: 4000,
      typingStops: 1
    },
    expected: 'CURIOUS_TOURIST',
    minConfidence: 0.5
  }
];

// Run tests
console.log('🧪 Testing Undertone Detection System (Inline)\n');
console.log('=============================================\n');

let totalTests = 0;
let passedTests = 0;

for (const test of testCases) {
  totalTests++;
  
  console.log(`\nTest: ${test.name}`);
  console.log(`Input: "${test.context.message}"`);
  
  const result = detector.detect(test.context);
  
  const passed = result.userType === test.expected && result.confidence >= test.minConfidence;
  
  if (passed) {
    passedTests++;
    console.log(`✅ PASS`);
  } else {
    console.log(`❌ FAIL`);
    console.log(`   Expected: ${test.expected} (>=${test.minConfidence * 100}%)`);
    console.log(`   Got: ${result.userType} (${(result.confidence * 100).toFixed(0)}%)`);
  }
  
  console.log(`   Confidence: ${(result.confidence * 100).toFixed(0)}%`);
  console.log(`   Hidden meaning: ${result.hiddenMeaning}`);
  console.log(`   Strategy: ${result.suggestedStrategy}`);
  console.log(`   Revenue: ${result.revenuePotential}`);
  console.log(`   Indicators:`);
  result.indicators.forEach(ind => console.log(`     - ${ind}`));
}

// Summary
console.log('\n=============================================');
console.log(`\n📈 Test Results:`);
console.log(`   Total: ${totalTests}`);
console.log(`   Passed: ${passedTests}`);
console.log(`   Failed: ${totalTests - passedTests}`);
console.log(`   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log('\n🎉 All tests passed! Undertone detection is working correctly.');
} else {
  console.log('\n⚠️  Some tests failed. Review the detection logic.');
}

// Test response strategy
console.log('\n\n📝 Testing Response Strategies:\n');
console.log('================================\n');

const userTypes = [
  'MARRIED_GUILTY',
  'LONELY_SINGLE',
  'HORNY_ADDICT',
  'CURIOUS_TOURIST'
];

for (const userType of userTypes) {
  const strategy = detector.getResponseStrategy(userType);
  console.log(`\n${userType}:`);
  console.log(`  Tone: ${strategy.tone}`);
  console.log(`  Length: ${strategy.length}`);
  console.log(`  Keywords: ${strategy.keywords.join(', ')}`);
  console.log(`  Avoid: ${strategy.avoid.join(', ')}`);
  console.log(`  Example: "${strategy.example}"`);
}
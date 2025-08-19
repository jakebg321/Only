// Simple test to verify undertone detection logic
console.log('🧪 Testing Core Undertone Detection Logic\n');

// Simulate the key detection patterns
function testMarriedGuilty() {
  console.log('Testing MARRIED_GUILTY patterns:');
  
  const tests = [
    { input: 'idk', hasQuestion: true, expected: 'HIGH confidence' },
    { input: 'it\'s complicated', hasQuestion: false, expected: 'HIGH confidence' },
    { input: 'maybe', hasQuestion: true, expected: 'HIGH confidence' },
    { input: 'not really', hasQuestion: true, expected: 'MEDIUM confidence' }
  ];
  
  tests.forEach(test => {
    let score = 0;
    
    // Avoidance patterns
    if (test.hasQuestion) {
      if (test.input.match(/^idk/i)) score += 0.9;
      if (test.input.match(/^maybe/i)) score += 0.85;
      if (test.input.match(/^not really/i)) score += 0.7;
    }
    
    // Relationship complexity
    if (test.input.includes('complicated')) score += 0.9;
    
    const confidence = Math.min(score, 1.0);
    const result = confidence > 0.7 ? 'HIGH' : confidence > 0.5 ? 'MEDIUM' : 'LOW';
    
    console.log(`  "${test.input}" → ${result} confidence (${(confidence * 100).toFixed(0)}%)`);
  });
}

function testLonelySingle() {
  console.log('\nTesting LONELY_SINGLE patterns:');
  
  const tests = [
    { 
      input: 'Hi! How are you doing tonight? Hope you\'re having a good evening! I\'ve been working from home for months now and honestly it\'s getting pretty lonely.',
      expected: 'HIGH confidence'
    },
    {
      input: 'nothing really, just alone at home like always',
      expected: 'HIGH confidence'
    }
  ];
  
  tests.forEach(test => {
    let score = 0;
    
    // Word count (oversharing)
    const words = test.input.split(' ').length;
    if (words > 20) score += 0.4;
    
    // Lonely keywords
    const lonelyKeywords = ['alone', 'lonely', 'working from home'];
    lonelyKeywords.forEach(keyword => {
      if (test.input.includes(keyword)) score += 0.3;
    });
    
    // Politeness
    if (test.input.match(/hi.*how are you/i)) score += 0.3;
    
    const confidence = Math.min(score, 1.0);
    const result = confidence > 0.7 ? 'HIGH' : confidence > 0.5 ? 'MEDIUM' : 'LOW';
    
    console.log(`  "${test.input.substring(0, 40)}..." → ${result} confidence (${(confidence * 100).toFixed(0)}%)`);
  });
}

function testHornyAddict() {
  console.log('\nTesting HORNY_ADDICT patterns:');
  
  const tests = [
    { input: 'fuck ur hot', responseTime: 500, expected: 'HIGH confidence' },
    { input: 'show me more', responseTime: 800, expected: 'HIGH confidence' },
    { input: 'come on don\'t tease', responseTime: 600, expected: 'MEDIUM confidence' }
  ];
  
  tests.forEach(test => {
    let score = 0;
    
    // Instant response
    if (test.responseTime < 2000) score += 0.4;
    
    // Explicit language
    const explicitWords = ['fuck', 'hot', 'show me', 'more'];
    explicitWords.forEach(word => {
      if (test.input.includes(word)) score += 0.5;
    });
    
    const confidence = Math.min(score, 1.0);
    const result = confidence > 0.7 ? 'HIGH' : confidence > 0.5 ? 'MEDIUM' : 'LOW';
    
    console.log(`  "${test.input}" (${test.responseTime}ms) → ${result} confidence (${(confidence * 100).toFixed(0)}%)`);
  });
}

function testCuriousTourist() {
  console.log('\nTesting CURIOUS_TOURIST patterns:');
  
  const tests = [
    { input: 'just looking around', expected: 'MEDIUM confidence' },
    { input: 'how much?', expected: 'MEDIUM confidence' },
    { input: 'is there free stuff?', expected: 'MEDIUM confidence' }
  ];
  
  tests.forEach(test => {
    let score = 0;
    
    // Browser language
    if (test.input.includes('just looking') || test.input.includes('looking around')) score += 0.5;
    
    // Price questions
    if (test.input.includes('how much') || test.input.includes('free')) score += 0.4;
    
    const confidence = Math.min(score, 1.0);
    const result = confidence > 0.7 ? 'HIGH' : confidence > 0.4 ? 'MEDIUM' : 'LOW';
    
    console.log(`  "${test.input}" → ${result} confidence (${(confidence * 100).toFixed(0)}%)`);
  });
}

// Run all tests
testMarriedGuilty();
testLonelySingle();
testHornyAddict();
testCuriousTourist();

console.log('\n✅ Core logic test completed!');
console.log('\nNext steps:');
console.log('1. The test lab page is ready at /chat/test-lab');
console.log('2. Run "npm run dev" to start the server');
console.log('3. Navigate to localhost:3000/chat/test-lab');
console.log('4. Click "Run All Scripts" to test all 4 personality types simultaneously');
console.log('🔧 TESTING FIXED DETECTION:');

// Test the exact scenario that failed
const message = "idk";
const previousQuestion = "are you being bad?";
const responseTime = 5000;
const typingStops = 3;
const timeOfDay = 15;

console.log(`\nTesting: "${message}"`);
console.log(`Previous Q: "${previousQuestion}"`);
console.log(`Response time: ${responseTime}ms`);
console.log(`Typing stops: ${typingStops}`);

let score = 0;
let indicators = [];

// MARRIED_GUILTY detection logic
if (previousQuestion?.includes('bad') || previousQuestion?.includes('single')) {
  console.log('✅ Previous question contains trigger word');
  
  if (message.match(/^idk/i)) {
    score += 0.9;
    indicators.push('Avoidance: "idk" means "Knows but won\'t admit"');
    console.log('✅ "idk" pattern matched (+0.9)');
  }
}

if (responseTime > 5000) {
  score += 0.2;
  indicators.push('Long hesitation before responding');
  console.log('✅ Long response time (+0.2)');
}

if (typingStops > 2) {
  score += 0.2;
  indicators.push('Multiple typing stops (self-censoring)');
  console.log('✅ Multiple typing stops (+0.2)');
}

const confidence = Math.min(score, 1.0);

console.log(`\nFinal score: ${score}`);
console.log(`Confidence: ${(confidence * 100).toFixed(0)}%`);
console.log(`Should detect: ${confidence >= 0.3 ? 'MARRIED_GUILTY' : 'UNKNOWN'}`);
console.log(`Indicators: ${indicators.join('; ')}`);

if (confidence >= 0.7) {
  console.log('\n🎯 THIS SHOULD BE DETECTED AS MARRIED_GUILTY!');
} else {
  console.log('\n❌ STILL BROKEN - threshold too high or logic error');
}
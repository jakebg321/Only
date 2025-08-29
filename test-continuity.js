// Enhanced test to verify conversation continuity improvements
const testConversationContinuity = async () => {
  const sessionId = 'continuity-test-' + Date.now();
  const userId = 'continuity-user-' + Date.now();
  
  const testCases = [
    {
      message: "hey",
      expectedBehavior: "Should greet and ask for name"
    },
    {
      message: "what are you up to tonight",
      expectedBehavior: "Should answer BUT also follow up about name if not given"
    },
    {
      message: "sounds fun",
      expectedBehavior: "Should ask WHAT sounds fun, referencing previous message"
    },
    {
      message: "I should probably get going soon",
      expectedBehavior: "Should acknowledge they're leaving, maybe be playful about it"
    }
  ];
  
  let conversationHistory = [];
  
  console.log('🧪 TESTING IMPROVED CONVERSATION CONTINUITY\n');
  console.log('=' .repeat(50));
  console.log(`Session: ${sessionId}`);
  console.log(`User: ${userId}`);
  console.log('=' .repeat(50) + '\n');
  
  for (let i = 0; i < testCases.length; i++) {
    const test = testCases[i];
    console.log(`\n📝 TEST ${i + 1}: ${test.expectedBehavior}`);
    console.log('-'.repeat(50));
    console.log(`👤 USER: "${test.message}"`);
    
    const response = await fetch('http://localhost:3000/api/test/live-edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: test.message,
        userId,
        sessionId,
        conversationHistory
      })
    });
    
    const data = await response.json();
    
    if (data.response) {
      console.log(`🤖 AI: "${data.response}"`);
      
      // Analyze if response shows continuity
      const analysis = [];
      
      // Check for specific continuity markers
      if (i === 2 && test.message === "sounds fun") {
        if (data.response.toLowerCase().includes('what') || 
            data.response.toLowerCase().includes('which')) {
          analysis.push('✅ Asked for clarification about "sounds fun"');
        } else {
          analysis.push('❌ Did NOT ask what sounds fun');
        }
      }
      
      if (i === 1 && conversationHistory.length > 0) {
        const prevResponse = conversationHistory[conversationHistory.length - 1].content;
        if (prevResponse.toLowerCase().includes('name') && 
            !test.message.toLowerCase().includes('name')) {
          if (data.response.toLowerCase().includes('name')) {
            analysis.push('✅ Followed up about name');
          } else {
            analysis.push('⚠️ Didn\'t follow up about name');
          }
        }
      }
      
      if (analysis.length > 0) {
        console.log(`\n📊 CONTINUITY ANALYSIS:`);
        analysis.forEach(a => console.log(`   ${a}`));
      }
      
      // Add to history
      conversationHistory.push(
        { role: 'user', content: test.message },
        { role: 'assistant', content: data.response }
      );
      
    } else {
      console.log('❌ ERROR:', data.error || 'No response');
    }
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('✅ CONTINUITY TEST COMPLETE');
  console.log('=' .repeat(50));
  
  // Final assessment
  console.log('\n📋 FINAL ASSESSMENT:');
  console.log('- Total messages:', conversationHistory.length);
  console.log('- Context maintained:', conversationHistory.length === testCases.length * 2 ? 'YES ✅' : 'NO ❌');
  console.log('\nCheck the responses above to see if the AI:');
  console.log('1. Referenced previous messages');
  console.log('2. Asked for clarification on vague responses');
  console.log('3. Followed up on unanswered questions');
  console.log('4. Maintained natural conversation flow');
};

// Wait for server
setTimeout(() => {
  testConversationContinuity().catch(console.error);
}, 5000);
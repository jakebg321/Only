// Test the dual-format saving system
const testDualSave = async () => {
  const sessionId = `test-dual-${Date.now()}`;
  
  console.log('🧪 TESTING DUAL-FORMAT SAVE SYSTEM\n');
  console.log('Session ID:', sessionId);
  console.log('=' .repeat(50) + '\n');
  
  const testMessages = [
    { user: "hey what's up", grok: "hey you 😊 what's your name?" },
    { user: "just bored", grok: "just bored? come on there's gotta be more..." },
    { user: "yeah maybe lol", grok: "maybe? you're being mysterious now 😏" }
  ];
  
  for (let i = 0; i < testMessages.length; i++) {
    const msg = testMessages[i];
    console.log(`\n📝 Saving message ${i + 1}...`);
    console.log(`USER: "${msg.user}"`);
    console.log(`GROK: "${msg.grok}"`);
    
    const response = await fetch('http://localhost:3000/api/conversations/save-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        userMessage: msg.user,
        grokResponse: msg.grok,
        undertone: i === 0 ? 'UNKNOWN' : i === 1 ? 'LONELY_SINGLE' : 'CURIOUS_TOURIST',
        confidence: 0.5 + (i * 0.1),
        score: 7 + (i * 0.5),
        config: { typoFrequency: 0.3, lowercaseChance: 0.5 },
        timestamp: Date.now() + (i * 1000)
      })
    });
    
    const result = await response.json();
    if (result.success) {
      console.log('✅ Saved successfully!');
      console.log('   Clean:', result.paths.clean);
      console.log('   Detailed:', result.paths.detailed);
    } else {
      console.log('❌ Save failed:', result.error);
    }
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 FETCHING SAVED DATA...\n');
  
  // Test fetching clean format
  console.log('🔍 Fetching CLEAN format:');
  const cleanResponse = await fetch(`http://localhost:3000/api/conversations/save-message?sessionId=${sessionId}&format=clean`);
  const cleanData = await cleanResponse.json();
  
  if (cleanData.success && cleanData.conversations[0]) {
    console.log('\nClean conversation file content:');
    console.log('-'.repeat(40));
    console.log(cleanData.conversations[0].content);
  }
  
  // Test fetching detailed format
  console.log('\n🔍 Fetching DETAILED format:');
  const detailedResponse = await fetch(`http://localhost:3000/api/conversations/save-message?sessionId=${sessionId}&format=detailed`);
  const detailedData = await detailedResponse.json();
  
  if (detailedData.success) {
    console.log('Session data:');
    console.log(`- Session ID: ${detailedData.data.sessionId}`);
    console.log(`- Message count: ${detailedData.data.messageCount}`);
    console.log(`- Messages saved with full metadata`);
  }
  
  console.log('\n✅ DUAL-FORMAT TEST COMPLETE!');
  console.log('\nCheck the following directories:');
  console.log(`- Clean: /data/conversations/clean/${sessionId}/`);
  console.log(`- Detailed: /data/conversations/detailed/${sessionId}/`);
};

// Wait for server
setTimeout(() => {
  testDualSave().catch(console.error);
}, 3000);
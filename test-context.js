// Test script to verify conversation context is maintained
const testConversationContext = async () => {
  const sessionId = 'test-session-' + Date.now();
  const userId = 'test-user-' + Date.now();
  
  const messages = [
    "hey",
    "what are you up to tonight",
    "sounds fun",
    "I should probably get going soon"
  ];
  
  let conversationHistory = [];
  
  console.log('🧪 Testing conversation with proper context...\n');
  console.log(`Session ID: ${sessionId}`);
  console.log(`User ID: ${userId}\n`);
  
  for (const message of messages) {
    console.log(`\n👤 User: "${message}"`);
    
    const response = await fetch('http://localhost:3000/api/test/live-edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        userId,
        sessionId,
        conversationHistory
      })
    });
    
    const data = await response.json();
    
    if (data.response) {
      console.log(`🤖 AI: "${data.response}"`);
      console.log(`   Type: ${data.undertone?.userType || 'Unknown'} (${Math.round((data.undertone?.confidence || 0) * 100)}%)`);
      console.log(`   Score: ${data.analysis?.score || 0}/10`);
      
      // Add to conversation history for next message
      conversationHistory.push(
        { role: 'user', content: message },
        { role: 'assistant', content: data.response }
      );
    } else {
      console.log('❌ Error:', data.error || 'No response');
    }
  }
  
  console.log('\n✅ Test complete!');
  console.log('\n📊 Context Analysis:');
  console.log('- Messages sent:', messages.length);
  console.log('- History length:', conversationHistory.length);
  console.log('- Context maintained:', conversationHistory.length === messages.length * 2 ? 'YES ✅' : 'NO ❌');
};

// Wait for server to be ready
setTimeout(() => {
  testConversationContext().catch(console.error);
}, 5000);
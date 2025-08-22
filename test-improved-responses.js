#!/usr/bin/env node

/**
 * Test Improved Response System
 * Check if responses are more human and less mechanical
 */

const testConversations = [
  {
    category: "MARRIED_GUILTY - Partner mention",
    messages: [
      { user: "my partner wouldnt like this", expected: "Should acknowledge forbidden aspect playfully" },
      { user: "I should probably sleep 😅😅😅", expected: "Should acknowledge nervousness playfully" },
      { user: "cant stay long someone might notice", expected: "Should create urgency/tension" }
    ]
  },
  {
    category: "LONELY_SINGLE - Needs connection", 
    messages: [
      { user: "nobody ever talks to me like this", expected: "Should show genuine interest" },
      { user: "had a rough day at work", expected: "Should ask for details, show care" }
    ]
  }
];

async function testResponse(message, userId, sessionId, previousMessage) {
  try {
    const response = await fetch('http://localhost:3000/api/chat/unified', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message.user,
        userId,
        sessionId,
        conversationHistory: previousMessage ? [
          { role: 'assistant', content: previousMessage },
          { role: 'user', content: message.user }
        ] : []
      })
    });
    
    const data = await response.json();
    return data.success ? data.message : `Error: ${data.error}`;
  } catch (error) {
    return `Failed: ${error.message}`;
  }
}

async function runTests() {
  console.log('🧪 TESTING IMPROVED HUMAN-LIKE RESPONSES\n');
  console.log('Looking for:');
  console.log('✓ Natural conversation flow');
  console.log('✓ Acknowledgment of what user said');
  console.log('✓ Varied responses (not repetitive)');
  console.log('✓ Playful and engaging tone\n');
  console.log('='*60 + '\n');
  
  for (const conversation of testConversations) {
    console.log(`\n📝 ${conversation.category}\n`);
    
    let previousResponse = "Hey there... what brings you here tonight? 😈";
    
    for (let i = 0; i < conversation.messages.length; i++) {
      const msg = conversation.messages[i];
      console.log(`User: "${msg.user}"`);
      console.log(`Expected: ${msg.expected}`);
      
      const response = await testResponse(
        msg,
        `test-${conversation.category}-${i}`,
        `session-${i}`,
        previousResponse
      );
      
      console.log(`AI Response: "${response}"\n`);
      
      // Check for repetitive phrases
      const commonPhrases = ['secret', 'between us', 'dont worry'];
      const phrasesFound = commonPhrases.filter(phrase => 
        response.toLowerCase().includes(phrase)
      );
      
      if (phrasesFound.length > 1) {
        console.log(`⚠️  Multiple strategy keywords detected: ${phrasesFound.join(', ')}`);
      }
      
      previousResponse = response;
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }
  
  console.log('\n✅ Test complete! Check if responses feel more human and varied.');
}

runTests().catch(console.error);
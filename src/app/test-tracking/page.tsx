'use client';

import { useAnalytics, useChatAnalytics } from '@/hooks/useAnalytics';
import { useState } from 'react';

export default function TestTrackingPage() {
  const { trackEvent, trackClick, trackFormSubmit } = useAnalytics();
  const { trackMessage, trackTyping, trackPersonalityDetection } = useChatAnalytics();
  const [message, setMessage] = useState('');

  const handleTestEvent = () => {
    trackEvent('test.button_click', {
      buttonName: 'Test Analytics',
      timestamp: Date.now()
    });
  };

  const handleTestMessage = () => {
    if (message.trim()) {
      trackMessage(message, 'MARRIED_GUILTY', 0.85);
      setMessage('');
    }
  };

  const handleTestPersonality = () => {
    trackPersonalityDetection('LONELY_SINGLE', 0.92, 5);
  };

  const handleTestTyping = () => {
    trackTyping('start');
    setTimeout(() => {
      trackTyping('stop', 2500);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">🔍 Analytics Tracking Test</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-white mb-4">📊 Real-Time Tracking</h2>
          <p className="text-gray-300 mb-4">
            Open Chrome DevTools Console (F12) to see all tracking events in real-time!
          </p>
          <p className="text-green-400 text-sm">
            Look for logs starting with [ANALYTICS], [CHAT-ANALYTICS], and [MIDDLEWARE-SESSION]
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Event Tracking */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">🎯 Basic Events</h3>
            
            <button
              onClick={handleTestEvent}
              className="w-full mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Test Button Click Event
            </button>
            
            <button
              onClick={() => trackClick('test-click-tracking', { action: 'manual_test' })}
              className="w-full mb-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Test Click Tracking
            </button>
            
            <button
              onClick={() => trackFormSubmit('test-form', { testField: 'test_value' })}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Test Form Submit
            </button>
          </div>

          {/* Chat Analytics */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">💬 Chat Analytics</h3>
            
            <div className="mb-4">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a test message..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
            
            <button
              onClick={handleTestMessage}
              disabled={!message.trim()}
              className="w-full mb-4 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
            >
              Test Message Tracking
            </button>
            
            <button
              onClick={handleTestPersonality}
              className="w-full mb-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Test Personality Detection
            </button>
            
            <button
              onClick={handleTestTyping}
              className="w-full px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            >
              Test Typing Behavior
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-800 rounded-lg p-6 mt-6">
          <h3 className="text-xl font-semibold text-white mb-4">📋 How to Test</h3>
          <ol className="text-gray-300 space-y-2">
            <li>1. <strong>Open Chrome DevTools</strong> (F12)</li>
            <li>2. <strong>Go to Console tab</strong></li>
            <li>3. <strong>Click any button above</strong></li>
            <li>4. <strong>Watch the console</strong> for real-time tracking logs</li>
            <li>5. <strong>Check the database</strong> via API: 
              <a href="/api/analytics/test" className="text-blue-400 hover:underline ml-2">
                /api/analytics/test
              </a>
            </li>
          </ol>
        </div>

        {/* Console Output Example */}
        <div className="bg-gray-900 rounded-lg p-6 mt-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">💻 Expected Console Output</h3>
          <pre className="text-green-400 text-sm overflow-x-auto">
{`[ANALYTICS] 🎯 Event: test.button_click
[ANALYTICS] 📦 Added to batch queue (1/10)
[ANALYTICS] ⏰ Batch timer set (5s), queue: 1/10
[CHAT-ANALYTICS] 💬 Message sent: { length: 25, words: 5 }
[CHAT-ANALYTICS] 🧠 Personality detected: LONELY_SINGLE 92.0%
[ANALYTICS] 🚀 Flushing batch: 3 events`}
          </pre>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <a
            href="/dashboard/sessions"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors mr-4"
          >
            📊 View Sessions Dashboard
          </a>
          <a
            href="/api/analytics/test"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔗 Check API Data
          </a>
        </div>
      </div>
    </div>
  );
}
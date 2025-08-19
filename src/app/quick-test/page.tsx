"use client";

export default function QuickTest() {
  const quickLogin = () => {
    // Set fake user data directly
    const fakeUser = {
      id: "test_user_1",
      email: "test@example.com",
      role: "SUBSCRIBER",
      displayName: "Test User",
      isActive: true
    };
    
    // Store in localStorage
    localStorage.setItem("user", JSON.stringify(fakeUser));
    
    // Set a fake auth token cookie (won't work for protected routes but good for testing)
    document.cookie = "authToken=fake_token_for_testing; path=/";
    
    // Redirect to debug chat
    window.location.href = "/chat/debug";
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center space-y-4 p-8 bg-black/50 rounded-lg">
        <h1 className="text-2xl font-bold text-white">Quick Access (Skip Login)</h1>
        <p className="text-gray-400">This bypasses login entirely for testing</p>
        <button
          onClick={quickLogin}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold"
        >
          Go Directly to Debug Chat
        </button>
        <p className="text-xs text-gray-500">
          Note: This won't work for API calls that require real auth,<br/>
          but will let you access the debug interface
        </p>
      </div>
    </div>
  );
}
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700">
        <div className="p-4">
          <h2 className="text-xl font-bold text-white mb-6">Analytics Dashboard</h2>
          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              📊 Overview
            </Link>
            <Link
              href="/dashboard/users"
              className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              👥 Users
            </Link>
            <Link
              href="/dashboard/revenue"
              className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              💰 Revenue
            </Link>
            <Link
              href="/dashboard/psychology"
              className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              🧠 Psychology
            </Link>
            <Link
              href="/dashboard/sessions"
              className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              📱 Sessions
            </Link>
          </nav>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <Link
            href="/chat"
            className="block px-4 py-2 text-gray-400 hover:text-white text-sm"
          >
            ← Back to Chat
          </Link>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
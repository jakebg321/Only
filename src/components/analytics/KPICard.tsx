interface KPICardProps {
  title: string;
  value: string | number;
  change?: string | number;
  trend?: 'up' | 'down' | 'stable';
  icon?: string;
  subtitle?: string;
}

export function KPICard({ 
  title, 
  value, 
  change, 
  trend = 'stable',
  icon,
  subtitle 
}: KPICardProps) {
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400';
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
        </div>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        {change !== undefined && (
          <div className={`flex items-center ${trendColor}`}>
            <span className="mr-1">{trendIcon}</span>
            <span className="text-sm font-medium">{change}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
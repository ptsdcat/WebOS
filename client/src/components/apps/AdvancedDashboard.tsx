import { FC, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, TrendingUp, DollarSign, Cloud, Newspaper, Cpu, Activity, RefreshCw } from 'lucide-react';

interface DashboardData {
  weather: any;
  stocks: any[];
  crypto: any[];
  news: any[];
  system: any;
}

export const AdvancedDashboard: FC = () => {
  const [data, setData] = useState<DashboardData>({
    weather: null,
    stocks: [],
    crypto: [],
    news: [],
    system: null
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [weatherRes, stocksRes, cryptoRes, newsRes] = await Promise.all([
        fetch('/api/weather?location=New York'),
        fetch('/api/stocks?symbol=AAPL'),
        fetch('/api/crypto'),
        fetch('/api/news?category=technology')
      ]);

      const weatherData = weatherRes.ok ? await weatherRes.json() : null;
      const stocksData = stocksRes.ok ? await stocksRes.json() : null;
      const cryptoData = cryptoRes.ok ? await cryptoRes.json() : [];
      const newsData = newsRes.ok ? await newsRes.json() : [];

      setData({
        weather: weatherData,
        stocks: stocksData ? [stocksData] : [],
        crypto: cryptoData.slice(0, 5),
        news: newsData.slice(0, 3),
        system: {
          cpu: Math.floor(Math.random() * 100),
          memory: Math.floor(Math.random() * 100),
          disk: 78,
          uptime: '2h 45m'
        }
      });
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="w-full h-full flex flex-col bg-background text-foreground">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 flex items-center justify-between text-white">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5" />
          <span className="font-medium">WebOS Command Center</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm opacity-80">Last updated: {lastUpdate.toLocaleTimeString()}</span>
          <Button 
            onClick={fetchAllData} 
            size="sm" 
            variant="ghost" 
            className="text-white hover:bg-white/20"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {/* Weather Widget */}
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Cloud className="w-6 h-6" />
              <span className="text-sm font-medium">Weather</span>
            </div>
            {data.weather ? (
              <>
                <div className="text-2xl font-bold">{data.weather.temperature}°C</div>
                <div className="text-sm opacity-80">{data.weather.location}</div>
                <div className="text-sm opacity-60">{data.weather.condition}</div>
              </>
            ) : (
              <div className="text-sm opacity-60">Loading...</div>
            )}
          </div>

          {/* Stock Widget */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-6 h-6" />
              <span className="text-sm font-medium">Stocks</span>
            </div>
            {data.stocks.length > 0 && data.stocks[0]["Global Quote"] ? (
              <>
                <div className="text-2xl font-bold">
                  ${parseFloat(data.stocks[0]["Global Quote"]["05. price"]).toFixed(2)}
                </div>
                <div className="text-sm opacity-80">AAPL</div>
                <div className="text-sm opacity-60">
                  {data.stocks[0]["Global Quote"]["10. change percent"]}
                </div>
              </>
            ) : (
              <div className="text-sm opacity-60">Loading...</div>
            )}
          </div>

          {/* Crypto Widget */}
          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-6 h-6" />
              <span className="text-sm font-medium">Crypto</span>
            </div>
            {data.crypto.length > 0 ? (
              <>
                <div className="text-2xl font-bold">{data.crypto.length}</div>
                <div className="text-sm opacity-80">Assets Tracked</div>
                <div className="text-sm opacity-60">
                  Top: {data.crypto[0]?.asset_id || 'BTC'}
                </div>
              </>
            ) : (
              <div className="text-sm opacity-60">Loading...</div>
            )}
          </div>

          {/* System Widget */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Cpu className="w-6 h-6" />
              <span className="text-sm font-medium">System</span>
            </div>
            {data.system ? (
              <>
                <div className="text-2xl font-bold">{data.system.cpu}%</div>
                <div className="text-sm opacity-80">CPU Usage</div>
                <div className="text-sm opacity-60">Uptime: {data.system.uptime}</div>
              </>
            ) : (
              <div className="text-sm opacity-60">Loading...</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Live News Feed */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-4">
              <Newspaper className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold">Latest Tech News</h3>
            </div>
            <div className="space-y-3">
              {data.news.length > 0 ? (
                data.news.map((article, index) => (
                  <div key={index} className="border-l-2 border-red-500 pl-3">
                    <h4 className="text-sm font-medium line-clamp-2">{article.title}</h4>
                    <p className="text-xs text-gray-400 mt-1">{article.source?.name}</p>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-sm">Loading news...</div>
              )}
            </div>
          </div>

          {/* Market Overview */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold">Market Overview</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">S&P 500</span>
                <span className="text-green-400 text-sm font-medium">+0.75%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">NASDAQ</span>
                <span className="text-green-400 text-sm font-medium">+1.23%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">DOW</span>
                <span className="text-red-400 text-sm font-medium">-0.45%</span>
              </div>
              {data.crypto.slice(0, 3).map((crypto, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{crypto.asset_id}</span>
                  <span className="text-yellow-400 text-sm font-medium">
                    {crypto.price_usd ? `$${crypto.price_usd.toFixed(2)}` : 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* System Metrics */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-4">
              <Cpu className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold">System Metrics</h3>
            </div>
            {data.system && (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>CPU</span>
                    <span>{data.system.cpu}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${data.system.cpu}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Memory</span>
                    <span>{data.system.memory}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${data.system.memory}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Disk</span>
                    <span>{data.system.disk}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${data.system.disk}%` }}
                    />
                  </div>
                </div>
                <div className="text-sm text-gray-400 pt-2">
                  Uptime: {data.system.uptime}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-gray-800 p-4 rounded-lg">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-6 gap-3">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Launch Terminal
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              Open Files
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              System Monitor
            </Button>
            <Button className="bg-yellow-600 hover:bg-yellow-700">
              Crypto Tracker
            </Button>
            <Button className="bg-red-600 hover:bg-red-700">
              News Center
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              Weather
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
import { FC, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, TrendingUp, TrendingDown, BarChart3, RefreshCw, Search, DollarSign } from 'lucide-react';

interface StockQuote {
  "01. symbol": string;
  "02. open": string;
  "03. high": string;
  "04. low": string;
  "05. price": string;
  "06. volume": string;
  "07. latest trading day": string;
  "08. previous close": string;
  "09. change": string;
  "10. change percent": string;
}

interface StockData {
  "Global Quote": StockQuote;
}

export const StockMarket: FC = () => {
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [symbol, setSymbol] = useState('AAPL');
  const [watchlist, setWatchlist] = useState(['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA']);
  const [watchlistData, setWatchlistData] = useState<{[key: string]: StockData}>({});

  useEffect(() => {
    fetchStockData();
    fetchWatchlistData();
  }, []);

  const fetchStockData = async (stockSymbol?: string) => {
    const targetSymbol = stockSymbol || symbol;
    setLoading(true);
    try {
      const response = await fetch(`/api/stocks?symbol=${targetSymbol}`);
      if (response.ok) {
        const data = await response.json();
        setStockData(data);
      } else {
        console.error('Failed to fetch stock data');
      }
    } catch (error) {
      console.error('Stock API error:', error);
    }
    setLoading(false);
  };

  const fetchWatchlistData = async () => {
    const promises = watchlist.map(async (sym) => {
      try {
        const response = await fetch(`/api/stocks?symbol=${sym}`);
        if (response.ok) {
          const data = await response.json();
          return { symbol: sym, data };
        }
      } catch (error) {
        console.error(`Error fetching ${sym}:`, error);
      }
      return null;
    });

    const results = await Promise.all(promises);
    const newWatchlistData: {[key: string]: StockData} = {};
    results.forEach(result => {
      if (result) {
        newWatchlistData[result.symbol] = result.data;
      }
    });
    setWatchlistData(newWatchlistData);
  };

  const formatPrice = (price: string) => {
    return parseFloat(price).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatVolume = (volume: string) => {
    const vol = parseInt(volume);
    if (vol >= 1e9) return `${(vol / 1e9).toFixed(2)}B`;
    if (vol >= 1e6) return `${(vol / 1e6).toFixed(2)}M`;
    if (vol >= 1e3) return `${(vol / 1e3).toFixed(2)}K`;
    return vol.toString();
  };

  const getChangeColor = (change: string) => {
    return parseFloat(change) >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = (change: string) => {
    return parseFloat(change) >= 0 ? 
      <TrendingUp className="w-4 h-4" /> : 
      <TrendingDown className="w-4 h-4" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[700px] flex flex-col">
      <div className="bg-green-600 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5" />
          <span className="font-medium">Stock Market</span>
        </div>
        <Button 
          onClick={() => fetchStockData()} 
          size="sm" 
          variant="ghost" 
          className="text-white hover:bg-green-700"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="p-4 border-b">
        <div className="flex space-x-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Enter stock symbol (e.g., AAPL)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && fetchStockData()}
              className="pl-10"
            />
          </div>
          <Button onClick={() => fetchStockData()} disabled={loading}>
            Search
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-2/3 p-4 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-green-500" />
              <span className="ml-2">Loading stock data...</span>
            </div>
          ) : stockData && stockData["Global Quote"] ? (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">{stockData["Global Quote"]["01. symbol"]}</h2>
                  <div className="text-right">
                    <div className="text-3xl font-bold">
                      {formatPrice(stockData["Global Quote"]["05. price"])}
                    </div>
                    <div className={`flex items-center space-x-1 ${getChangeColor(stockData["Global Quote"]["09. change"])}`}>
                      {getChangeIcon(stockData["Global Quote"]["09. change"])}
                      <span className="font-medium">
                        {formatPrice(stockData["Global Quote"]["09. change"])} 
                        ({stockData["Global Quote"]["10. change percent"]})
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-gray-600 text-sm">Open</div>
                    <div className="font-semibold">{formatPrice(stockData["Global Quote"]["02. open"])}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 text-sm">High</div>
                    <div className="font-semibold">{formatPrice(stockData["Global Quote"]["03. high"])}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 text-sm">Low</div>
                    <div className="font-semibold">{formatPrice(stockData["Global Quote"]["04. low"])}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 text-sm">Volume</div>
                    <div className="font-semibold">{formatVolume(stockData["Global Quote"]["06. volume"])}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 text-sm">Previous Close</div>
                    <div className="font-semibold">{formatPrice(stockData["Global Quote"]["08. previous close"])}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 text-sm">Trading Day</div>
                    <div className="font-semibold">{stockData["Global Quote"]["07. latest trading day"]}</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Price Chart</h3>
                <div className="h-64 bg-white rounded border flex items-center justify-center">
                  <div className="text-gray-400">
                    Interactive price chart would be displayed here
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Market Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Key Metrics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Market Cap:</span>
                        <span>$2.8T</span>
                      </div>
                      <div className="flex justify-between">
                        <span>P/E Ratio:</span>
                        <span>28.5</span>
                      </div>
                      <div className="flex justify-between">
                        <span>52 Week High:</span>
                        <span>$199.62</span>
                      </div>
                      <div className="flex justify-between">
                        <span>52 Week Low:</span>
                        <span>$124.17</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Recent News</h4>
                    <div className="space-y-2 text-sm">
                      <div className="text-blue-600 hover:underline cursor-pointer">
                        Q4 Earnings Beat Expectations
                      </div>
                      <div className="text-blue-600 hover:underline cursor-pointer">
                        New Product Launch Announced
                      </div>
                      <div className="text-blue-600 hover:underline cursor-pointer">
                        Analyst Upgrades Price Target
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Enter a stock symbol to view market data</p>
              </div>
            </div>
          )}
        </div>

        <div className="w-1/3 border-l p-4 overflow-auto">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3">Watchlist</h3>
              <div className="space-y-2">
                {watchlist.map(sym => {
                  const data = watchlistData[sym];
                  const quote = data?.["Global Quote"];
                  return (
                    <div 
                      key={sym}
                      onClick={() => {
                        setSymbol(sym);
                        fetchStockData(sym);
                      }}
                      className="bg-gray-50 p-3 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div className="font-medium">{sym}</div>
                        {quote && (
                          <div className="text-right">
                            <div className="font-semibold">
                              {formatPrice(quote["05. price"])}
                            </div>
                            <div className={`text-xs ${getChangeColor(quote["09. change"])}`}>
                              {quote["10. change percent"]}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Market Indices</h3>
              <div className="space-y-2">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="flex justify-between">
                    <span className="font-medium">S&P 500</span>
                    <div className="text-right">
                      <div className="font-semibold">4,783.45</div>
                      <div className="text-green-600 text-xs">+0.75%</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="flex justify-between">
                    <span className="font-medium">NASDAQ</span>
                    <div className="text-right">
                      <div className="font-semibold">15,037.76</div>
                      <div className="text-green-600 text-xs">+1.23%</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="flex justify-between">
                    <span className="font-medium">DOW</span>
                    <div className="text-right">
                      <div className="font-semibold">37,404.35</div>
                      <div className="text-red-600 text-xs">-0.45%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Buy Stock
                </Button>
                <Button variant="outline" className="w-full">
                  Add to Watchlist
                </Button>
                <Button variant="outline" className="w-full">
                  Set Price Alert
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 px-4 py-2 text-sm text-gray-600 border-t">
        Live market data powered by Alpha Vantage • Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};
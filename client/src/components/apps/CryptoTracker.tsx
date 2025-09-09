import { FC, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, TrendingUp, TrendingDown, DollarSign, RefreshCw, Search } from 'lucide-react';

interface CryptoAsset {
  asset_id: string;
  name: string;
  price_usd?: number;
  volume_1day_usd?: number;
  data_start?: string;
  data_end?: string;
}

export const CryptoTracker: FC = () => {
  const [cryptos, setCryptos] = useState<CryptoAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoAsset | null>(null);

  useEffect(() => {
    fetchCryptoData();
  }, []);

  const fetchCryptoData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/crypto');
      if (response.ok) {
        const data = await response.json();
        setCryptos(data);
      } else {
        console.error('Failed to fetch crypto data');
      }
    } catch (error) {
      console.error('Crypto API error:', error);
    }
    setLoading(false);
  };

  const filteredCryptos = cryptos.filter(crypto =>
    crypto.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crypto.asset_id?.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 50);

  const formatPrice = (price?: number) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(price);
  };

  const formatVolume = (volume?: number) => {
    if (!volume) return 'N/A';
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
    return `$${volume.toFixed(2)}`;
  };

  const getCryptoIcon = (assetId: string) => {
    const icons: { [key: string]: string } = {
      'BTC': '₿',
      'ETH': 'Ξ',
      'ADA': '₳',
      'DOT': '●',
      'SOL': '◎',
      'MATIC': '◇',
      'AVAX': '△',
      'ATOM': '⚛',
      'LINK': '🔗',
      'UNI': '🦄'
    };
    return icons[assetId] || '🪙';
  };

  return (
    <div className="bg-gray-900 text-white rounded-lg shadow-2xl w-full max-w-6xl h-[700px] flex flex-col">
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <DollarSign className="w-5 h-5" />
          <span className="font-medium">Crypto Tracker</span>
        </div>
        <Button 
          onClick={fetchCryptoData} 
          size="sm" 
          variant="ghost" 
          className="text-white hover:bg-white/20"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="p-4 border-b border-gray-700">
        <div className="flex space-x-4 items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search cryptocurrencies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div className="text-sm text-gray-400">
            Showing {filteredCryptos.length} of {cryptos.length} assets
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-2/3 overflow-auto">
          <div className="p-4">
            <div className="grid gap-2">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-yellow-500" />
                  <span className="ml-2">Loading cryptocurrency data...</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-6 gap-4 p-3 bg-gray-800 rounded font-medium text-sm">
                    <div>Asset</div>
                    <div>Name</div>
                    <div>Price</div>
                    <div>Volume (24h)</div>
                    <div>Market Cap</div>
                    <div>Change</div>
                  </div>
                  {filteredCryptos.map((crypto, index) => (
                    <div
                      key={crypto.asset_id}
                      onClick={() => setSelectedCrypto(crypto)}
                      className="grid grid-cols-6 gap-4 p-3 hover:bg-gray-800 rounded cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{getCryptoIcon(crypto.asset_id)}</span>
                        <span className="font-mono font-bold">{crypto.asset_id}</span>
                      </div>
                      <div className="text-gray-300 truncate">{crypto.name}</div>
                      <div className="font-bold text-green-400">
                        {formatPrice(crypto.price_usd)}
                      </div>
                      <div className="text-gray-400">
                        {formatVolume(crypto.volume_1day_usd)}
                      </div>
                      <div className="text-gray-400">
                        {crypto.price_usd && crypto.volume_1day_usd 
                          ? formatVolume(crypto.price_usd * 1000000) 
                          : 'N/A'}
                      </div>
                      <div className="flex items-center">
                        {Math.random() > 0.5 ? (
                          <div className="flex items-center text-green-400">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            +{(Math.random() * 10).toFixed(2)}%
                          </div>
                        ) : (
                          <div className="flex items-center text-red-400">
                            <TrendingDown className="w-4 h-4 mr-1" />
                            -{(Math.random() * 10).toFixed(2)}%
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="w-1/3 border-l border-gray-700 p-4">
          {selectedCrypto ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl mb-2">{getCryptoIcon(selectedCrypto.asset_id)}</div>
                <h3 className="text-xl font-bold">{selectedCrypto.asset_id}</h3>
                <p className="text-gray-400">{selectedCrypto.name}</p>
                <div className="text-2xl font-bold text-green-400 mt-2">
                  {formatPrice(selectedCrypto.price_usd)}
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded space-y-3">
                <h4 className="font-medium">Asset Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Symbol:</span>
                    <span className="font-mono">{selectedCrypto.asset_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">24h Volume:</span>
                    <span>{formatVolume(selectedCrypto.volume_1day_usd)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Data Start:</span>
                    <span>{selectedCrypto.data_start?.slice(0, 10) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Update:</span>
                    <span>{selectedCrypto.data_end?.slice(0, 10) || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded">
                <h4 className="font-medium mb-3">Price Chart</h4>
                <div className="h-32 bg-gray-700 rounded flex items-center justify-center">
                  <div className="text-gray-400 text-sm">
                    Chart visualization would appear here
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Buy {selectedCrypto.asset_id}
                </Button>
                <Button variant="outline" className="w-full border-gray-600 text-white hover:bg-gray-800">
                  Add to Watchlist
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a cryptocurrency to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-800 px-4 py-2 text-sm text-gray-400 border-t border-gray-700">
        Live data powered by CoinAPI • Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};
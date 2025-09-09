import { FC, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { CloudSun, Search, Thermometer, Droplets, Wind, Eye } from 'lucide-react';

export const WeatherApp: FC = () => {
  const [city, setCity] = useState('New York');
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async (cityName: string) => {
    setLoading(true);
    setError('');
    
    try {
      // This would need an API key from the user for real weather data
      // For now, show a realistic interface with sample data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setWeather({
        location: cityName,
        temperature: Math.floor(Math.random() * 30) + 5,
        description: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
        humidity: Math.floor(Math.random() * 40) + 40,
        windSpeed: Math.floor(Math.random() * 20) + 5,
        visibility: Math.floor(Math.random() * 10) + 5,
        feelsLike: Math.floor(Math.random() * 35) + 0
      });
    } catch (err) {
      setError('Weather service unavailable. Please provide API key for real data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(city);
  }, []);

  const handleSearch = () => {
    if (city.trim()) {
      fetchWeather(city);
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-blue-400 to-blue-600 p-6 overflow-auto">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <CloudSun className="w-8 h-8 text-white" />
          <h1 className="text-2xl font-bold text-white">Weather App</h1>
        </div>

        <div className="flex gap-2 mb-6">
          <Input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name..."
            className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button 
            onClick={handleSearch} 
            disabled={loading}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {error && (
          <Card className="mb-6 bg-red-500/20 border-red-300">
            <CardContent className="p-4">
              <p className="text-white">{error}</p>
            </CardContent>
          </Card>
        )}

        {loading && (
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-6 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto mb-4"></div>
              <p className="text-white">Loading weather data...</p>
            </CardContent>
          </Card>
        )}

        {weather && !loading && (
          <div className="space-y-4">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-center">
                  {weather.location}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-6xl font-bold text-white mb-2">
                  {weather.temperature}°C
                </div>
                <p className="text-white/80 text-xl">{weather.description}</p>
                <p className="text-white/60 mt-2">Feels like {weather.feelsLike}°C</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-4 flex items-center gap-3">
                  <Droplets className="w-6 h-6 text-white" />
                  <div>
                    <p className="text-white/60 text-sm">Humidity</p>
                    <p className="text-white font-semibold">{weather.humidity}%</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-4 flex items-center gap-3">
                  <Wind className="w-6 h-6 text-white" />
                  <div>
                    <p className="text-white/60 text-sm">Wind Speed</p>
                    <p className="text-white font-semibold">{weather.windSpeed} km/h</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-4 flex items-center gap-3">
                  <Eye className="w-6 h-6 text-white" />
                  <div>
                    <p className="text-white/60 text-sm">Visibility</p>
                    <p className="text-white font-semibold">{weather.visibility} km</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-4 flex items-center gap-3">
                  <Thermometer className="w-6 h-6 text-white" />
                  <div>
                    <p className="text-white/60 text-sm">Pressure</p>
                    <p className="text-white font-semibold">{Math.floor(Math.random() * 50) + 990} hPa</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
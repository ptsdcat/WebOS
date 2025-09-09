import { FC, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Cloud, Sun, CloudRain, Wind, Thermometer, Droplets, Eye, Gauge, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  forecast: DayForecast[];
}

interface DayForecast {
  day: string;
  high: number;
  low: number;
  condition: string;
  precipitation: number;
}

export const WeatherStation: FC = () => {
  const [location, setLocation] = useState('San Francisco, CA');

  const { data: weather, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/weather', location],
    queryFn: async () => {
      const response = await fetch(`/api/weather?location=${encodeURIComponent(location)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      return response.json();
    },
    enabled: false
  });

  const handleGetWeather = () => {
    refetch();
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return <Sun className="w-8 h-8 text-yellow-500" />;
      case 'cloudy': return <Cloud className="w-8 h-8 text-gray-500" />;
      case 'rainy': return <CloudRain className="w-8 h-8 text-blue-500" />;
      default: return <Cloud className="w-8 h-8 text-gray-400" />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-2xl w-full max-w-4xl h-[600px] flex flex-col text-white">
      <div className="bg-blue-800/50 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Cloud className="w-5 h-5" />
          <span className="font-medium">Weather Station</span>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="mb-6">
          <div className="flex space-x-2 mb-4">
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter city name..."
              className="flex-1 bg-white/20 border-white/30 text-white placeholder-white/70"
            />
            <Button onClick={handleGetWeather} className="bg-white/20 hover:bg-white/30" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Get Weather'
              )}
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 backdrop-blur-sm rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Weather Data Unavailable</h3>
            <p className="text-white/80 mb-4">
              {error.message.includes('not configured') 
                ? 'OpenWeatherMap API key required for real weather data'
                : 'Unable to fetch weather information'
              }
            </p>
            <p className="text-sm text-white/60">
              Configure OPENWEATHERMAP_API_KEY to display authentic weather data
            </p>
          </div>
        )}

        {weather && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">{weather.location}</h2>
              <div className="flex items-center justify-center space-x-4 mb-4">
                {getWeatherIcon(weather.condition)}
                <span className="text-6xl font-light">{weather.temperature}°C</span>
              </div>
              <p className="text-xl opacity-90">{weather.condition}</p>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white/20 p-4 rounded-lg text-center">
                <Droplets className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm opacity-80">Humidity</div>
                <div className="text-xl font-bold">{weather.humidity}%</div>
              </div>
              <div className="bg-white/20 p-4 rounded-lg text-center">
                <Wind className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm opacity-80">Wind</div>
                <div className="text-xl font-bold">{weather.windSpeed} km/h</div>
              </div>
              <div className="bg-white/20 p-4 rounded-lg text-center">
                <Gauge className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm opacity-80">Pressure</div>
                <div className="text-xl font-bold">{weather.pressure} hPa</div>
              </div>
              <div className="bg-white/20 p-4 rounded-lg text-center">
                <Eye className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm opacity-80">Visibility</div>
                <div className="text-xl font-bold">{weather.visibility} km</div>
              </div>
            </div>

            <div className="bg-white/20 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">5-Day Forecast</h3>
              <div className="grid grid-cols-5 gap-4">
                {weather.forecast.map((day: any, index: number) => (
                  <div key={index} className="text-center">
                    <div className="font-medium mb-2">{day.day}</div>
                    {getWeatherIcon(day.condition)}
                    <div className="text-sm mt-2">
                      <div className="font-bold">{day.high}°</div>
                      <div className="opacity-70">{day.low}°</div>
                    </div>
                    <div className="text-xs opacity-60 mt-1">{day.precipitation}% rain</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
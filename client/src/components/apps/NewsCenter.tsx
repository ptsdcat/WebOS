import { FC, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Newspaper, RefreshCw, Search, Globe, Clock, ExternalLink } from 'lucide-react';

interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export const NewsCenter: FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  const categories = [
    { id: 'general', name: 'General', icon: '📰' },
    { id: 'business', name: 'Business', icon: '💼' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
    { id: 'health', name: 'Health', icon: '🏥' },
    { id: 'science', name: 'Science', icon: '🔬' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'technology', name: 'Technology', icon: '💻' }
  ];

  useEffect(() => {
    fetchNews();
  }, [selectedCategory]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/news?category=${selectedCategory}`);
      if (response.ok) {
        const data = await response.json();
        setArticles(data);
      } else {
        console.error('Failed to fetch news');
      }
    } catch (error) {
      console.error('News API error:', error);
    }
    setLoading(false);
  };

  const filteredArticles = articles.filter(article =>
    article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const publishedAt = new Date(dateString);
    const diffMs = now.getTime() - publishedAt.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[700px] flex flex-col">
      <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Newspaper className="w-5 h-5" />
          <span className="font-medium">News Center</span>
        </div>
        <Button 
          onClick={fetchNews} 
          size="sm" 
          variant="ghost" 
          className="text-white hover:bg-red-700"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="flex border-b">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center space-x-2 px-4 py-2 ${
              selectedCategory === category.id 
                ? 'bg-red-50 border-b-2 border-red-600 text-red-600' 
                : 'hover:bg-gray-50'
            }`}
          >
            <span>{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      <div className="p-4 border-b">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search news articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-2/3 overflow-auto">
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-red-500" />
                <span className="ml-2">Loading latest news...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredArticles.map((article, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedArticle(article)}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex space-x-4">
                      {article.urlToImage && (
                        <img
                          src={article.urlToImage}
                          alt={article.title}
                          className="w-24 h-24 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {article.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Globe className="w-3 h-3" />
                              <span>{article.source.name}</span>
                            </div>
                            {article.author && (
                              <span>by {article.author}</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{getTimeAgo(article.publishedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredArticles.length === 0 && !loading && (
                  <div className="text-center py-12 text-gray-500">
                    No articles found matching your search
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="w-1/3 border-l p-4 overflow-auto">
          {selectedArticle ? (
            <div className="space-y-4">
              {selectedArticle.urlToImage && (
                <img
                  src={selectedArticle.urlToImage}
                  alt={selectedArticle.title}
                  className="w-full h-48 object-cover rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              
              <div>
                <h2 className="text-xl font-bold mb-2">{selectedArticle.title}</h2>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <Globe className="w-4 h-4" />
                    <span>{selectedArticle.source.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{getTimeAgo(selectedArticle.publishedAt)}</span>
                  </div>
                </div>
                {selectedArticle.author && (
                  <p className="text-sm text-gray-600 mb-4">
                    By {selectedArticle.author}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-gray-700 leading-relaxed">
                  {selectedArticle.description}
                </p>
                {selectedArticle.content && (
                  <p className="text-gray-700 leading-relaxed">
                    {selectedArticle.content.split('[+')[0]}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t">
                <Button
                  onClick={() => window.open(selectedArticle.url, '_blank')}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Read Full Article
                </Button>
              </div>

              <div className="text-xs text-gray-500">
                Published: {formatDate(selectedArticle.publishedAt)}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select an article to read details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-100 px-4 py-2 text-sm text-gray-600 border-t">
        Live news powered by NewsAPI • {filteredArticles.length} articles • Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};
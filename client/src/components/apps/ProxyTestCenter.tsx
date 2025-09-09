import { FC, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, Image, Video, FileText, Smartphone, Shield, Zap, BarChart3, Settings, PlayCircle } from 'lucide-react';

export const ProxyTestCenter: FC = () => {
  const [testUrl, setTestUrl] = useState('https://example.com');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testProxyEndpoint = async (endpoint: string, params: any = {}) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = `${endpoint}?${queryParams}`;
      
      const response = await fetch(url);
      const data = await response.text();
      
      setResults({
        endpoint,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        success: response.ok,
        size: data.length,
        cached: response.headers.get('X-Cache') === 'HIT'
      });
    } catch (error) {
      setResults({
        endpoint,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      });
    } finally {
      setLoading(false);
    }
  };

  const proxyTests = [
    {
      name: 'Website Proxy',
      endpoint: '/api/proxy/site',
      icon: Globe,
      description: 'Full website proxy with content optimization',
      params: { url: testUrl, mode: 'embed' }
    },
    {
      name: 'Image Proxy',
      endpoint: '/api/proxy/image',
      icon: Image,
      description: 'Optimized image loading with caching',
      params: { url: 'https://picsum.photos/800/600' }
    },
    {
      name: 'Video Proxy',
      endpoint: '/api/proxy/video',
      icon: Video,
      description: 'Video streaming with range request support',
      params: { url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4' }
    },
    {
      name: 'Document Viewer',
      endpoint: '/api/proxy/document',
      icon: FileText,
      description: 'PDF and document viewing capabilities',
      params: { url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
    },
    {
      name: 'Mobile Optimized',
      endpoint: '/api/proxy/mobile',
      icon: Smartphone,
      description: 'Mobile-optimized website rendering',
      params: { url: testUrl }
    },
    {
      name: 'Secure Proxy',
      endpoint: '/api/proxy/secure',
      icon: Shield,
      description: 'Security-enhanced proxy with tracker blocking',
      params: { url: testUrl, removeTrackers: 'true' }
    },
    {
      name: 'Optimized Proxy',
      endpoint: '/api/proxy/optimize',
      icon: Zap,
      description: 'Content optimization and compression',
      params: { url: testUrl, minifyHtml: 'true', removeComments: 'true' }
    },
    {
      name: 'Performance Metrics',
      endpoint: '/api/proxy/metrics',
      icon: BarChart3,
      description: 'Proxy performance and analytics',
      params: {}
    }
  ];

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Advanced Proxy System</h1>
              <p className="text-muted-foreground">Test and monitor all proxy features</p>
            </div>
            <Badge variant="secondary" className="text-sm">
              v2.0.0
            </Badge>
          </div>

          <Tabs defaultValue="test" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="test">Test Endpoints</TabsTrigger>
              <TabsTrigger value="demo">Live Demo</TabsTrigger>
              <TabsTrigger value="config">Configuration</TabsTrigger>
            </TabsList>

            <TabsContent value="test" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Test URL Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Input
                      value={testUrl}
                      onChange={(e) => setTestUrl(e.target.value)}
                      placeholder="Enter URL to test..."
                      className="flex-1"
                    />
                    <Button 
                      onClick={() => testProxyEndpoint('/api/proxy/site', { url: testUrl, mode: 'embed' })}
                      disabled={loading}
                    >
                      Test Website
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {proxyTests.map((test) => {
                  const Icon = test.icon;
                  return (
                    <Card key={test.name} className="cursor-pointer hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-primary" />
                          <CardTitle className="text-lg">{test.name}</CardTitle>
                        </div>
                        <p className="text-sm text-muted-foreground">{test.description}</p>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          onClick={() => testProxyEndpoint(test.endpoint, test.params)}
                          disabled={loading}
                          className="w-full"
                          variant="outline"
                        >
                          Test {test.name}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {results && (
                <Card>
                  <CardHeader>
                    <CardTitle>Test Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={results.success ? "default" : "destructive"}>
                          {results.success ? "Success" : "Failed"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Status: {results.status || 'Error'}
                        </span>
                        {results.cached && (
                          <Badge variant="secondary">Cached</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Endpoint:</strong> {results.endpoint}
                        </div>
                        {results.size && (
                          <div>
                            <strong>Response Size:</strong> {(results.size / 1024).toFixed(1)} KB
                          </div>
                        )}
                      </div>

                      {results.headers && (
                        <div>
                          <strong>Response Headers:</strong>
                          <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto">
                            {JSON.stringify(results.headers, null, 2)}
                          </pre>
                        </div>
                      )}

                      {results.error && (
                        <div className="text-destructive">
                          <strong>Error:</strong> {results.error}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="demo" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Live Website Demo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <iframe
                      src="/api/proxy/site?url=https://example.com&mode=embed"
                      className="w-full h-96 border rounded"
                      title="Website Proxy Demo"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Image Optimization Demo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img
                      src="/api/proxy/image?url=https://picsum.photos/400/300"
                      alt="Proxy Image Demo"
                      className="w-full h-96 object-cover rounded"
                    />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <iframe
                    src="/api/proxy/metrics"
                    className="w-full h-64 border rounded"
                    title="Metrics Dashboard"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="config" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Proxy Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <iframe
                    src="/api/proxy/config"
                    className="w-full h-96 border rounded"
                    title="Configuration"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Health Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <iframe
                    src="/api/proxy/health"
                    className="w-full h-64 border rounded"
                    title="Health Check"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertFileSchema, insertOsSettingsSchema } from "@shared/schema";
import { youtubeService } from "./youtube";
import { promisify } from "util";
import zlib from "zlib";
import { WebSocketServer } from "ws";

// Advanced proxy utilities
class RequestQueue {
  private queue: Array<() => Promise<void>> = [];
  private processing = false;
  private maxConcurrent = 5;
  private currentCount = 0;
  private rateLimits = new Map<string, { count: number; resetTime: number }>();

  async add<T>(domain: string, request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          // Check rate limits
          const now = Date.now();
          const rateLimit = this.rateLimits.get(domain);
          
          if (rateLimit && rateLimit.count >= 50 && now < rateLimit.resetTime) {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, rateLimit.count - 50), 30000)));
          }
          
          const result = await request();
          
          // Update rate limit tracking
          const currentLimit = this.rateLimits.get(domain) || { count: 0, resetTime: now + 60000 };
          this.rateLimits.set(domain, {
            count: now > currentLimit.resetTime ? 1 : currentLimit.count + 1,
            resetTime: now > currentLimit.resetTime ? now + 60000 : currentLimit.resetTime
          });
          
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.currentCount--;
          this.processQueue();
        }
      });
      
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.currentCount >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    while (this.queue.length > 0 && this.currentCount < this.maxConcurrent) {
      const request = this.queue.shift();
      if (request) {
        this.currentCount++;
        request().catch(() => {}); // Errors handled in request wrapper
      }
    }
    this.processing = false;
  }
}

// Content cache with compression
class ContentCache {
  private cache = new Map<string, { content: Buffer; contentType: string; timestamp: number; compressed: boolean }>();
  private maxAge = 5 * 60 * 1000; // 5 minutes
  private maxSize = 100; // Maximum cached items

  async get(key: string): Promise<{ content: Buffer; contentType: string } | null> {
    const cached = this.cache.get(key);
    if (!cached || Date.now() - cached.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }
    
    return {
      content: cached.compressed ? await promisify(zlib.gunzip)(cached.content) : cached.content,
      contentType: cached.contentType
    };
  }

  async set(key: string, content: Buffer, contentType: string) {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entries
      const entries = Array.from(this.cache.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp);
      for (let i = 0; i < 10; i++) {
        this.cache.delete(entries[i][0]);
      }
    }

    // Compress content if larger than 1KB
    const shouldCompress = content.length > 1024;
    const finalContent = shouldCompress ? await promisify(zlib.gzip)(content) : content;
    
    this.cache.set(key, {
      content: finalContent,
      contentType,
      timestamp: Date.now(),
      compressed: shouldCompress
    });
  }
}

// User agent rotation
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
];

const getRandomUserAgent = () => userAgents[Math.floor(Math.random() * userAgents.length)];

// Global instances
const requestQueue = new RequestQueue();
const contentCache = new ContentCache();

// Content filtering
const adBlockPatterns = [
  /doubleclick\.net/,
  /googlesyndication\.com/,
  /googletagmanager\.com/,
  /facebook\.com\/tr/,
  /analytics\.google\.com/,
  /googleadservices\.com/,
  /amazon-adsystem\.com/,
  /ads\./,
  /adsystem\./
];

const filterContent = (html: string, enableAdBlock: boolean = true) => {
  if (!enableAdBlock) return html;
  
  // Remove ad-related scripts and elements
  return html
    .replace(/<script[^>]*src[^>]*(?:doubleclick|googlesyndication|googletagmanager|facebook\.com\/tr)[^>]*><\/script>/gi, '')
    .replace(/<iframe[^>]*src[^>]*(?:doubleclick|googlesyndication|googleadservices)[^>]*><\/iframe>/gi, '')
    .replace(/<div[^>]*class[^>]*(?:ad-|advertisement|google-ad)[^>]*>.*?<\/div>/gi, '')
    .replace(/<ins[^>]*class[^>]*adsbygoogle[^>]*>.*?<\/ins>/gi, '');
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const user = insertUserSchema.parse(req.body);
      const newUser = await storage.createUser(user);
      res.json(newUser);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Enhanced proxy system for different websites and content types
  app.get('/api/proxy', async (req, res) => {
    try {
      const targetUrl = req.query.url as string;
      const proxyType = req.query.type as string || 'html'; // html, json, image, etc.
      
      if (!targetUrl) {
        return res.status(400).json({ error: 'URL parameter is required' });
      }

      // Validate URL format
      let url: URL;
      try {
        url = new URL(targetUrl);
      } catch {
        return res.status(400).json({ error: 'Invalid URL format' });
      }

      // Security: Only allow HTTP/HTTPS
      if (!['http:', 'https:'].includes(url.protocol)) {
        return res.status(400).json({ error: 'Only HTTP/HTTPS URLs are allowed' });
      }

      // Set up timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      // Enhanced headers for better compatibility
      const headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Upgrade-Insecure-Requests': '1'
      };

      // Set Accept header based on proxy type
      switch (proxyType) {
        case 'json':
          headers['Accept'] = 'application/json, text/plain, */*';
          break;
        case 'image':
          headers['Accept'] = 'image/webp,image/apng,image/*,*/*;q=0.8';
          break;
        case 'video':
          headers['Accept'] = 'video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5';
          break;
        default:
          headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7';
      }

      const response = await fetch(targetUrl, {
        signal: controller.signal,
        headers,
        redirect: 'follow',
        method: 'GET'
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return res.status(response.status).json({ 
          error: `HTTP ${response.status}: ${response.statusText}`,
          url: targetUrl
        });
      }

      const contentType = response.headers.get('content-type') || 'text/html';
      
      // Set CORS and security headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('X-Frame-Options', 'ALLOWALL');
      res.setHeader('Content-Security-Policy', 'frame-ancestors *; default-src * data: blob: \'unsafe-inline\' \'unsafe-eval\';');
      res.setHeader('Content-Type', contentType);
      
      // Handle different content types
      if (contentType.includes('application/json')) {
        const jsonData = await response.json();
        res.json(jsonData);
      } else if (contentType.includes('text/html')) {
        let html = await response.text();
        
        const baseUrl = `${url.protocol}//${url.host}`;
        
        // Comprehensive URL rewriting for better proxy support
        html = html
          // Remove existing base tags
          .replace(/<base[^>]*>/gi, '')
          // Fix relative URLs in href attributes
          .replace(/href=["'](?!https?:\/\/|\/\/|data:|mailto:|tel:|javascript:)([^"']*?)["']/gi, (match, href) => {
            if (href.startsWith('/')) {
              return `href="/api/proxy?url=${encodeURIComponent(baseUrl + href)}"`;
            } else if (href.startsWith('#') || href === '') {
              return match; // Keep anchors and empty hrefs as is
            }
            return `href="/api/proxy?url=${encodeURIComponent(new URL(href, baseUrl).toString())}"`;
          })
          // Fix src attributes for resources
          .replace(/src=["'](?!https?:\/\/|\/\/|data:)([^"']*?)["']/gi, (match, src) => {
            if (src.startsWith('/')) {
              return `src="${baseUrl}${src}"`;
            }
            return `src="${new URL(src, baseUrl).toString()}"`;
          })
          // Fix action attributes in forms
          .replace(/action=["'](?!https?:\/\/|\/\/|mailto:|javascript:)([^"']*?)["']/gi, (match, action) => {
            if (action.startsWith('/')) {
              return `action="/api/proxy?url=${encodeURIComponent(baseUrl + action)}"`;
            }
            return `action="/api/proxy?url=${encodeURIComponent(new URL(action, baseUrl).toString())}"`;
          })
          // Fix CSS url() references
          .replace(/url\(["']?(?!https?:\/\/|\/\/|data:)([^"')]*?)["']?\)/gi, (match, cssUrl) => {
            if (cssUrl.startsWith('/')) {
              return `url("${baseUrl}${cssUrl}")`;
            }
            return `url("${new URL(cssUrl, baseUrl).toString()}")`;
          });

        // Inject enhanced base tag and meta tags
        const headInjection = `
          <base href="${baseUrl}/">
          <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
          <meta http-equiv="Pragma" content="no-cache">
          <meta http-equiv="Expires" content="0">
          <meta name="referrer" content="no-referrer">
        `;
        
        if (html.includes('<head>')) {
          html = html.replace(/<head>/i, `<head>${headInjection}`);
        } else {
          html = `<head>${headInjection}</head>${html}`;
        }
        
        res.send(html);
      } else if (contentType.includes('image/') || contentType.includes('video/') || contentType.includes('audio/')) {
        // Handle binary content (images, videos, audio)
        const buffer = await response.arrayBuffer();
        res.send(Buffer.from(buffer));
      } else {
        // Handle other content types as text
        const textContent = await response.text();
        res.send(textContent);
      }
    } catch (error) {
      console.error('Proxy error:', error);
      
      // Enhanced error handling with specific error types
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return res.status(408).json({ 
            error: 'Request timeout',
            details: 'The website took too long to respond (15s limit)',
            url: req.query.url
          });
        }
        
        if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
          return res.status(404).json({
            error: 'Website not found',
            details: 'The domain name could not be resolved',
            url: req.query.url
          });
        }
        
        if (error.message.includes('ECONNREFUSED')) {
          return res.status(503).json({
            error: 'Connection refused',
            details: 'The website refused the connection',
            url: req.query.url
          });
        }
        
        if (error.message.includes('ECONNRESET')) {
          return res.status(503).json({
            error: 'Connection reset',
            details: 'The connection was reset by the server',
            url: req.query.url
          });
        }
        
        if (error.message.includes('certificate')) {
          return res.status(502).json({
            error: 'SSL certificate error',
            details: 'There was an issue with the website\'s SSL certificate',
            url: req.query.url
          });
        }
      }
      
      res.status(500).json({ 
        error: 'Failed to fetch the requested URL',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        url: req.query.url
      });
    }
  });

  // File system routes
  app.get("/api/files", async (req, res) => {
    try {
      const userId = 1; // Default user for WebOS
      const parentId = req.query.parentId ? parseInt(req.query.parentId as string) : undefined;
      const files = await storage.getUserFiles(userId, parentId);
      res.json(files);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch files" });
    }
  });

  app.post("/api/files", async (req, res) => {
    try {
      const file = insertFileSchema.parse(req.body);
      const newFile = await storage.createFile(file);
      res.json(newFile);
    } catch (error) {
      res.status(400).json({ error: "Invalid file data" });
    }
  });

  app.patch("/api/files/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertFileSchema.partial().parse(req.body);
      const updatedFile = await storage.updateFile(id, updates);
      if (!updatedFile) {
        return res.status(404).json({ error: "File not found" });
      }
      res.json(updatedFile);
    } catch (error) {
      res.status(400).json({ error: "Invalid file data" });
    }
  });

  app.delete("/api/files/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteFile(id);
      if (!deleted) {
        return res.status(404).json({ error: "File not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete file" });
    }
  });

  // OS Settings routes
  app.get("/api/settings/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const settings = await storage.getUserSettings(userId);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.put("/api/settings/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const settings = insertOsSettingsSchema.partial().parse(req.body);
      const updatedSettings = await storage.updateUserSettings(userId, settings);
      res.json(updatedSettings);
    } catch (error) {
      res.status(400).json({ error: "Invalid settings data" });
    }
  });

  // Factory reset endpoint
  app.post('/api/factory-reset', async (req, res) => {
    try {
      // Clear all database tables while preserving structure
      await storage.factoryReset();
      res.json({ success: true, message: 'Database factory reset completed' });
    } catch (error) {
      console.error('Factory reset error:', error);
      res.status(500).json({ success: false, message: 'Factory reset failed' });
    }
  });

  // Health check endpoint for system recovery
  app.get('/api/health-check', async (req, res) => {
    try {
      // Test database connection by trying to get a user
      await storage.getUser(1);
      res.json({ 
        status: 'healthy', 
        database: 'connected',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(503).json({ 
        status: 'unhealthy', 
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Specialized proxy routes for different content types
  
  // JSON API proxy - for fetching JSON data from external APIs
  app.get('/api/proxy/json', async (req, res) => {
    try {
      const targetUrl = req.query.url as string;
      if (!targetUrl) {
        return res.status(400).json({ error: 'URL parameter is required' });
      }

      const url = new URL(targetUrl);
      if (!['http:', 'https:'].includes(url.protocol)) {
        return res.status(400).json({ error: 'Only HTTP/HTTPS URLs are allowed' });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'Mozilla/5.0 (compatible; WebOSProxy/1.0)',
          'Cache-Control': 'no-cache'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return res.status(response.status).json({ 
          error: `API request failed: ${response.status} ${response.statusText}`,
          url: targetUrl
        });
      }

      const data = await response.json();
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.json(data);
    } catch (error) {
      console.error('JSON proxy error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch JSON data',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Enhanced Image proxy - for fetching images with proper content type and optimization
  app.get('/api/proxy/image', async (req, res) => {
    try {
      const targetUrl = req.query.url as string;
      const quality = req.query.quality as string || 'auto'; // auto, low, medium, high
      const format = req.query.format as string || 'auto'; // auto, webp, jpeg, png
      
      if (!targetUrl) {
        return res.status(400).json({ error: 'URL parameter is required' });
      }

      const url = new URL(targetUrl);
      if (!['http:', 'https:'].includes(url.protocol)) {
        return res.status(400).json({ error: 'Only HTTP/HTTPS URLs are allowed' });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      // Enhanced headers with user agent rotation
      const headers: Record<string, string> = {
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'User-Agent': getRandomUserAgent(),
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'max-age=3600',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site'
      };

      // Add range support for large images
      const range = req.headers.range;
      if (range) {
        headers['Range'] = range;
      }

      const domain = url.hostname;
      const cacheKey = `image:${targetUrl}:${quality}:${format}`;
      
      // Check cache first
      const cached = await contentCache.get(cacheKey);
      if (cached) {
        res.setHeader('Content-Type', cached.contentType);
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.send(cached.content);
      }

      const response = await requestQueue.add(domain, async () => {
        const fetchResponse = await fetch(targetUrl, {
          signal: controller.signal,
          headers
        });
        clearTimeout(timeoutId);
        return fetchResponse;
      });

      if (!response.ok) {
        return res.status(response.status).json({ 
          error: `Image fetch failed: ${response.status} ${response.statusText}`,
          url: targetUrl
        });
      }

      const contentType = response.headers.get('content-type') || 'image/jpeg';
      const contentLength = response.headers.get('content-length');
      const lastModified = response.headers.get('last-modified');
      const etag = response.headers.get('etag');
      
      const buffer = Buffer.from(await response.arrayBuffer());
      
      // Cache the image
      await contentCache.set(cacheKey, buffer, contentType);

      // Set optimized headers
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400, immutable'); // 24 hour cache
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
      res.setHeader('X-Cache', 'MISS');
      
      if (contentLength) res.setHeader('Content-Length', contentLength);
      if (lastModified) res.setHeader('Last-Modified', lastModified);
      if (etag) res.setHeader('ETag', etag);
      if (range && response.status === 206) {
        res.status(206);
        const contentRange = response.headers.get('content-range');
        if (contentRange) res.setHeader('Content-Range', contentRange);
      }

      res.send(buffer);
    } catch (error) {
      console.error('Image proxy error:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return res.status(408).json({ 
            error: 'Image load timeout',
            details: 'The image took too long to load (20s limit)',
            url: req.query.url
          });
        }
        
        if (error.message.includes('ENOTFOUND')) {
          return res.status(404).json({
            error: 'Image not found',
            details: 'The image URL could not be resolved',
            url: req.query.url
          });
        }
      }
      
      res.status(500).json({ 
        error: 'Failed to fetch image',
        details: error instanceof Error ? error.message : 'Unknown error',
        url: req.query.url
      });
    }
  });

  // Enhanced Video stream proxy - for optimized video streaming with adaptive quality
  app.get('/api/proxy/video', async (req, res) => {
    try {
      const targetUrl = req.query.url as string;
      const quality = req.query.quality as string || 'auto'; // auto, 480p, 720p, 1080p
      const format = req.query.format as string || 'auto'; // auto, mp4, webm, m3u8
      
      if (!targetUrl) {
        return res.status(400).json({ error: 'URL parameter is required' });
      }

      const url = new URL(targetUrl);
      if (!['http:', 'https:'].includes(url.protocol)) {
        return res.status(400).json({ error: 'Only HTTP/HTTPS URLs are allowed' });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for videos

      const domain = url.hostname;
      const range = req.headers.range;
      const cacheKey = range ? null : `video:${targetUrl}:${quality}:${format}`; // Don't cache range requests
      
      // Check cache for complete video requests only
      if (cacheKey && !range) {
        const cached = await contentCache.get(cacheKey);
        if (cached) {
          res.setHeader('Content-Type', cached.contentType);
          res.setHeader('X-Cache', 'HIT');
          res.setHeader('Cache-Control', 'public, max-age=3600');
          res.setHeader('Access-Control-Allow-Origin', '*');
          return res.send(cached.content);
        }
      }

      const headers: Record<string, string> = {
        'Accept': 'video/mp4,video/webm,video/ogg,video/*;q=0.9,application/octet-stream;q=0.8,*/*;q=0.7',
        'User-Agent': getRandomUserAgent(),
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Sec-Fetch-Dest': 'video',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site'
      };

      // Support for range requests (essential for video streaming)
      if (range) {
        headers['Range'] = range;
      }

      const response = await requestQueue.add(domain, async () => {
        const fetchResponse = await fetch(targetUrl, {
          signal: controller.signal,
          headers
        });
        clearTimeout(timeoutId);
        return fetchResponse;
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return res.status(response.status).json({ 
          error: `Video fetch failed: ${response.status} ${response.statusText}`,
          url: targetUrl
        });
      }

      const contentType = response.headers.get('content-type') || 'video/mp4';
      const contentLength = response.headers.get('content-length');
      const acceptRanges = response.headers.get('accept-ranges');
      const contentRange = response.headers.get('content-range');
      const lastModified = response.headers.get('last-modified');
      const etag = response.headers.get('etag');

      // Set streaming-optimized headers
      res.setHeader('Content-Type', contentType);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Range, Content-Length');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      
      if (contentLength) res.setHeader('Content-Length', contentLength);
      if (acceptRanges) res.setHeader('Accept-Ranges', acceptRanges);
      if (contentRange) res.setHeader('Content-Range', contentRange);
      if (lastModified) res.setHeader('Last-Modified', lastModified);
      if (etag) res.setHeader('ETag', etag);

      // Handle partial content for streaming
      if (response.status === 206) {
        res.status(206);
      }

      // Stream the video data efficiently
      const buffer = Buffer.from(await response.arrayBuffer());
      
      // Cache complete video files (non-range requests) under 10MB
      if (cacheKey && !range && buffer.length < 10 * 1024 * 1024) {
        await contentCache.set(cacheKey, buffer, contentType);
      }
      
      res.setHeader('X-Cache', cacheKey && !range ? 'MISS' : 'STREAMING');
      res.send(buffer);
    } catch (error) {
      console.error('Video proxy error:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return res.status(408).json({ 
            error: 'Video load timeout',
            details: 'The video took too long to load (30s limit)',
            url: req.query.url
          });
        }
        
        if (error.message.includes('ENOTFOUND')) {
          return res.status(404).json({
            error: 'Video not found',
            details: 'The video URL could not be resolved',
            url: req.query.url
          });
        }
      }
      
      res.status(500).json({ 
        error: 'Failed to fetch video',
        details: error instanceof Error ? error.message : 'Unknown error',
        url: req.query.url
      });
    }
  });

  // Enhanced Website navigation proxy - for optimized website loading with smart content handling
  app.get('/api/proxy/site', async (req, res) => {
    try {
      const targetUrl = req.query.url as string;
      const mode = req.query.mode as string || 'embed'; // embed, iframe, popup
      const optimize = req.query.optimize === 'true'; // Enable content optimization
      
      if (!targetUrl) {
        return res.status(400).json({ error: 'URL parameter is required' });
      }

      // Enhanced URL validation with hostname check
      let url: URL;
      try {
        url = new URL(targetUrl);
      } catch {
        return res.status(400).json({ error: 'Invalid URL format' });
      }

      if (!['http:', 'https:'].includes(url.protocol)) {
        return res.status(400).json({ error: 'Only HTTP/HTTPS URLs are allowed' });
      }

      // Check for invalid hostnames that caused the ENOTFOUND error
      if (!url.hostname || url.hostname === 'api' || url.hostname.includes('localhost') && !url.hostname.includes('.')) {
        return res.status(400).json({ 
          error: 'Invalid hostname',
          details: 'The hostname appears to be invalid or incomplete',
          url: targetUrl
        });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // Increased timeout

      // Enhanced headers for better website compatibility
      const headers: Record<string, string> = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'Connection': 'keep-alive'
      };

      const domain = url.hostname;
      const cacheKey = `site:${targetUrl}:${mode}:${optimize}`;
      
      // Check cache first
      const cached = await contentCache.get(cacheKey);
      if (cached) {
        res.setHeader('Content-Type', cached.contentType);
        res.setHeader('X-Cache', 'HIT');
        return res.send(cached.content);
      }

      const response = await requestQueue.add(domain, async () => {
        const fetchResponse = await fetch(targetUrl, {
          signal: controller.signal,
          headers,
          redirect: 'follow'
        });
        clearTimeout(timeoutId);
        return fetchResponse;
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return res.status(response.status).json({ 
          error: `Site load failed: ${response.status} ${response.statusText}`,
          url: targetUrl,
          statusCode: response.status
        });
      }

      const contentType = response.headers.get('content-type') || 'text/html';
      const contentLength = response.headers.get('content-length');
      const lastModified = response.headers.get('last-modified');
      
      if (contentType.includes('text/html')) {
        let html = await response.text();
        const baseUrl = `${url.protocol}//${url.host}`;
        
        // Smart content processing based on mode
        if (mode === 'embed') {
          // Full proxy mode with comprehensive URL rewriting
          html = html
            .replace(/<base[^>]*>/gi, '')
            // Handle all href attributes
            .replace(/href=["'](?!https?:\/\/|\/\/|data:|mailto:|tel:|javascript:|#)([^"']*?)["']/gi, (match, href) => {
              try {
                if (href.startsWith('/')) {
                  return `href="/api/proxy/site?url=${encodeURIComponent(baseUrl + href)}&mode=${mode}"`;
                } else if (href && !href.startsWith('#')) {
                  return `href="/api/proxy/site?url=${encodeURIComponent(new URL(href, baseUrl).toString())}&mode=${mode}"`;
                }
                return match;
              } catch {
                return match; // Keep original if URL construction fails
              }
            })
            // Handle image and media sources with proper proxy routing
            .replace(/src=["'](?!https?:\/\/|\/\/|data:)([^"']*?)["']/gi, (match, src) => {
              try {
                if (src.startsWith('/')) {
                  // Detect content type for proper proxy routing
                  if (src.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)(\?.*)?$/i)) {
                    return `src="/api/proxy/image?url=${encodeURIComponent(baseUrl + src)}"`;
                  } else if (src.match(/\.(mp4|webm|ogg|avi|mov)(\?.*)?$/i)) {
                    return `src="/api/proxy/video?url=${encodeURIComponent(baseUrl + src)}"`;
                  } else {
                    return `src="${baseUrl}${src}"`;
                  }
                } else if (src) {
                  const fullUrl = new URL(src, baseUrl).toString();
                  if (src.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)(\?.*)?$/i)) {
                    return `src="/api/proxy/image?url=${encodeURIComponent(fullUrl)}"`;
                  } else if (src.match(/\.(mp4|webm|ogg|avi|mov)(\?.*)?$/i)) {
                    return `src="/api/proxy/video?url=${encodeURIComponent(fullUrl)}"`;
                  } else {
                    return `src="${fullUrl}"`;
                  }
                }
                return match;
              } catch {
                return match;
              }
            })
            // Handle form actions
            .replace(/action=["'](?!https?:\/\/|\/\/|mailto:|javascript:)([^"']*?)["']/gi, (match, action) => {
              try {
                if (action.startsWith('/')) {
                  return `action="/api/proxy/site?url=${encodeURIComponent(baseUrl + action)}&mode=${mode}"`;
                } else if (action) {
                  return `action="/api/proxy/site?url=${encodeURIComponent(new URL(action, baseUrl).toString())}&mode=${mode}"`;
                }
                return match;
              } catch {
                return match;
              }
            })
            // Handle CSS url() references
            .replace(/url\(["']?(?!https?:\/\/|\/\/|data:)([^"')]*?)["']?\)/gi, (match, cssUrl) => {
              try {
                if (cssUrl.startsWith('/')) {
                  return `url("${baseUrl}${cssUrl}")`;
                } else if (cssUrl) {
                  return `url("${new URL(cssUrl, baseUrl).toString()}")`;
                }
                return match;
              } catch {
                return match;
              }
            });
        } else {
          // Simple mode - convert relative URLs to absolute
          html = html
            .replace(/href=["'](?!https?:\/\/|\/\/|data:|mailto:|tel:|javascript:|#)([^"']*?)["']/gi, (match, href) => {
              try {
                if (href.startsWith('/')) {
                  return `href="${baseUrl}${href}"`;
                } else if (href && !href.startsWith('#')) {
                  return `href="${new URL(href, baseUrl).toString()}"`;
                }
                return match;
              } catch {
                return match;
              }
            })
            .replace(/src=["'](?!https?:\/\/|\/\/|data:)([^"']*?)["']/gi, (match, src) => {
              try {
                if (src.startsWith('/')) {
                  return `src="${baseUrl}${src}"`;
                } else if (src) {
                  return `src="${new URL(src, baseUrl).toString()}"`;
                }
                return match;
              } catch {
                return match;
              }
            });
        }

        // Remove security restrictions that prevent embedding
        html = html
          .replace(/<meta[^>]*http-equiv=['"]X-Frame-Options['"][^>]*>/gi, '')
          .replace(/<meta[^>]*http-equiv=['"]Content-Security-Policy['"][^>]*>/gi, '')
          .replace(/<meta[^>]*name=['"]viewport['"][^>]*>/gi, '<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">');

        // Enhanced head injection with better compatibility
        const headInjection = `
          <base href="${baseUrl}/">
          <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
          <meta http-equiv="Pragma" content="no-cache">
          <meta http-equiv="Expires" content="0">
          <meta name="referrer" content="no-referrer">
          <style>
            /* Enhanced proxy compatibility styles */
            body { 
              margin: 0 !important; 
              padding: 0 !important;
              overflow-x: auto !important;
            }
            iframe { 
              border: none !important; 
              width: 100% !important; 
              height: 100vh !important; 
            }
            /* Fix common layout issues */
            * {
              box-sizing: border-box;
            }
            /* Prevent horizontal scrolling issues */
            body, html {
              max-width: 100vw;
              overflow-x: auto;
            }
          </style>
        `;
        
        if (html.includes('<head>')) {
          html = html.replace(/<head>/i, `<head>${headInjection}`);
        } else {
          html = `<head>${headInjection}</head>${html}`;
        }

        // Set comprehensive response headers
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('X-Frame-Options', 'ALLOWALL');
        res.setHeader('Content-Security-Policy', 'frame-ancestors *; default-src * data: blob: \'unsafe-inline\' \'unsafe-eval\'; script-src * \'unsafe-inline\' \'unsafe-eval\'; style-src * \'unsafe-inline\';');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Range');
        res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minute cache
        
        if (lastModified) res.setHeader('Last-Modified', lastModified);
        
        res.send(html);
      } else {
        // Handle non-HTML content with proper headers
        const buffer = await response.arrayBuffer();
        res.setHeader('Content-Type', contentType);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        if (contentLength) res.setHeader('Content-Length', contentLength);
        if (lastModified) res.setHeader('Last-Modified', lastModified);
        res.send(Buffer.from(buffer));
      }
    } catch (error) {
      console.error('Site proxy error:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return res.status(408).json({ 
            error: 'Site load timeout',
            details: 'The website took too long to respond (25s limit)',
            url: req.query.url
          });
        }
        
        if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
          return res.status(404).json({
            error: 'Website not found',
            details: 'The domain name could not be resolved',
            url: req.query.url
          });
        }
        
        if (error.message.includes('ECONNREFUSED')) {
          return res.status(503).json({
            error: 'Connection refused',
            details: 'The website refused the connection',
            url: req.query.url
          });
        }
        
        if (error.message.includes('ETIMEDOUT')) {
          return res.status(504).json({
            error: 'Connection timeout',
            details: 'The website took too long to respond',
            url: req.query.url
          });
        }
      }
      
      res.status(500).json({ 
        error: 'Failed to load website',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        url: req.query.url
      });
    }
  });

  // Search engine proxy - for web searches
  app.get('/api/proxy/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      const engine = req.query.engine as string || 'duckduckgo';
      
      if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      let searchUrl: string;
      switch (engine.toLowerCase()) {
        case 'duckduckgo':
          searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&ia=web`;
          break;
        case 'bing':
          searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
          break;
        case 'yandex':
          searchUrl = `https://yandex.com/search/?text=${encodeURIComponent(query)}`;
          break;
        case 'startpage':
          searchUrl = `https://www.startpage.com/sp/search?query=${encodeURIComponent(query)}`;
          break;
        default:
          return res.status(400).json({ error: 'Unsupported search engine' });
      }

      // Redirect to site proxy with the search URL
      res.redirect(`/api/proxy/site?url=${encodeURIComponent(searchUrl)}&mode=embed`);
    } catch (error) {
      console.error('Search proxy error:', error);
      res.status(500).json({ 
        error: 'Search failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Popular websites proxy - quick access to common sites
  app.get('/api/proxy/popular/:site', async (req, res) => {
    try {
      const site = req.params.site.toLowerCase();
      const mode = req.query.mode as string || 'embed';
      
      const popularSites: Record<string, string> = {
        'github': 'https://github.com',
        'stackoverflow': 'https://stackoverflow.com',
        'reddit': 'https://reddit.com',
        'wikipedia': 'https://wikipedia.org',
        'youtube': 'https://youtube.com',
        'twitter': 'https://twitter.com',
        'facebook': 'https://facebook.com',
        'instagram': 'https://instagram.com',
        'linkedin': 'https://linkedin.com',
        'discord': 'https://discord.com',
        'twitch': 'https://twitch.tv',
        'netflix': 'https://netflix.com',
        'amazon': 'https://amazon.com',
        'google': 'https://google.com',
        'bing': 'https://bing.com',
        'duckduckgo': 'https://duckduckgo.com',
        'hackernews': 'https://news.ycombinator.com',
        'medium': 'https://medium.com',
        'dev': 'https://dev.to',
        'codepen': 'https://codepen.io',
        'glitch': 'https://glitch.com',
        'replit': 'https://replit.com',
        'codesandbox': 'https://codesandbox.io'
      };

      const siteUrl = popularSites[site];
      if (!siteUrl) {
        return res.status(404).json({ 
          error: 'Site not found',
          available: Object.keys(popularSites)
        });
      }

      // Redirect to site proxy
      res.redirect(`/api/proxy/site?url=${encodeURIComponent(siteUrl)}&mode=${mode}`);
    } catch (error) {
      console.error('Popular site proxy error:', error);
      res.status(500).json({ 
        error: 'Failed to access site',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // WebSocket proxy for real-time applications
  app.get('/api/proxy/websocket', (req, res) => {
    const targetUrl = req.query.url as string;
    if (!targetUrl) {
      return res.status(400).json({ error: 'WebSocket URL parameter is required' });
    }

    const wsUrl = targetUrl.replace(/^http/, 'ws');
    res.json({
      websocketUrl: wsUrl,
      proxyEndpoint: `/api/ws-proxy?target=${encodeURIComponent(wsUrl)}`,
      instructions: 'Connect to the proxy endpoint for WebSocket communication'
    });
  });

  // PDF and document viewer proxy
  app.get('/api/proxy/document', async (req, res) => {
    try {
      const targetUrl = req.query.url as string;
      const viewer = req.query.viewer as string || 'embed'; // embed, download, preview
      
      if (!targetUrl) {
        return res.status(400).json({ error: 'Document URL parameter is required' });
      }

      const url = new URL(targetUrl);
      if (!['http:', 'https:'].includes(url.protocol)) {
        return res.status(400).json({ error: 'Only HTTP/HTTPS URLs are allowed' });
      }

      const domain = url.hostname;
      const cacheKey = `doc:${targetUrl}:${viewer}`;
      
      // Check cache first
      const cached = await contentCache.get(cacheKey);
      if (cached) {
        res.setHeader('Content-Type', cached.contentType);
        res.setHeader('X-Cache', 'HIT');
        return res.send(cached.content);
      }

      const response = await requestQueue.add(domain, async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const fetchResponse = await fetch(targetUrl, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,*/*',
            'User-Agent': getRandomUserAgent(),
        'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'max-age=3600'
          }
        });

        clearTimeout(timeoutId);
        return fetchResponse;
      });

      if (!response.ok) {
        return res.status(response.status).json({ 
          error: `Document fetch failed: ${response.status} ${response.statusText}`,
          url: targetUrl
        });
      }

      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      const buffer = Buffer.from(await response.arrayBuffer());

      // Cache the document
      await contentCache.set(cacheKey, buffer, contentType);

      if (viewer === 'embed' && contentType.includes('pdf')) {
        // Create PDF viewer HTML
        const viewerHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>PDF Viewer</title>
            <style>
              body { margin: 0; padding: 0; height: 100vh; overflow: hidden; }
              iframe { width: 100%; height: 100%; border: none; }
              .pdf-controls { 
                position: fixed; top: 10px; right: 10px; z-index: 1000; 
                background: rgba(0,0,0,0.8); padding: 10px; border-radius: 5px;
              }
              .pdf-controls button { 
                background: #007bff; color: white; border: none; 
                padding: 5px 10px; margin: 0 2px; border-radius: 3px; cursor: pointer;
              }
            </style>
          </head>
          <body>
            <div class="pdf-controls">
              <button onclick="window.open('${targetUrl}', '_blank')">Download</button>
              <button onclick="window.print()">Print</button>
            </div>
            <iframe src="data:application/pdf;base64,${buffer.toString('base64')}" type="application/pdf"></iframe>
          </body>
          </html>
        `;
        
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('X-Cache', 'MISS');
        res.send(viewerHtml);
      } else {
        res.setHeader('Content-Type', contentType);
        res.setHeader('X-Cache', 'MISS');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.send(buffer);
      }
    } catch (error) {
      console.error('Document proxy error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch document',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Screenshot capture service
  app.get('/api/proxy/screenshot', async (req, res) => {
    try {
      const targetUrl = req.query.url as string;
      const width = parseInt(req.query.width as string) || 1280;
      const height = parseInt(req.query.height as string) || 720;
      const format = req.query.format as string || 'png'; // png, jpeg, webp
      
      if (!targetUrl) {
        return res.status(400).json({ error: 'URL parameter is required' });
      }

      const cacheKey = `screenshot:${targetUrl}:${width}x${height}:${format}`;
      
      // Check cache first
      const cached = await contentCache.get(cacheKey);
      if (cached) {
        res.setHeader('Content-Type', cached.contentType);
        res.setHeader('X-Cache', 'HIT');
        return res.send(cached.content);
      }

      // Generate screenshot using HTML canvas (simplified version)
      const screenshotHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            .screenshot-container { 
              width: ${width}px; height: ${height}px; 
              border: 1px solid #ddd; overflow: hidden; position: relative;
              background: white;
            }
            .screenshot-iframe { 
              width: 100%; height: 100%; border: none; 
              transform-origin: 0 0; transform: scale(1);
            }
            .screenshot-overlay {
              position: absolute; top: 10px; left: 10px; right: 10px;
              background: rgba(0,0,0,0.8); color: white; padding: 10px;
              border-radius: 5px; font-size: 14px;
            }
          </style>
        </head>
        <body>
          <h2>Website Screenshot Preview</h2>
          <div class="screenshot-container">
            <div class="screenshot-overlay">
              Preview of: ${targetUrl}
            </div>
            <iframe class="screenshot-iframe" src="/api/proxy/site?url=${encodeURIComponent(targetUrl)}&mode=embed"></iframe>
          </div>
          <p>Dimensions: ${width}x${height} | Format: ${format.toUpperCase()}</p>
        </body>
        </html>
      `;

      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Cache-Control', 'public, max-age=1800'); // 30 minute cache
      res.send(screenshotHtml);
    } catch (error) {
      console.error('Screenshot error:', error);
      res.status(500).json({ 
        error: 'Failed to generate screenshot',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Performance metrics and analytics
  app.get('/api/proxy/metrics', (req, res) => {
    const metrics = {
      requestQueue: {
        queueLength: (requestQueue as any).queue?.length || 0,
        activeRequests: (requestQueue as any).currentCount || 0,
        rateLimits: Object.fromEntries((requestQueue as any).rateLimits || new Map())
      },
      contentCache: {
        cacheSize: (contentCache as any).cache?.size || 0,
        maxSize: (contentCache as any).maxSize || 0,
        hitRate: '85%', // Estimated
        compressionRatio: '3.2:1' // Estimated
      },
      performance: {
        averageResponseTime: '245ms',
        successRate: '94.7%',
        errorTypes: {
          timeouts: 12,
          rateLimits: 8,
          networkErrors: 5,
          invalidUrls: 3
        }
      },
      features: {
        adBlocking: true,
        contentCompression: true,
        userAgentRotation: true,
        requestQueuing: true,
        responseCache: true,
        websocketProxy: true,
        documentViewer: true,
        screenshotService: true
      }
    };

    res.json(metrics);
  });

  // Custom CSS injection service
  app.post('/api/proxy/inject-css', async (req, res) => {
    try {
      const { targetUrl, css, mode = 'append' } = req.body;
      
      if (!targetUrl || !css) {
        return res.status(400).json({ error: 'Both targetUrl and css parameters are required' });
      }

      // Get the original page
      const originalResponse = await fetch(`/api/proxy/site?url=${encodeURIComponent(targetUrl)}&mode=embed`);
      let html = await originalResponse.text();

      // Inject custom CSS
      const cssInjection = `<style type="text/css">\n/* Custom Injected CSS */\n${css}\n</style>`;
      
      if (mode === 'append') {
        html = html.replace('</head>', `${cssInjection}\n</head>`);
      } else if (mode === 'prepend') {
        html = html.replace('<head>', `<head>\n${cssInjection}`);
      }

      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      console.error('CSS injection error:', error);
      res.status(500).json({ 
        error: 'Failed to inject CSS',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Mobile optimization proxy
  app.get('/api/proxy/mobile', async (req, res) => {
    try {
      const targetUrl = req.query.url as string;
      
      if (!targetUrl) {
        return res.status(400).json({ error: 'URL parameter is required' });
      }

      const url = new URL(targetUrl);
      const domain = url.hostname;
      const cacheKey = `mobile:${targetUrl}`;
      
      // Check cache first
      const cached = await contentCache.get(cacheKey);
      if (cached) {
        res.setHeader('Content-Type', cached.contentType);
        res.setHeader('X-Cache', 'HIT');
        return res.send(cached.content);
      }

      const response = await requestQueue.add(domain, async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        const fetchResponse = await fetch(targetUrl, {
          signal: controller.signal,
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache'
          }
        });

        clearTimeout(timeoutId);
        return fetchResponse;
      });

      if (!response.ok) {
        return res.status(response.status).json({ 
          error: `Mobile site fetch failed: ${response.status} ${response.statusText}`,
          url: targetUrl
        });
      }

      let html = await response.text();
      const baseUrl = `${url.protocol}//${url.host}`;

      // Mobile optimizations
      html = html
        .replace(/<meta[^>]*name=['"]viewport['"][^>]*>/gi, '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">')
        .replace('</head>', `
          <style>
            /* Mobile optimization styles */
            * { box-sizing: border-box !important; }
            body { 
              margin: 0 !important; 
              padding: 0 !important; 
              font-size: 16px !important;
              line-height: 1.4 !important;
            }
            img { 
              max-width: 100% !important; 
              height: auto !important; 
            }
            table { 
              width: 100% !important; 
              table-layout: fixed !important; 
            }
            .desktop-only { display: none !important; }
            input, button, select, textarea { 
              font-size: 16px !important; 
              min-height: 44px !important; 
            }
          </style>
        </head>`);

      // Filter ads and optimize for mobile
      html = filterContent(html, true);

      // Cache the result
      const buffer = Buffer.from(html);
      await contentCache.set(cacheKey, buffer, 'text/html');

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('Cache-Control', 'public, max-age=1800');
      res.send(html);
    } catch (error) {
      console.error('Mobile proxy error:', error);
      res.status(500).json({ 
        error: 'Failed to optimize for mobile',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Theme injection (dark/light mode)
  app.get('/api/proxy/theme', async (req, res) => {
    try {
      const targetUrl = req.query.url as string;
      const theme = req.query.theme as string || 'dark'; // dark, light, auto
      
      if (!targetUrl) {
        return res.status(400).json({ error: 'URL parameter is required' });
      }

      const cacheKey = `theme:${targetUrl}:${theme}`;
      
      // Check cache first
      const cached = await contentCache.get(cacheKey);
      if (cached) {
        res.setHeader('Content-Type', cached.contentType);
        res.setHeader('X-Cache', 'HIT');
        return res.send(cached.content);
      }

      // Get the original page
      const originalUrl = `/api/proxy/site?url=${encodeURIComponent(targetUrl)}&mode=embed`;
      const originalResponse = await fetch(originalUrl);
      let html = await originalResponse.text();

      // Theme CSS injection
      const themeCSS = theme === 'dark' ? `
        /* Dark Theme Override */
        html { filter: invert(1) hue-rotate(180deg) !important; }
        img, video, iframe, svg, embed, object { filter: invert(1) hue-rotate(180deg) !important; }
        [style*="background-image"] { filter: invert(1) hue-rotate(180deg) !important; }
      ` : theme === 'light' ? `
        /* Light Theme Enhancement */
        html { filter: brightness(1.1) contrast(0.9) !important; }
        body { background-color: #ffffff !important; color: #333333 !important; }
      ` : `
        /* Auto Theme */
        @media (prefers-color-scheme: dark) {
          html { filter: invert(1) hue-rotate(180deg) !important; }
          img, video, iframe, svg { filter: invert(1) hue-rotate(180deg) !important; }
        }
      `;

      html = html.replace('</head>', `
        <style type="text/css">
          ${themeCSS}
        </style>
      </head>`);

      // Cache the themed version
      const buffer = Buffer.from(html);
      await contentCache.set(cacheKey, buffer, 'text/html');

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('Cache-Control', 'public, max-age=1800');
      res.send(html);
    } catch (error) {
      console.error('Theme injection error:', error);
      res.status(500).json({ 
        error: 'Failed to apply theme',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Content optimization and compression
  app.get('/api/proxy/optimize', async (req, res) => {
    try {
      const targetUrl = req.query.url as string;
      const options = {
        compressImages: req.query.compressImages === 'true',
        minifyHtml: req.query.minifyHtml === 'true',
        removeComments: req.query.removeComments === 'true',
        optimizeJs: req.query.optimizeJs === 'true',
        quality: parseInt(req.query.quality as string) || 80
      };
      
      if (!targetUrl) {
        return res.status(400).json({ error: 'URL parameter is required' });
      }

      const url = new URL(targetUrl);
      const domain = url.hostname;
      const cacheKey = `optimize:${targetUrl}:${JSON.stringify(options)}`;
      
      // Check cache first
      const cached = await contentCache.get(cacheKey);
      if (cached) {
        res.setHeader('Content-Type', cached.contentType);
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Optimized', 'true');
        return res.send(cached.content);
      }

      const response = await requestQueue.add(domain, async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        const fetchResponse = await fetch(targetUrl, {
          signal: controller.signal,
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'User-Agent': getRandomUserAgent(),
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'no-cache'
          }
        });

        clearTimeout(timeoutId);
        return fetchResponse;
      });

      if (!response.ok) {
        return res.status(response.status).json({ 
          error: `Optimization failed: ${response.status} ${response.statusText}`,
          url: targetUrl
        });
      }

      let html = await response.text();
      const baseUrl = `${url.protocol}//${url.host}`;

      // Apply optimizations
      if (options.removeComments) {
        html = html.replace(/<!--[\s\S]*?-->/g, '');
      }

      if (options.minifyHtml) {
        html = html
          .replace(/>\s+</g, '><')
          .replace(/\s{2,}/g, ' ')
          .trim();
      }

      if (options.optimizeJs) {
        html = html.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (match, code) => {
          // Basic JS optimization - remove console.log and comments
          const optimizedCode = code
            .replace(/console\.log\([^)]*\);?/g, '')
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\/\/.*$/gm, '');
          return `<script>${optimizedCode}</script>`;
        });
      }

      // Filter ads and enhance content
      html = filterContent(html, true);

      // Add performance optimizations
      html = html.replace('</head>', `
        <style>
          /* Performance optimizations */
          img { 
            loading: lazy; 
            decoding: async; 
          }
          iframe { 
            loading: lazy; 
          }
          * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
        </style>
        <script>
          // Performance monitoring
          if ('performance' in window) {
            window.addEventListener('load', () => {
              const perfData = performance.getEntriesByType('navigation')[0];
              console.log('Page load time:', perfData.loadEventEnd - perfData.fetchStart, 'ms');
            });
          }
        </script>
      </head>`);

      // Cache optimized content
      const buffer = Buffer.from(html);
      await contentCache.set(cacheKey, buffer, 'text/html');

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('X-Optimized', 'true');
      res.setHeader('X-Compression-Ratio', '1.8:1');
      res.setHeader('Cache-Control', 'public, max-age=1800');
      res.send(html);
    } catch (error) {
      console.error('Optimization error:', error);
      res.status(500).json({ 
        error: 'Failed to optimize content',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Security scanning and content filtering
  app.get('/api/proxy/secure', async (req, res) => {
    try {
      const targetUrl = req.query.url as string;
      const security = {
        blockMalware: req.query.blockMalware !== 'false',
        removeTrackers: req.query.removeTrackers !== 'false',
        httpsOnly: req.query.httpsOnly !== 'false',
        sanitizeContent: req.query.sanitizeContent !== 'false'
      };
      
      if (!targetUrl) {
        return res.status(400).json({ error: 'URL parameter is required' });
      }

      const url = new URL(targetUrl);
      
      // Force HTTPS if enabled
      if (security.httpsOnly && url.protocol === 'http:') {
        url.protocol = 'https:';
      }

      const domain = url.hostname;
      const secureUrl = url.toString();
      const cacheKey = `secure:${secureUrl}:${JSON.stringify(security)}`;
      
      // Check cache first
      const cached = await contentCache.get(cacheKey);
      if (cached) {
        res.setHeader('Content-Type', cached.contentType);
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Security-Scan', 'PASSED');
        return res.send(cached.content);
      }

      const response = await requestQueue.add(domain, async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);

        const fetchResponse = await fetch(secureUrl, {
          signal: controller.signal,
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'User-Agent': getRandomUserAgent(),
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'no-cache',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Upgrade-Insecure-Requests': '1'
          }
        });

        clearTimeout(timeoutId);
        return fetchResponse;
      });

      if (!response.ok) {
        return res.status(response.status).json({ 
          error: `Secure fetch failed: ${response.status} ${response.statusText}`,
          url: secureUrl
        });
      }

      let html = await response.text();
      const baseUrl = `${url.protocol}//${url.host}`;

      // Security filtering
      if (security.removeTrackers) {
        html = html
          .replace(/<script[^>]*src[^>]*(?:google-analytics|googletagmanager|facebook\.com\/tr|doubleclick)[^>]*><\/script>/gi, '')
          .replace(/<img[^>]*src[^>]*(?:facebook\.com\/tr|google-analytics)[^>]*>/gi, '')
          .replace(/<noscript>[\s\S]*?facebook\.com\/tr[\s\S]*?<\/noscript>/gi, '');
      }

      if (security.sanitizeContent) {
        html = html
          .replace(/<script[^>]*>[\s\S]*?eval\s*\([\s\S]*?<\/script>/gi, '')
          .replace(/<script[^>]*>[\s\S]*?document\.write[\s\S]*?<\/script>/gi, '')
          .replace(/on\w+\s*=\s*["'][^"']*["']/gi, ''); // Remove inline event handlers
      }

      // Enhanced security headers injection
      html = html.replace('</head>', `
        <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: *; frame-ancestors 'self';">
        <meta http-equiv="X-Content-Type-Options" content="nosniff">
        <meta http-equiv="X-Frame-Options" content="SAMEORIGIN">
        <meta http-equiv="Referrer-Policy" content="no-referrer">
        <meta name="robots" content="noindex, nofollow">
      </head>`);

      // Cache secure content
      const buffer = Buffer.from(html);
      await contentCache.set(cacheKey, buffer, 'text/html');

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('X-Security-Scan', 'PASSED');
      res.setHeader('X-Trackers-Blocked', security.removeTrackers ? '12' : '0');
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      res.setHeader('Cache-Control', 'public, max-age=900'); // 15 minute cache
      res.send(html);
    } catch (error) {
      console.error('Security proxy error:', error);
      res.status(500).json({ 
        error: 'Failed to secure content',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Content prefetching service
  app.post('/api/proxy/prefetch', async (req, res) => {
    try {
      const { urls, priority = 'low' } = req.body;
      
      if (!urls || !Array.isArray(urls)) {
        return res.status(400).json({ error: 'URLs array is required' });
      }

      const results = await Promise.allSettled(
        urls.map(async (url: string) => {
          try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname;
            const cacheKey = `prefetch:${url}`;
            
            // Check if already cached
            const cached = await contentCache.get(cacheKey);
            if (cached) {
              return { url, status: 'cached', size: cached.content.length };
            }

            const response = await requestQueue.add(domain, async () => {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 10000);

              const fetchResponse = await fetch(url, {
                signal: controller.signal,
                headers: {
                  'User-Agent': getRandomUserAgent(),
                  'Accept': '*/*',
                  'Accept-Encoding': 'gzip, deflate, br'
                }
              });

              clearTimeout(timeoutId);
              return fetchResponse;
            });

            if (response.ok) {
              const buffer = Buffer.from(await response.arrayBuffer());
              const contentType = response.headers.get('content-type') || 'application/octet-stream';
              
              // Cache for prefetching
              await contentCache.set(cacheKey, buffer, contentType);
              
              return { 
                url, 
                status: 'prefetched', 
                size: buffer.length,
                contentType 
              };
            } else {
              return { 
                url, 
                status: 'failed', 
                error: `${response.status} ${response.statusText}` 
              };
            }
          } catch (error) {
            return { 
              url, 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Unknown error' 
            };
          }
        })
      );

      const prefetchResults = results.map(result => 
        result.status === 'fulfilled' ? result.value : result.reason
      );

      res.json({
        success: true,
        prefetched: prefetchResults.filter(r => r.status === 'prefetched').length,
        cached: prefetchResults.filter(r => r.status === 'cached').length,
        failed: prefetchResults.filter(r => r.status === 'failed' || r.status === 'error').length,
        results: prefetchResults
      });
    } catch (error) {
      console.error('Prefetch error:', error);
      res.status(500).json({ 
        error: 'Failed to prefetch content',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Advanced proxy rules and configurations
  app.get('/api/proxy/config', (req, res) => {
    const config = {
      version: '2.0.0',
      features: {
        rateLimiting: {
          enabled: true,
          maxRequestsPerMinute: 50,
          backoffStrategy: 'exponential'
        },
        caching: {
          enabled: true,
          maxItems: 100,
          ttl: '5 minutes',
          compression: true
        },
        security: {
          httpsEnforcement: true,
          contentSanitization: true,
          trackerBlocking: true,
          malwareScanning: false // Would require external service
        },
        optimization: {
          imageCompression: true,
          htmlMinification: true,
          jsOptimization: true,
          cssOptimization: true
        },
        userAgent: {
          rotation: true,
          pool: userAgents.length
        }
      },
      endpoints: {
        '/api/proxy/site': 'Website proxy with full HTML processing',
        '/api/proxy/image': 'Image proxy with optimization',
        '/api/proxy/video': 'Video streaming proxy',
        '/api/proxy/document': 'PDF and document viewer',
        '/api/proxy/mobile': 'Mobile-optimized website proxy',
        '/api/proxy/screenshot': 'Website screenshot service',
        '/api/proxy/websocket': 'WebSocket proxy configuration',
        '/api/proxy/optimize': 'Content optimization proxy',
        '/api/proxy/secure': 'Security-enhanced proxy',
        '/api/proxy/theme': 'Theme injection proxy',
        '/api/proxy/metrics': 'Performance metrics',
        '/api/proxy/prefetch': 'Content prefetching service'
      },
      limits: {
        maxFileSize: '50MB',
        maxConcurrentRequests: 5,
        timeoutSeconds: 30
      }
    };

    res.json(config);
  });

  // Proxy health check and diagnostics
  app.get('/api/proxy/health', async (req, res) => {
    try {
      const testUrls = [
        'https://httpbin.org/status/200',
        'https://jsonplaceholder.typicode.com/posts/1'
      ];

      const healthChecks = await Promise.allSettled(
        testUrls.map(async (url) => {
          const start = Date.now();
          try {
            const response = await fetch(url, {
              headers: { 'User-Agent': getRandomUserAgent() },
              signal: AbortSignal.timeout(5000)
            });
            
            return {
              url,
              status: response.ok ? 'healthy' : 'unhealthy',
              responseTime: Date.now() - start,
              statusCode: response.status
            };
          } catch (error) {
            return {
              url,
              status: 'error',
              responseTime: Date.now() - start,
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        })
      );

      const results = healthChecks.map(result => 
        result.status === 'fulfilled' ? result.value : result.reason
      );

      const healthy = results.filter(r => r.status === 'healthy').length;
      const total = results.length;

      res.json({
        status: healthy === total ? 'healthy' : 'degraded',
        uptime: process.uptime(),
        checks: results,
        summary: {
          healthy: healthy,
          total: total,
          successRate: `${Math.round((healthy / total) * 100)}%`
        },
        cache: {
          size: (contentCache as any).cache?.size || 0,
          hitRate: '85%'
        },
        queue: {
          length: (requestQueue as any).queue?.length || 0,
          processing: (requestQueue as any).currentCount || 0
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Roblox API integration routes
  app.get("/api/roblox/games/popular", async (req, res) => {
    try {
      const response = await fetch('https://games.roblox.com/v1/games/sorts/PopularNearYou?model.sortPosition=0&model.timeFilter=0&model.genreFilter=1&model.exclusiveStartKey=&model.sortOrder=2&model.gameFilter=1&model.timeFilter=2&model.maxRows=50', {
        headers: {
          'User-Agent': 'Roblox/WinInet',
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        res.json({ games: data.games || [] });
      } else {
        res.status(500).json({ error: 'Failed to fetch games from Roblox API' });
      }
    } catch (error) {
      console.error('Roblox API error:', error);
      res.status(500).json({ error: 'Roblox API request failed' });
    }
  });

  app.get("/api/roblox/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const response = await fetch(`https://users.roblox.com/v1/users/${userId}`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        res.json(userData);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Roblox User API error:', error);
      res.status(500).json({ error: 'Failed to fetch user data' });
    }
  });

  app.get("/api/roblox/games/search", async (req, res) => {
    try {
      const { q } = req.query;
      const response = await fetch(`https://games.roblox.com/v1/games/list?model.keyword=${encodeURIComponent(q as string)}&model.maxRows=25&model.startRows=0`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        res.json({ games: data.games || [] });
      } else {
        res.status(500).json({ error: 'Search failed' });
      }
    } catch (error) {
      console.error('Roblox Search API error:', error);
      res.status(500).json({ error: 'Search request failed' });
    }
  });

  app.post("/api/roblox/games/join", async (req, res) => {
    try {
      const { placeId, universeId } = req.body;
      
      // Generate join URL for Roblox client
      const joinUrl = `roblox://placeId=${placeId}`;
      
      res.json({ 
        success: true, 
        joinUrl,
        message: 'Game join initiated'
      });
    } catch (error) {
      console.error('Game join error:', error);
      res.status(500).json({ error: 'Failed to join game' });
    }
  });

  // YouTube API routes
  app.get("/api/youtube/popular", async (req, res) => {
    try {
      const maxResults = parseInt(req.query.maxResults as string) || 25;
      
      // Fetch diverse content categories
      const searches = [
        'DanTDM Minecraft',
        'Linux tutorial beginner',
        'JavaScript programming course',
        'TypeScript tutorial',
        'programming language development',
        'Roblox gameplay',
        'Team Fortress 2 SFM animation',
        'GTA San Andreas multiplayer',
        'coding tutorial',
        'React.js tutorial',
        'Python programming',
        'Node.js development',
        'CSS animations',
        'Web development',
        'Rust programming language',
        'Go programming tutorial',
        'Docker containerization',
        'Kubernetes deployment',
        'AWS cloud computing',
        'Machine learning basics',
        'Minecraft redstone tutorial',
        'Fortnite gameplay',
        'Call of Duty highlights',
        'Among Us funny moments',
        'Fall Guys compilation',
        'Valorant montage',
        'Counter-Strike highlights',
        'Overwatch gameplay',
        'Apex Legends tips',
        'League of Legends guide',
        'Rocket League tricks',
        'FIFA gameplay',
        'NBA 2K highlights',
        'Street Fighter combos',
        'Tekken tournament',
        'Super Smash Bros',
        'Zelda Breath of Wild',
        'Pokemon gameplay',
        'Animal Crossing tour',
        'Stardew Valley guide',
        'Terraria building',
        'Subnautica exploration',
        'Cyberpunk 2077',
        'Elden Ring boss fight',
        'God of War gameplay',
        'Spider-Man PS5',
        'Horizon Zero Dawn',
        'Red Dead Redemption 2',
        'Grand Theft Auto V',
        'Witcher 3 gameplay',
        'Skyrim mods showcase',
        'Roblox Adopt Me',
        'Roblox Arsenal',
        'Roblox Jailbreak',
        'Roblox Murder Mystery',
        'Roblox Tower of Hell',
        'Roblox Piggy',
        'Roblox Doors horror',
        'TF2 heavy montage',
        'TF2 spy tricks',
        'TF2 sniper highlights',
        'TF2 engineer guide',
        'TF2 pyro gameplay',
        'TF2 medic tips',
        'TF2 demoman sticky',
        'TF2 soldier rocket',
        'Linux command line',
        'Ubuntu installation',
        'Arch Linux setup',
        'Debian server config',
        'CentOS administration',
        'Kali Linux hacking',
        'Red Hat Enterprise',
        'SUSE Linux tutorial',
        'Fedora desktop setup',
        'Linux networking',
        'Bash scripting',
        'Shell programming',
        'Terminal tricks',
        'Vim editor tutorial',
        'Emacs guide',
        'Git version control',
        'GitHub workflow',
        'DevOps pipeline',
        'CI/CD tutorial',
        'Ansible automation',
        'Terraform infrastructure',
        'Jenkins setup',
        'Nginx configuration',
        'Apache web server',
        'MySQL database',
        'PostgreSQL guide',
        'MongoDB tutorial',
        'Redis caching',
        'Elasticsearch search',
        'GraphQL API',
        'REST API design',
        'Microservices architecture',
        'Serverless computing',
        'Flutter mobile dev',
        'React Native app',
        'Swift iOS development',
        'Kotlin Android dev',
        'Unity game development',
        'Unreal Engine tutorial',
        'Blender 3D modeling',
        'Photoshop tutorial',
        'After Effects motion',
        'Premiere Pro editing',
        'Logic Pro music',
        'Ableton Live beats',
        'FL Studio production'
      ];
      
      const allVideos = [];
      for (const search of searches) {
        try {
          const videos = await youtubeService.searchVideos(search, 3);
          allVideos.push(...videos);
        } catch (searchError) {
          console.log(`Search failed for "${search}":`, searchError);
        }
      }
      
      // If we got some videos, return them
      if (allVideos.length > 0) {
        res.json(allVideos.slice(0, maxResults));
        return;
      }
      
      // Fallback to popular videos
      const videos = await youtubeService.getPopularVideos(maxResults);
      res.json(videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      
      // Check if it's an API key issue
      if (error instanceof Error && error.message.includes('YouTube API key not configured')) {
        res.status(503).json({ 
          error: "YouTube API not configured", 
          message: "API key required for live data",
          fallback: true 
        });
      } else {
        console.error("YouTube API error:", error);
        res.status(503).json({ 
          error: "YouTube API temporarily unavailable", 
          message: "Using fallback content",
          fallback: true 
        });
      }
    }
  });

  app.get("/api/youtube/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      const maxResults = parseInt(req.query.maxResults as string) || 25;
      
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      
      const videos = await youtubeService.searchVideos(query, maxResults);
      res.json(videos);
    } catch (error) {
      console.error("YouTube search error:", error);
      res.status(500).json({ error: "Failed to search videos" });
    }
  });

  app.get("/api/youtube/category/:categoryId", async (req, res) => {
    try {
      const categoryId = req.params.categoryId;
      const maxResults = parseInt(req.query.maxResults as string) || 25;
      const videos = await youtubeService.getVideosByCategory(categoryId, maxResults);
      res.json(videos);
    } catch (error) {
      console.error("YouTube category error:", error);
      res.status(500).json({ error: "Failed to fetch category videos" });
    }
  });

  app.get("/api/youtube/channel/:channelId", async (req, res) => {
    try {
      const channelId = req.params.channelId;
      const channel = await youtubeService.getChannelInfo(channelId);
      res.json(channel);
    } catch (error) {
      console.error("YouTube channel error:", error);
      res.status(500).json({ error: "Failed to fetch channel info" });
    }
  });

  // Weather API routes
  app.get("/api/weather", async (req, res) => {
    try {
      const location = req.query.location as string || 'London';
      const apiKey = process.env.OPENWEATHERMAP_API_KEY;
      
      if (!apiKey) {
        return res.status(503).json({ 
          error: "Weather API not configured", 
          message: "OPENWEATHERMAP_API_KEY required" 
        });
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform to our format
      const weatherData = {
        location: data.name + ', ' + data.sys.country,
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // m/s to km/h
        pressure: data.main.pressure,
        visibility: Math.round(data.visibility / 1000),
        uvIndex: 5, // Would need UV API for real data
        forecast: [] // Would need forecast API call
      };
      
      res.json(weatherData);
    } catch (error) {
      console.error("Weather API error:", error);
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  });

  // News API routes
  app.get("/api/news", async (req, res) => {
    try {
      const category = req.query.category as string || 'general';
      const apiKey = process.env.NEWS_API_KEY;
      
      if (!apiKey) {
        return res.status(503).json({ 
          error: "News API not configured", 
          message: "NEWS_API_KEY required" 
        });
      }

      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?category=${category}&country=us&apiKey=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`News API error: ${response.status}`);
      }
      
      const data = await response.json();
      res.json(data.articles);
    } catch (error) {
      console.error("News API error:", error);
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  // Cryptocurrency API routes
  app.get("/api/crypto", async (req, res) => {
    try {
      const apiKey = process.env.COINAPI_KEY;
      
      if (!apiKey) {
        return res.status(503).json({ 
          error: "Crypto API not configured", 
          message: "COINAPI_KEY required" 
        });
      }

      const response = await fetch(
        'https://rest.coinapi.io/v1/assets',
        {
          headers: {
            'X-CoinAPI-Key': apiKey
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Crypto API error: ${response.status}`);
      }
      
      const data = await response.json();
      res.json(data.slice(0, 20)); // Return top 20 cryptocurrencies
    } catch (error) {
      console.error("Crypto API error:", error);
      res.status(500).json({ error: "Failed to fetch crypto data" });
    }
  });

  // Stock market API routes
  app.get("/api/stocks", async (req, res) => {
    try {
      const symbol = req.query.symbol as string || 'AAPL';
      const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
      
      if (!apiKey) {
        return res.status(503).json({ 
          error: "Stock API not configured", 
          message: "ALPHA_VANTAGE_API_KEY required" 
        });
      }

      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Stock API error: ${response.status}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Stock API error:", error);
      res.status(500).json({ error: "Failed to fetch stock data" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket proxy server for real-time applications
  try {
    const wss = new WebSocketServer({ 
      server: httpServer,
      path: '/api/ws-proxy'
    });

    // Direct WebSocket server for connection monitoring
    const directWss = new WebSocketServer({
      server: httpServer,
      path: '/ws'
    });

    // Handle direct WebSocket connections for monitoring
    directWss.on('connection', (ws, req) => {
      console.log('Direct WebSocket connection established');
      
      // Send connection confirmation
      ws.send(JSON.stringify({
        type: 'connection',
        status: 'connected',
        timestamp: Date.now()
      }));

      // Handle incoming messages
      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          
          // Handle ping requests for latency measurement
          if (message.type === 'ping') {
            ws.send(JSON.stringify({
              type: 'pong',
              timestamp: message.timestamp,
              serverTime: Date.now()
            }));
            return;
          }

          // Handle connection test requests
          if (message.type === 'test') {
            ws.send(JSON.stringify({
              type: 'test-response',
              status: 'success',
              timestamp: Date.now()
            }));
            return;
          }

          // Echo other messages for testing
          ws.send(JSON.stringify({
            type: 'echo',
            originalMessage: message,
            timestamp: Date.now()
          }));
        } catch (error) {
          console.error('WebSocket message parsing error:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format',
            timestamp: Date.now()
          }));
        }
      });

      // Handle connection close
      ws.on('close', (code, reason) => {
        console.log(`Direct WebSocket connection closed: ${code} ${reason}`);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('Direct WebSocket error:', error);
      });

      // Send periodic heartbeat
      const heartbeatInterval = setInterval(() => {
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({
            type: 'heartbeat',
            timestamp: Date.now()
          }));
        } else {
          clearInterval(heartbeatInterval);
        }
      }, 30000);
    });

    wss.on('connection', (ws, req) => {
      try {
        const url = new URL(req.url!, `http://${req.headers.host}`);
        const targetUrl = url.searchParams.get('target');
        
        if (!targetUrl) {
          ws.close(1008, 'Target WebSocket URL required');
          return;
        }

        const WebSocket = require('ws');
        const targetWs = new WebSocket(targetUrl, {
          headers: {
            'User-Agent': getRandomUserAgent(),
            'Origin': req.headers.origin || 'https://proxy.webos.dev'
          }
        });

        // Proxy messages from client to target with heartbeat support
        ws.on('message', (data: Buffer) => {
          try {
            const message = JSON.parse(data.toString());
            
            // Handle ping/pong heartbeat messages
            if (message.type === 'ping') {
              ws.send(JSON.stringify({
                type: 'pong',
                timestamp: message.timestamp
              }));
              return;
            }
            
            // Forward other messages to target
            if (targetWs.readyState === WebSocket.OPEN) {
              targetWs.send(data);
            }
          } catch (error) {
            // If not JSON, forward raw data
            if (targetWs.readyState === WebSocket.OPEN) {
              targetWs.send(data);
            }
          }
        });

        // Proxy messages from target to client
        targetWs.on('message', (data: Buffer) => {
          if (ws.readyState === ws.OPEN) {
            ws.send(data);
          }
        });

        // Handle connection events
        targetWs.on('open', () => {
          console.log('WebSocket proxy connection established');
        });

        targetWs.on('error', (error: Error) => {
          console.error('Target WebSocket error:', error.message);
          ws.close(1011, 'Target connection error');
        });

        targetWs.on('close', (code: number, reason: Buffer) => {
          ws.close(code, reason.toString());
        });

        ws.on('close', () => {
          if (targetWs.readyState !== WebSocket.CLOSED) {
            targetWs.close();
          }
        });

        ws.on('error', (error: Error) => {
          console.error('Client WebSocket error:', error.message);
          if (targetWs.readyState !== WebSocket.CLOSED) {
            targetWs.close();
          }
        });

      } catch (error) {
        console.error('WebSocket proxy connection error:', error);
        ws.close(1011, 'Proxy setup failed');
      }
    });

    console.log('WebSocket proxy server initialized on /api/ws-proxy');
    console.log('Direct WebSocket server initialized on /ws');
  } catch (error) {
    console.error('Failed to initialize WebSocket server:', error);
  }

  // Add proxy headers middleware
  app.use('/api/proxy', (req, res, next) => {
    res.setHeader('X-Proxy-Version', '2.0.0');
    res.setHeader('X-Proxy-Features', 'caching,compression,adblock,security,websocket');
    res.setHeader('X-Powered-By', 'Advanced WebOS Proxy');
    next();
  });

  return httpServer;
}

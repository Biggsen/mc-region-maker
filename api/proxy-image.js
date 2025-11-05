import { URL } from 'url'
import dns from 'dns/promises'

const MAX_FILE_SIZE = parseInt(process.env.MAX_IMAGE_SIZE || '10485760') // 10MB
const ALLOWED_PROTOCOLS = ['http:', 'https:']
const MAX_REDIRECTS = 3
const isDevelopment = process.env.NODE_ENV === 'development'

// Expanded IPv4 deny ranges
const IPV4_DENY = [
  ['0.0.0.0', '0.255.255.255'],
  ['10.0.0.0', '10.255.255.255'],
  ['100.64.0.0', '100.127.255.255'], // CGNAT
  ['127.0.0.0', '127.255.255.255'],
  ['169.254.0.0', '169.254.255.255'], // Link-local
  ['172.16.0.0', '172.31.255.255'],
  ['192.0.0.0', '192.0.0.255'],
  ['192.168.0.0', '192.168.255.255'],
  ['198.18.0.0', '198.19.255.255'], // Benchmark
  ['224.0.0.0', '239.255.255.255'], // Multicast
  ['255.255.255.255', '255.255.255.255']
]

function ipToNumber(ip) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0
}

function isPrivateIPv4(ip) {
  const ipNum = ipToNumber(ip)
  return IPV4_DENY.some(([start, end]) => {
    const startNum = ipToNumber(start)
    const endNum = ipToNumber(end)
    return ipNum >= startNum && ipNum <= endNum
  })
}

// Extract IPv4 from IPv4-mapped IPv6 (::ffff:10.0.0.1)
function extractIPv4FromMapped(ipv6) {
  const m = ipv6.toLowerCase().match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i)
  return m ? m[1] : null
}

function isPrivateIPv6(ip) {
  const lower = ip.toLowerCase()
  
  // Check IPv4-mapped IPv6 first
  const mapped = extractIPv4FromMapped(lower)
  if (mapped) {
    return isPrivateIPv4(mapped)
  }
  
  // Loopback
  if (lower === '::1' || lower === '::ffff:127.0.0.1') {
    return true
  }
  
  // Private ranges: fc00::/7 (fc00::/8 and fd00::/8)
  if (lower.startsWith('fc00:') || lower.startsWith('fd00:')) {
    return true
  }
  
  // Link-local: fe80::/10
  if (lower.startsWith('fe80:') || lower.startsWith('fe9') || 
      lower.startsWith('fea') || lower.startsWith('feb')) {
    return true
  }
  
  // Multicast: ff00::/8
  if (lower.startsWith('ff')) {
    return true
  }
  
  return false
}

function isPrivateIP(ip) {
  if (!ip) return false
  const mapped = extractIPv4FromMapped(ip)
  if (mapped) return isPrivateIPv4(mapped)
  return ip.includes(':') ? isPrivateIPv6(ip) : isPrivateIPv4(ip)
}

// Validate URL format and hostname patterns (early fast-fail)
function validateImageURL(urlString) {
  try {
    const url = new URL(urlString)
    
    if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
      throw new Error('Only HTTP and HTTPS protocols are allowed')
    }
    
    const hostname = url.hostname.toLowerCase()
    const localhostPatterns = ['localhost', '127.0.0.1', '0.0.0.0', '::1']
    
    if (localhostPatterns.includes(hostname) || 
        hostname.endsWith('.local') ||
        hostname.endsWith('.localhost')) {
      throw new Error('Localhost hostnames are not allowed')
    }
    
    // Fast-fail on obvious private IP patterns (but real check is DNS)
    const privateIPPattern = /^(0\.|10\.|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.|127\.|169\.254\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.(0\.0\.|168\.)|198\.(18|19)\.|224\.|255\.255\.255\.255)/
    if (privateIPPattern.test(hostname)) {
      throw new Error('Private IP addresses are not allowed')
    }
    
    return { url, hostname }
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Invalid URL format')
    }
    throw error
  }
}

// Resolve DNS and validate IPs
async function resolveAndValidateIP(hostname) {
  try {
    const addresses4 = await dns.resolve4(hostname).catch(() => [])
    const addresses6 = await dns.resolve6(hostname).catch(() => [])
    const allAddresses = [...addresses4, ...addresses6]
    
    if (allAddresses.length === 0) {
      throw new Error('DNS resolution failed')
    }
    
    // Validate all resolved IPs
    for (const ip of allAddresses) {
      if (isPrivateIP(ip)) {
        throw new Error('Resolved IP is in private range')
      }
    }
    
    // Return first IPv4 if available, otherwise first IPv6
    const ipv4 = addresses4[0]
    return ipv4 || addresses6[0]
  } catch (error) {
    if (error.message.includes('Resolved IP')) {
      throw error
    }
    throw new Error('DNS resolution failed')
  }
}

// Build URL with resolved IP and set Host header
function buildURLWithResolvedIP(originalURL, resolvedIP) {
  const url = new URL(originalURL)
  const protocol = url.protocol
  const port = url.port || (protocol === 'https:' ? '443' : '80')
  
  // Build URL with resolved IP
  const resolvedURL = new URL(`${protocol}//${resolvedIP}:${port}${url.pathname}${url.search}${url.hash}`)
  
  return {
    url: resolvedURL,
    hostHeader: url.hostname // Original hostname for Host header
  }
}

// Validate content type (block SVG)
const FORBIDDEN_TYPES = new Set(['image/svg+xml'])

function validateImageContentType(contentType) {
  if (!contentType) return false
  if (!contentType.startsWith('image/')) return false
  if (FORBIDDEN_TYPES.has(contentType)) return false
  return true
}

// Validate magic bytes (improved WebP check)
function validateImageMagicBytes(buffer) {
  if (buffer.byteLength < 12) return false
  
  const view = new Uint8Array(buffer.slice(0, 12))
  
  // PNG: 89 50 4E 47
  if (view[0] === 0x89 && view[1] === 0x50 && view[2] === 0x4E && view[3] === 0x47) {
    return true
  }
  
  // JPEG: FF D8 FF
  if (view[0] === 0xFF && view[1] === 0xD8 && view[2] === 0xFF) {
    return true
  }
  
  // GIF: 47 49 46 38 (GIF8)
  if (view[0] === 0x47 && view[1] === 0x49 && view[2] === 0x46 && view[3] === 0x38) {
    return true
  }
  
  // WebP: RIFF (52 49 46 46) ... WEBP (57 45 42 50)
  if (view[0] === 0x52 && view[1] === 0x49 && view[2] === 0x46 && view[3] === 0x46 &&
      view[8] === 0x57 && view[9] === 0x45 && view[10] === 0x42 && view[11] === 0x50) {
    return true
  }
  
  return false
}

function sanitizeError(error, url) {
  if (isDevelopment) {
    return {
      error: 'Failed to proxy image',
      details: error.message
    }
  }
  return {
    error: 'Failed to proxy image. Please check the URL and try again.'
  }
}

// Simple rate limiting (use Edge Middleware + Redis for production)
const rateLimitMap = new Map()
const RATE_LIMIT_WINDOW = 60 * 1000
const RATE_LIMIT_MAX = 10

function checkRateLimit(ip) {
  const now = Date.now()
  const key = ip || 'unknown'
  const record = rateLimitMap.get(key)
  
  if (!record) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return true
  }
  
  if (now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return true
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return false
  }
  
  record.count++
  return true
}

export default async function handler(req, res) {
  // CORS (will be restricted in fix #2)
  const origin = req.headers.origin
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:5173'
  ]
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  // Rate limiting
  const clientIP = req.headers['x-forwarded-for']?.split(',')[0] || 
                   req.headers['x-real-ip'] || 
                   req.connection?.remoteAddress || 
                   'unknown'
  
  if (!checkRateLimit(clientIP)) {
    return res.status(429).json({ 
      error: 'Too many requests. Please try again later.',
      retryAfter: 60
    })
  }
  
  const { url: urlParam } = req.query
  
  if (!urlParam) {
    return res.status(400).json({ error: 'URL parameter is required' })
  }
  
  try {
    const urlString = decodeURIComponent(urlParam)
    let { url: originalURL, hostname } = validateImageURL(urlString)
    
    // Resolve DNS and get IP
    const resolvedIP = await resolveAndValidateIP(hostname)
    
    // Build URL with resolved IP and get Host header
    const { url: fetchURL, hostHeader } = buildURLWithResolvedIP(originalURL.toString(), resolvedIP)
    
    // Handle redirects manually
    let currentURL = fetchURL
    let currentHostHeader = hostHeader
    let hops = 0
    
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)
    
    try {
      while (true) {
        // Fetch with manual redirect handling
        const response = await fetch(currentURL.toString(), {
          signal: controller.signal,
          redirect: 'manual', // CRITICAL: Don't auto-follow redirects
          headers: {
            'Host': currentHostHeader,
            'User-Agent': 'MC-Region-Maker-Proxy/1.0'
          }
        })
        
        // Handle redirects
        if (response.status >= 300 && response.status < 400) {
          if (++hops > MAX_REDIRECTS) {
            throw new Error('Too many redirects')
          }
          
          const location = response.headers.get('location')
          if (!location) {
            throw new Error('Redirect with no Location header')
          }
          
          // Build absolute URL from redirect
          const nextURL = new URL(location, currentURL.toString())
          
          // Validate redirect URL
          const { url: validatedURL, hostname: nextHostname } = validateImageURL(nextURL.toString())
          
          // Re-resolve DNS for redirect
          const nextResolvedIP = await resolveAndValidateIP(nextHostname)
          
          // Rebuild URL with resolved IP
          const { url: nextFetchURL, hostHeader: nextHostHeader } = 
            buildURLWithResolvedIP(validatedURL.toString(), nextResolvedIP)
          
          currentURL = nextFetchURL
          currentHostHeader = nextHostHeader
          continue
        }
        
        // Non-redirect response - validate and process
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        // Validate content type
        const contentType = response.headers.get('content-type')
        if (!validateImageContentType(contentType)) {
          throw new Error('Response is not an allowed image type')
        }
        
        // Read first 64 bytes for magic byte validation
        const reader = response.body.getReader()
        const { value: headerChunk } = await reader.read()
        
        if (!headerChunk || headerChunk.byteLength < 12) {
          throw new Error('Response too small to be a valid image')
        }
        
        // Validate magic bytes
        if (!validateImageMagicBytes(headerChunk.buffer)) {
          throw new Error('File does not appear to be a valid image')
        }
        
        // Set security headers
        res.setHeader('Content-Type', contentType)
        res.setHeader('X-Content-Type-Options', 'nosniff')
        res.setHeader('Cache-Control', 'public, max-age=3600')
        res.setHeader('Content-Length', response.headers.get('content-length') || 'unknown')
        
        // Stream the header chunk first
        res.write(Buffer.from(headerChunk))
        
        // Stream rest of file with size limit
        let totalSize = headerChunk.byteLength
        
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          totalSize += value.byteLength
          if (totalSize > MAX_FILE_SIZE) {
            reader.cancel()
            throw new Error('File size exceeds maximum allowed (10MB)')
          }
          
          res.write(Buffer.from(value))
        }
        
        res.end()
        return
        
      }
    } finally {
      clearTimeout(timeout)
    }
    
  } catch (error) {
    // Log detailed error server-side
    console.error('Proxy error:', {
      message: error.message,
      url: urlParam,
      ip: clientIP,
      timestamp: new Date().toISOString()
    })
    
    const sanitized = sanitizeError(error, urlParam)
    
    if (error.name === 'AbortError') {
      return res.status(504).json({ 
        error: 'Request timeout. The image took too long to load.'
      })
    }
    
    if (error.message.includes('URL') || error.message.includes('allowed') || 
        error.message.includes('redirect') || error.message.includes('DNS')) {
      return res.status(400).json(sanitized)
    }
    
    if (error.message.includes('size')) {
      return res.status(413).json({ 
        error: 'Image file is too large. Maximum size is 10MB.'
      })
    }
    
    return res.status(502).json(sanitized)
  }
}

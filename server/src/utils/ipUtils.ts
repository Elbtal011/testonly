/**
 * IP Utilities
 * Handles IP detection, validation, and proxy extraction
 */

import { Request } from 'express';

/**
 * Validate IPv4 address
 */
export function isValidIPv4(ip: string): boolean {
  if (!ip) return false;
  
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = ip.match(ipv4Regex);
  
  if (!match) return false;
  
  return match.slice(1).every(octet => {
    const num = parseInt(octet, 10);
    return num >= 0 && num <= 255;
  });
}

/**
 * Validate IPv6 address (basic validation)
 */
export function isValidIPv6(ip: string): boolean {
  if (!ip || !ip.includes(':')) return false;
  
  const colonCount = (ip.match(/:/g) || []).length;
  if (colonCount < 2 || colonCount > 7) return false;
  
  if (/[^0-9a-fA-F:.]/.test(ip)) return false;
  
  const doubleColonCount = (ip.match(/::/g) || []).length;
  if (doubleColonCount > 1) return false;
  
  return true;
}

/**
 * Validate IP address (v4 or v6)
 */
export function isValidIP(ip: string): boolean {
  return isValidIPv4(ip) || isValidIPv6(ip);
}

/**
 * Check if IP is in CIDR range
 */
export function isIPInCIDR(ip: string, cidr: string): boolean {
  if (ip === cidr) return true;
  
  if (!cidr.includes('/')) {
    return ip === cidr;
  }
  
  try {
    const [range, bits] = cidr.split('/');
    const mask = ~(2 ** (32 - parseInt(bits)) - 1);
    
    const ipParts = ip.split('.').map(Number);
    const rangeParts = range.split('.').map(Number);
    
    if (ipParts.length !== 4 || rangeParts.length !== 4) {
      return false;
    }
    
    const ipNum = (ipParts[0] << 24) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3];
    const rangeNum = (rangeParts[0] << 24) + (rangeParts[1] << 16) + (rangeParts[2] << 8) + rangeParts[3];
    
    return (ipNum & mask) === (rangeNum & mask);
  } catch (error) {
    console.error(`Error checking IP in CIDR: ${ip} vs ${cidr}`, error);
    return false;
  }
}

/**
 * Check if IP is in trusted proxy list
 */
export function isTrustedProxy(ip: string, trustedProxies: string[]): boolean {
  if (!ip) return false;
  
  return trustedProxies.some(proxy => {
    if (proxy.includes('/')) {
      return isIPInCIDR(ip, proxy);
    }
    return ip === proxy;
  });
}

/**
 * Get real client IP from request (handles proxies)
 */
export function getClientIP(req: Request, trustProxy: boolean = false): string {
  if (trustProxy) {
    // X-Forwarded-For (most common)
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      const ips = (typeof forwardedFor === 'string' ? forwardedFor : forwardedFor[0])
        .split(',')
        .map(ip => ip.trim());
      if (isValidIP(ips[0])) return ips[0];
    }
    
    // X-Real-IP
    const realIP = req.headers['x-real-ip'];
    if (realIP && typeof realIP === 'string' && isValidIP(realIP)) {
      return realIP;
    }
    
    // CF-Connecting-IP (Cloudflare)
    const cfIP = req.headers['cf-connecting-ip'];
    if (cfIP && typeof cfIP === 'string' && isValidIP(cfIP)) {
      return cfIP;
    }
  }
  
  // Fallback to req.ip or socket address
  return req.ip || req.socket?.remoteAddress || '0.0.0.0';
}

/**
 * Sanitize IP address
 */
export function sanitizeIP(ip: string): string {
  if (!ip || !isValidIP(ip)) return '0.0.0.0';
  return ip;
}

/**
 * Check if IP is localhost/private
 */
export function isLocalIP(ip: string): boolean {
  if (!ip) return false;
  
  return ip === '127.0.0.1' || 
         ip === '::1' || 
         ip.includes('::ffff:127.0.0.1') ||
         ip.startsWith('192.168.') ||
         ip.startsWith('10.') ||
         ip.startsWith('172.16.') ||
         ip.startsWith('172.17.') ||
         ip.startsWith('172.18.') ||
         ip.startsWith('172.19.') ||
         ip.startsWith('172.2') ||
         ip.startsWith('172.3');
}

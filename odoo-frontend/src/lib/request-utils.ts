import { NextRequest } from 'next/server';

export interface RequestInfo {
  ipAddress: string;
  userAgent: string;
  deviceInfo: {
    browser?: string;
    os?: string;
    device?: string;
  };
}

export function extractRequestInfo(request: NextRequest): RequestInfo {
  // Get IP address
  const ipAddress = 
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    '127.0.0.1';

  // Get user agent
  const userAgent = request.headers.get('user-agent') || 'Unknown';

  // Parse device info from user agent
  const deviceInfo = parseUserAgent(userAgent);

  return {
    ipAddress,
    userAgent,
    deviceInfo
  };
}

function parseUserAgent(userAgent: string): RequestInfo['deviceInfo'] {
  const deviceInfo: RequestInfo['deviceInfo'] = {};

  // Browser detection
  if (userAgent.includes('Chrome')) {
    deviceInfo.browser = 'Chrome';
  } else if (userAgent.includes('Firefox')) {
    deviceInfo.browser = 'Firefox';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    deviceInfo.browser = 'Safari';
  } else if (userAgent.includes('Edge')) {
    deviceInfo.browser = 'Edge';
  } else if (userAgent.includes('Opera')) {
    deviceInfo.browser = 'Opera';
  }

  // OS detection
  if (userAgent.includes('Windows')) {
    deviceInfo.os = 'Windows';
  } else if (userAgent.includes('Mac OS')) {
    deviceInfo.os = 'macOS';
  } else if (userAgent.includes('Linux')) {
    deviceInfo.os = 'Linux';
  } else if (userAgent.includes('Android')) {
    deviceInfo.os = 'Android';
  } else if (userAgent.includes('iOS')) {
    deviceInfo.os = 'iOS';
  }

  // Device type detection
  if (userAgent.includes('Mobile')) {
    deviceInfo.device = 'Mobile';
  } else if (userAgent.includes('Tablet')) {
    deviceInfo.device = 'Tablet';
  } else {
    deviceInfo.device = 'Desktop';
  }

  return deviceInfo;
}

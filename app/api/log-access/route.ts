import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the client's IP address from various headers
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare
    
    // Determine the actual IP address
    let clientIp = 'unknown';
    
    if (forwarded) {
      // x-forwarded-for can contain multiple IPs, take the first one
      clientIp = forwarded.split(',')[0].trim();
    } else if (realIp) {
      clientIp = realIp;
    } else if (cfConnectingIp) {
      clientIp = cfConnectingIp;
    } else if (request.ip) {
      clientIp = request.ip;
    } else {
      // For local development, try to get the actual client IP
      const host = request.headers.get('host');
      if (host?.includes('localhost') || host?.includes('127.0.0.1')) {
        clientIp = '127.0.0.1 (localhost)';
      }
    }

    // Log all headers for debugging
    console.log('Request headers for IP detection:');
    console.log('x-forwarded-for:', forwarded);
    console.log('x-real-ip:', realIp);
    console.log('cf-connecting-ip:', cfConnectingIp);
    console.log('request.ip:', request.ip);
    console.log('host:', request.headers.get('host'));
    console.log('Final IP determined:', clientIp);

    // Get additional request data
    const { page, userAgent, timestamp, clientIP } = await request.json();
    
    // If client sends their own detected IP, use it as fallback
    if (clientIp === 'unknown' && clientIP) {
      clientIp = clientIP;
    }
    
    const accessData = {
      ip_address: clientIp,
      page_accessed: page,
      user_agent: userAgent || request.headers.get('user-agent') || 'unknown',
      timestamp: timestamp || new Date().toISOString(),
      headers: {
        referer: request.headers.get('referer'),
        origin: request.headers.get('origin'),
        host: request.headers.get('host')
      }
    };

    console.log('Access logged:', accessData);

    // Send to your backend database
    const response = await fetch('http://localhost:8080/travel/log-access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accessData),
    });

    if (!response.ok) {
      console.error('Failed to log access to backend');
    }

    return NextResponse.json({ 
      success: true, 
      ip: clientIp,
      message: 'Access logged successfully' 
    });

  } catch (error) {
    console.error('Error logging access:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to log access' },
      { status: 500 }
    );
  }
} 

// Sentry tunnel route handler
// This route proxies Sentry requests to avoid ad blockers
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const envelope = await request.text();
    const pieces = envelope.split('\n');
    const header = JSON.parse(pieces[0]);

    const dsn = header.dsn;
    if (!dsn) {
      return NextResponse.json({ error: 'Missing DSN in envelope header' }, { status: 400 });
    }

    // Extract the project ID from the DSN
    const dsnUrl = new URL(dsn);
    const projectId = dsnUrl.pathname.replace('/', '');
    
    // Forward to Sentry
    const sentryIngestUrl = `https://${dsnUrl.host}/api/${projectId}/envelope/`;
    
    const response = await fetch(sentryIngestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-sentry-envelope',
      },
      body: envelope,
    });

    if (!response.ok) {
      console.error('Sentry tunnel failed:', response.status, response.statusText);
      return NextResponse.json({ error: 'Tunnel request failed' }, { status: response.status });
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Sentry tunnel error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

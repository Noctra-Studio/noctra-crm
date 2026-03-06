import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Simple in-memory rate limiter (for single-instance deployments)
// For production with multiple instances, use Upstash Redis or Vercel KV
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function rateLimit(identifier: string, limit: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  // Clean up expired entries periodically
  if (rateLimitMap.size > 1000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetAt < now) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!record || record.resetAt < now) {
    // First request or window expired
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false; // Rate limit exceeded
  }

  record.count++;
  return true;
}

// Input validation schema
const AuditRequestSchema = z.object({
  url: z.string().url("Invalid URL format").min(1, "URL is required"),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limiting (5 requests per minute per IP)
    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';

    if (!rateLimit(ip, 5, 60000)) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again in a minute.",
          retryAfter: 60
        },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Validate input
    const validationResult = AuditRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: validationResult.error.errors.map(e => ({
            field: e.path.join("."),
            message: e.message,
          }))
        },
        { status: 400 }
      );
    }

    const { url } = validationResult.data;

    // Ensure URL has protocol
    const validatedUrl = url.startsWith("http") ? url : `https://${url}`;

    const encodedUrl = encodeURIComponent(validatedUrl);
    const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "PageSpeed API key not configured" },
        { status: 500 }
      );
    }

    // 1. Google PageSpeed Insights API
    const pageSpeedPromise = fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodedUrl}&key=${apiKey}&strategy=mobile&category=performance&category=seo&category=accessibility&category=best-practices`,
      { headers: { "Content-Type": "application/json" } }
    );

    const hostname = new URL(validatedUrl).hostname;

    // 2. Google Safe Browsing API
    const fetchSafeBrowsing = async () => {
      try {
        const response = await fetch(
          `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              client: { clientId: "noctra-audit", clientVersion: "1.0.0" },
              threatInfo: {
                threatTypes: ["MALWARE", "SOCIAL_ENGINEERING"],
                platformTypes: ["ANY_PLATFORM"],
                threatEntryTypes: ["URL"],
                threatEntries: [{ url: validatedUrl }],
              },
            }),
          }
        );

        if (!response.ok) return { isSafe: true, issues: [] }; // Fail open (safe) on API error

        const data = await response.json();
        const matches = data.matches || [];
        
        if (matches.length > 0) {
          return {
            isSafe: false,
            issues: matches.map((m: any) => `Detected threat: ${m.threatType}`),
          };
        }
        return { isSafe: true, issues: [] };
      } catch (error) {
        console.error("Safe Browsing Error:", error);
        return { isSafe: true, issues: [] }; // Fail open
      }
    };

    // 3. Mozilla Observatory API (Polling)
    const fetchMozillaObservatory = async () => {
      try {
        // Initial scan trigger
        let secRes = await fetch(
          `https://http-observatory.security.mozilla.org/api/v1/analyze?host=${hostname}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: "hidden=true&rescan=true",
          }
        );

        if (!secRes.ok) return { grade: "B", status: "error" }; // Default fallback

        let secData = await secRes.json();

        // Polling Loop (Max 5 attempts, 2s delay)
        let attempts = 0;
        while ((secData.state === "PENDING" || secData.state === "ABORTED" || secData.state === "STARTING") && attempts < 5) {
          await new Promise(r => setTimeout(r, 2000));
          secRes = await fetch(
            `https://http-observatory.security.mozilla.org/api/v1/analyze?host=${hostname}`,
            { method: "GET" }
          );
          if (secRes.ok) {
            secData = await secRes.json();
          }
          attempts++;
        }

        if (secData.state === "PENDING" || secData.state === "ABORTED" || secData.state === "STARTING") {
           return { grade: "Scanning...", score: 0, status: "pending" };
        }

        return { grade: secData.grade || "B", score: secData.score || 0, status: "finished" };

      } catch (error) {
        console.error("Mozilla Observatory Error:", error);
        return { grade: "B", status: "error" };
      }
    };

    // Execute all checks in parallel
    const [pageSpeedRes, safeBrowsingData, mozillaData] = await Promise.all([
      pageSpeedPromise,
      fetchSafeBrowsing(),
      fetchMozillaObservatory(),
    ]);

    // Process PageSpeed Data
    if (!pageSpeedRes.ok) {
        // ... (existing error handling)
      const errorText = await pageSpeedRes.text();
      if (pageSpeedRes.status === 400 || errorText.includes("FAILED_TO_FETCH")) {
        return NextResponse.json(
          { error: "Could not resolve host. Please check the URL and try again." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Failed to fetch PageSpeed data" },
        { status: pageSpeedRes.status }
      );
    }

    const data = await pageSpeedRes.json();
    const lighthouseResult = data.lighthouseResult;
    const categories = lighthouseResult?.categories;
    const audits = lighthouseResult?.audits;

    if (!categories || !audits) {
      return NextResponse.json(
        { error: "Invalid response from PageSpeed API" },
        { status: 500 }
      );
    }

    const performance = Math.round((categories.performance?.score ?? 0) * 100);
    const seo = Math.round((categories.seo?.score ?? 0) * 100);
    const accessibility = Math.round((categories.accessibility?.score ?? 0) * 100);
    const bestPractices = Math.round((categories["best-practices"]?.score ?? 0) * 100);
    const lcp = audits["largest-contentful-paint"]?.displayValue ?? "N/A";

    let issues = 0;
    Object.values(audits).forEach((audit: any) => {
      if (typeof audit.score === "number" && audit.score < 0.9 && audit.score !== null) {
        issues++;
      }
    });

    // Construct Unified Response
    const security = {
      grade: (mozillaData as any).grade,
      score: (mozillaData as any).score,
      status: (mozillaData as any).status,
      isSafe: (safeBrowsingData as any).isSafe,
      issues: (safeBrowsingData as any).issues,
    };

    return NextResponse.json({
      performance,
      seo,
      accessibility,
      bestPractices,
      lcp,
      issues,
      url: validatedUrl,
      security,
    });

  } catch (error: any) {
    console.error("Audit API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

# Redis-Based Rate Limiting with Upstash

## Why Upgrade from In-Memory to Redis Rate Limiting?

### Current Implementation (In-Memory)

Your current rate limiting in `/api/audit/run/route.ts` uses an in-memory `Map`:

```typescript
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
```

**This works fine for:**
- Single-instance deployments (local dev, single server)
- Low-traffic applications
- Development/testing environments

**Critical Limitations:**
1. **Not scalable across multiple instances** - Each Vercel serverless function has its own memory
2. **Lost on server restart** - Rate limit data disappears when function cold-starts
3. **No persistence** - Can't track abuse patterns over time
4. **Memory leaks** - Map grows indefinitely without proper cleanup

---

## Benefits of Redis (Upstash) Rate Limiting

### 1. **Multi-Instance Support** (Critical for Vercel)

Vercel automatically scales your app across multiple serverless functions. With in-memory rate limiting:

```
User Request 1 → Serverless Instance A (count: 1)
User Request 2 → Serverless Instance B (count: 1)  ❌ Different memory!
User Request 3 → Serverless Instance A (count: 2)
User Request 4 → Serverless Instance C (count: 1)  ❌ Different memory!
```

**Result:** User makes 4 requests but each instance sees fewer, bypassing the limit.

With Redis:
```
User Request 1 → Instance A → Redis (count: 1)
User Request 2 → Instance B → Redis (count: 2) ✅ Shared state!
User Request 3 → Instance A → Redis (count: 3) ✅ Shared state!
User Request 4 → Instance C → Redis (count: 4) ✅ Shared state!
```

**Result:** Rate limit enforced globally across all instances.

---

### 2. **Persistence & Reliability**

**In-Memory:**
- ❌ Cold starts reset counters (common in serverless)
- ❌ Deployments clear all rate limit data
- ❌ No historical tracking

**Redis:**
- ✅ Survives cold starts and deployments
- ✅ TTL-based automatic expiration (no manual cleanup)
- ✅ Can analyze abuse patterns over time
- ✅ 99.99% uptime (Upstash SLA)

---

### 3. **Advanced Features**

**Upstash Ratelimit** provides:

- **Sliding Window Algorithm** - More accurate than fixed windows
- **Token Bucket** - Burst handling for legitimate spikes
- **Analytics** - Track rate limit hits via Upstash dashboard
- **Multiple Limits** - Different limits per endpoint/user tier
- **Graceful Degradation** - Falls back if Redis is down

---

### 4. **Performance**

**Upstash Redis is optimized for serverless:**
- Edge-based (low latency, ~10-50ms)
- REST API (no persistent connections needed)
- Auto-scaling (handles traffic spikes)
- Pay-per-request (no idle costs)

**In-memory Map:**
- No network latency (faster per request)
- But limited to single instance

**Verdict:** Redis adds ~30-50ms latency but gains global consistency.

---

## Cost Analysis

### Upstash Pricing (2024)

**Free Tier:**
- 10,000 commands/day
- Perfect for small/medium sites

**Pay-as-you-go:**
- $0.20 per 100,000 commands
- Example: 1M requests/month = $2/month

**Your current traffic:**
Assuming 1,000 audit requests/month:
- Rate limit checks: 1,000 commands
- **Cost: $0** (within free tier)

---

## Implementation Guide

### Step 1: Install Dependencies

```bash
npm install @upstash/ratelimit @upstash/redis
```

### Step 2: Create Upstash Redis Database

1. Go to [https://console.upstash.com/](https://console.upstash.com/)
2. Sign up (free tier available)
3. Create a new Redis database
4. Choose a region close to your Vercel deployment (e.g., `us-east-1`)
5. Copy the REST API credentials

### Step 3: Add Environment Variables

Add to `.env.local` (and Vercel dashboard):

```env
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

### Step 4: Update Audit Endpoint

Replace the current implementation in `/api/audit/run/route.ts`:

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Create rate limiter
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests per minute
  analytics: true, // Enable analytics in Upstash dashboard
  prefix: 'noctra:audit', // Namespace your keys
});

export async function POST(req: NextRequest) {
  try {
    // Get identifier (IP address)
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';

    // Check rate limit
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          retryAfter: Math.floor((reset - Date.now()) / 1000), // seconds until reset
          limit: limit,
          remaining: 0,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': reset.toString(),
          }
        }
      );
    }

    // Add rate limit headers to successful responses too
    const response = NextResponse.json({ /* your response */ });
    response.headers.set('X-RateLimit-Limit', limit.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', reset.toString());

    return response;
  } catch (error) {
    // Handle errors
  }
}
```

### Step 5: Add to Other Endpoints

You can also protect:

**Chat endpoint** (`/api/chat/route.ts`):
```typescript
const chatRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 messages per minute
  prefix: 'noctra:chat',
});
```

**Contact form** (`/api/send/route.tsx`):
```typescript
const contactRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, '5 m'), // 3 submissions per 5 minutes
  prefix: 'noctra:contact',
});
```

---

## Advanced: Multi-Tier Rate Limiting

Implement different limits for authenticated vs anonymous users:

```typescript
// In your API route
const { data: { user } } = await supabase.auth.getUser();

const identifier = user?.id ?? ip; // Use user ID if authenticated
const isAuthenticated = !!user;

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: isAuthenticated
    ? Ratelimit.slidingWindow(20, '1 m') // Authenticated: 20/min
    : Ratelimit.slidingWindow(5, '1 m'),  // Anonymous: 5/min
  prefix: 'noctra:audit',
});

const { success } = await ratelimit.limit(identifier);
```

---

## Monitoring & Analytics

### Upstash Dashboard

Once enabled, you can view:
- Total rate limit hits
- Blocked requests over time
- Most active IPs
- Peak usage times

### Custom Logging

Add to your rate limit check:

```typescript
if (!success) {
  // Log to Sentry
  console.warn('Rate limit exceeded', {
    ip,
    endpoint: req.nextUrl.pathname,
    timestamp: new Date().toISOString(),
  });
}
```

---

## Migration Strategy

### Phase 1: Add Redis Alongside In-Memory (Recommended)

```typescript
// Keep both for monitoring
const inMemoryAllowed = rateLimit(ip, 5, 60000);
const { success: redisAllowed } = await ratelimit.limit(ip);

// Log discrepancies
if (inMemoryAllowed !== redisAllowed) {
  console.log('Rate limit mismatch detected');
}

// Use Redis result
if (!redisAllowed) {
  return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
}
```

### Phase 2: Remove In-Memory (After Testing)

Once confident Redis is working correctly, remove the Map-based implementation.

---

## Testing

### Local Testing

1. Set environment variables in `.env.local`
2. Make rapid requests to your endpoint:

```bash
# Install httpie or use curl
for i in {1..10}; do
  http POST http://localhost:3000/api/audit/run url="https://example.com"
  echo "Request $i"
  sleep 0.1
done
```

3. You should see 429 errors after the 5th request

### Production Testing

1. Deploy to Vercel with Upstash credentials
2. Test with multiple clients/IPs
3. Check Upstash dashboard for analytics

---

## Troubleshooting

### Issue: "UPSTASH_REDIS_REST_URL is not defined"

**Solution:** Ensure environment variables are set in:
1. `.env.local` (for local dev)
2. Vercel dashboard → Settings → Environment Variables (for production)

### Issue: Rate limits not working across deployments

**Solution:** This is expected with in-memory. Switch to Redis.

### Issue: Too many false positives (legitimate users blocked)

**Solution:** Adjust limits or use token bucket algorithm:

```typescript
limiter: Ratelimit.tokenBucket(5, '10s', 10) // 5 tokens/10s, max 10 tokens
```

---

## Security Considerations

### IP Spoofing

Users behind proxies/VPNs may share IPs. Consider:

```typescript
// Combine IP + User-Agent for better fingerprinting
const fingerprint = `${ip}:${req.headers.get('user-agent') ?? 'unknown'}`;
const { success } = await ratelimit.limit(fingerprint);
```

### DDoS Protection

For severe attacks, add:
- Cloudflare in front of Vercel (free tier includes DDoS protection)
- Vercel Firewall (paid feature)
- Block IPs at the edge before hitting your API

---

## Comparison Table

| Feature | In-Memory | Redis (Upstash) |
|---------|-----------|-----------------|
| Multi-instance support | ❌ | ✅ |
| Survives cold starts | ❌ | ✅ |
| Persistence | ❌ | ✅ |
| Analytics | ❌ | ✅ |
| Setup complexity | Easy | Medium |
| Cost | Free | Free tier available |
| Latency | ~0ms | ~30-50ms |
| Scalability | Poor | Excellent |
| Production-ready | ❌ No | ✅ Yes |

---

## Recommendation

**For your Noctra Studio app, I recommend:**

1. **Implement Redis rate limiting NOW** for `/api/audit/run` (public, expensive)
2. **Add to `/api/send`** (contact form spam protection)
3. **Monitor `/api/chat`** usage, add if needed

**Why?**
- You're on Vercel (multi-instance by default)
- Audit endpoint calls external APIs (costs money)
- Contact form is a spam target
- Free tier covers your current traffic

**Total setup time:** 15-20 minutes

---

## Next Steps

1. Create Upstash account: [https://console.upstash.com/](https://console.upstash.com/)
2. Run: `npm install @upstash/ratelimit @upstash/redis`
3. Add environment variables
4. Update `/api/audit/run/route.ts` with the code above
5. Test locally
6. Deploy and monitor

Let me know if you'd like me to implement this for you!

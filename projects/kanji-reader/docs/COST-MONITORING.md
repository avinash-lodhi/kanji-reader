# Cloud API Cost Monitoring Guide

This guide covers monitoring and managing costs for Google Cloud APIs used in KanjiReader.

## Free Tier Limits (Monthly)

| Service | Free Tier | After Free Tier |
|---------|-----------|-----------------|
| Cloud Translation | 500,000 characters | $20/million chars |
| Cloud Vision | 1,000 units | $1.50/1,000 units |
| Cloud TTS | 1,000,000 characters | $4-$16/million chars |

**Important:** Free tier limits reset on the first of each month.

## Checking Current Usage

### Via GCP Console (Recommended)

1. Go to [GCP APIs Dashboard](https://console.cloud.google.com/apis/dashboard)
2. Select your KanjiReader project
3. Click **Cloud Translation API**
4. View the **Requests** and **Traffic** graphs
5. Check the **Quotas** tab for character count

### Via Command Line

```bash
# List enabled APIs
gcloud services list --enabled --project=YOUR_PROJECT_ID

# Check billing account
gcloud beta billing accounts list
```

## Setting Up Billing Alerts

### Recommended Alert Thresholds

| Alert Level | Threshold | Action |
|-------------|-----------|--------|
| Info | 50% of free tier | Monitor usage |
| Warning | 80% of free tier | Review and optimize |
| Critical | 100% of free tier | Consider disabling |
| Budget Cap | $5/month | Automatic notification |

### Setup Steps

1. Go to **GCP Console → Billing → Budgets & Alerts**
2. Click **Create Budget**
3. Configure:
   - **Name:** `KanjiReader API Budget`
   - **Scope:** Select your KanjiReader project
   - **Budget amount:** $10/month (covers accidental overage)
   - **Alert thresholds:** 50%, 80%, 100%, 150%
4. **Notifications:**
   - Add your email address
   - Optionally configure Pub/Sub for automation
5. Click **Finish**

### Per-API Quotas

You can also set quota limits per API:

1. Go to **APIs & Services → Cloud Translation API → Quotas**
2. Edit the quota for "Characters per day"
3. Set a limit (e.g., 50,000 chars/day = 1.5M/month max)

## Estimated Usage Scenarios

| User Pattern | Chars/Day | Chars/Month | Monthly Cost |
|--------------|-----------|-------------|--------------|
| Casual (1-2 scans) | 500 | 15,000 | FREE |
| Regular (5-10 scans) | 2,000 | 60,000 | FREE |
| Heavy (20+ scans) | 10,000 | 300,000 | FREE |
| Power user | 25,000 | 750,000 | ~$5 |
| Dev testing spike | 50,000 | N/A | Monitor closely |

**Note:** KanjiReader's two-level caching significantly reduces API calls:
- Repeated phrases hit L1/L2 cache
- Estimated 60-80% cache hit rate after initial use

## Cache Statistics

Check cache performance in app logs:

```typescript
const stats = translationService.getCacheStats();
console.log('Cache stats:', stats);
// { l1Hits: 120, l1Misses: 30, l2Hits: 20, l2Misses: 10 }
```

**Hit rate calculation:**
```
Hit Rate = (l1Hits + l2Hits) / (l1Hits + l1Misses + l2Hits + l2Misses)
```

## Cost Reduction Strategies

### 1. Optimize Caching
- Increase L2 cache TTL if translations don't change often
- Increase L1 cache size for heavy sessions

### 2. Selective Translation
- Only translate full sentences (already implemented)
- Fallback to dictionary meanings for individual words
- Skip translation for very short texts

### 3. Debouncing
- Don't translate while user is still typing (if applicable)
- Wait for stable text before API call

### 4. Text Limits
- Consider truncating very long texts (>1000 chars)
- Alert user if input exceeds recommended length

## Emergency: Disable Translation API

If costs spike unexpectedly, you can disable the API:

### Quick Disable (GCP Console)

1. Go to **APIs & Services → Cloud Translation API**
2. Click **Disable API**
3. Confirm

The app will gracefully degrade:
- Cached translations still work
- New translations show "Translation unavailable"
- No crash, just reduced functionality

### Re-enable

1. Same page → Click **Enable API**
2. Wait 1-2 minutes for propagation
3. App automatically recovers

## Monthly Monitoring Checklist

Use this checklist at the start of each month:

- [ ] Check API usage in GCP Console
- [ ] Review any billing alerts received
- [ ] Check cache hit rate in app logs
- [ ] Verify budget alerts are still active
- [ ] Review and adjust quotas if needed
- [ ] Test translation still works (API enabled)

## Useful Links

- [GCP APIs Dashboard](https://console.cloud.google.com/apis/dashboard)
- [Billing Console](https://console.cloud.google.com/billing)
- [Cloud Translation Pricing](https://cloud.google.com/translate/pricing)
- [Cloud Vision Pricing](https://cloud.google.com/vision/pricing)
- [Quotas & Limits](https://console.cloud.google.com/apis/api/translate.googleapis.com/quotas)

## Support

If you encounter unexpected charges:
1. Check the billing export for details
2. Review API logs for unusual patterns
3. Contact [GCP Support](https://cloud.google.com/support) if needed

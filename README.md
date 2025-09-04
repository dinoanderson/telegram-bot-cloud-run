# Telegram Bot for Google Cloud Run

This is a production-ready version of the Telegram bot optimized for Google Cloud Run deployment with webhook support and Firestore database.

## 🚀 Features

- **Webhook-based** architecture (no polling)
- **Firestore** database integration
- **Multi-language support** (English/Chinese) with AI translations
- **Auto-scaling** with Cloud Run
- **HTTPS** endpoints with valid SSL certificates
- **Containerized** deployment with Docker

## 📋 Prerequisites

1. **Google Cloud Project** with billing enabled
2. **Telegram Bot Token** from @BotFather
3. **OpenRouter API Key** (for translations)
4. **Google Cloud SDK** installed locally

### Required Google Cloud APIs

Enable these APIs in your Google Cloud Console:
```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

## 📂 Project Structure

```
telegram-bot-cloud-run/
├── server.js                 # Express server with webhook handling
├── database.js               # Firestore database adapter
├── config.js                 # Configuration management
├── keyboards.js              # Telegram keyboard layouts
├── languages.js              # Multi-language support
├── chinese-translator.js     # AI translation service
├── handlers/                 # Message and callback handlers
│   ├── menu.js
│   ├── products.js
│   └── cart.js
├── scripts/                  # Utility scripts
│   ├── set-webhook.js        # Configure Telegram webhook
│   ├── delete-webhook.js     # Remove Telegram webhook
│   └── migrate-data.js       # Migrate SQLite to Firestore
├── Dockerfile               # Container configuration
├── cloudbuild.yaml          # Cloud Build configuration
├── package.json             # Dependencies
├── .env.example            # Environment variables template
├── .gcloudignore           # Files to ignore in deployment
└── README.md               # This file
```

## 🔧 Setup Instructions

### 1. Environment Configuration

Create `.env` file from template:
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
GOOGLE_CLOUD_PROJECT_ID=your-project-id
OPENROUTER_API_KEY=your_openrouter_key
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Initialize Firestore

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to Firestore
3. Create database in Native mode
4. Choose a location close to your users

### 4. Migrate Data (Optional)

If you have existing SQLite data:
```bash
# Make sure GOOGLE_CLOUD_PROJECT_ID is set in .env
node scripts/migrate-data.js
```

### 5. Deploy to Cloud Run

#### Option A: Using gcloud CLI
```bash
# Deploy directly from source
gcloud run deploy telegram-bot \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production"
```

#### Option B: Using Cloud Build
```bash
# Submit build to Cloud Build
gcloud builds submit --config cloudbuild.yaml
```

### 6. Configure Webhook

After deployment, you'll get a Cloud Run URL like:
`https://telegram-bot-abc123-uc.a.run.app`

Set up the webhook:
```bash
# Update WEBHOOK_URL in .env with your Cloud Run URL
WEBHOOK_URL=https://telegram-bot-abc123-uc.a.run.app
npm run set-webhook
```

## 🔒 Security Configuration

### Environment Variables in Cloud Run

Set sensitive environment variables:
```bash
gcloud run services update telegram-bot \
  --set-env-vars="TELEGRAM_BOT_TOKEN=your_token" \
  --set-env-vars="OPENROUTER_API_KEY=your_key" \
  --set-env-vars="GOOGLE_CLOUD_PROJECT_ID=your_project"
```

### Using Secret Manager (Recommended)

1. Create secrets:
```bash
echo "your_telegram_token" | gcloud secrets create telegram-bot-token --data-file=-
echo "your_openrouter_key" | gcloud secrets create openrouter-api-key --data-file=-
```

2. Update Cloud Run service:
```bash
gcloud run services update telegram-bot \
  --set-secrets="/secrets/telegram-token=telegram-bot-token:latest" \
  --set-secrets="/secrets/openrouter-key=openrouter-api-key:latest"
```

## 📊 Monitoring & Logging

### View Logs
```bash
gcloud run services logs read telegram-bot --region us-central1
```

### Monitor Performance
- Go to Cloud Console → Cloud Run → telegram-bot
- View metrics, logs, and scaling behavior
- Set up alerts for errors or high latency

## 🛠️ Development & Testing

### Local Development
```bash
# Install dependencies
npm install

# Start development server (uses polling mode locally)
npm run dev
```

### Test Webhook Locally
```bash
# Use ngrok to expose local server
ngrok http 8080

# Set webhook to ngrok URL
WEBHOOK_URL=https://abc123.ngrok.io npm run set-webhook
```

## 🚀 Deployment Commands

### Quick Deploy
```bash
gcloud run deploy telegram-bot --source .
```

### Update Environment Variables
```bash
gcloud run services update telegram-bot \
  --set-env-vars="KEY=value"
```

### Scale Configuration
```bash
gcloud run services update telegram-bot \
  --min-instances=0 \
  --max-instances=10 \
  --concurrency=80
```

## 🔍 Troubleshooting

### Common Issues

1. **Webhook not receiving updates**
   - Check webhook URL is correct and accessible
   - Verify SSL certificate is valid
   - Run: `npm run set-webhook` to reconfigure

2. **Database connection errors**
   - Ensure Firestore is enabled in Google Cloud
   - Check service account permissions
   - Verify GOOGLE_CLOUD_PROJECT_ID is correct

3. **Translation not working**
   - Check OPENROUTER_API_KEY is valid
   - Ensure API has sufficient quota

### Debug Endpoints

- Health check: `GET https://your-url.run.app/`
- Bot info: `GET https://your-url.run.app/bot-info`

### Useful Commands

```bash
# Check current webhook status
curl "https://api.telegram.org/bot$BOT_TOKEN/getWebhookInfo"

# Delete webhook (for debugging)
npm run delete-webhook

# View Cloud Run service details
gcloud run services describe telegram-bot --region us-central1
```

## 💰 Cost Optimization

### Free Tier Usage
Cloud Run free tier includes:
- 2 million requests/month
- 360,000 GB-seconds memory
- 180,000 vCPU-seconds

### Cost Reduction Tips
- Set `--min-instances=0` for zero cost when idle
- Use `--memory=512Mi` for smaller memory footprint
- Monitor usage in Cloud Console

## 📈 Scaling

Cloud Run automatically scales based on:
- Incoming requests
- CPU utilization
- Memory usage

Configure scaling:
```bash
gcloud run services update telegram-bot \
  --min-instances=1 \
  --max-instances=100 \
  --concurrency=1000
```

## 🔄 CI/CD

### Cloud Build Trigger

1. Connect GitHub repository
2. Create trigger with `cloudbuild.yaml`
3. Auto-deploy on code push

### GitHub Actions
```yaml
name: Deploy to Cloud Run
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: google-github-actions/setup-gcloud@v0
    - run: gcloud run deploy telegram-bot --source .
```

## 🆘 Support

For issues and questions:
1. Check Cloud Run logs
2. Verify webhook configuration
3. Test database connectivity
4. Check environment variables

## 📝 License

MIT License - see original bot implementation for details.
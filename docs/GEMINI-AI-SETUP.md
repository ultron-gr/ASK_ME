# Gemini AI Integration Guide

## What's New?

Your ASK DSU chatbot now has **AI-powered responses** using Google's Gemini AI! 🤖

When users ask questions that don't match specific intents (classrooms, library, faculty), the chatbot will use Gemini AI to provide intelligent, contextual responses about campus life.

---

## How It Works

**Before AI:**
- User: "What's the food like in the cafeteria?"
- Bot: "I help with campus stuff: free classrooms, library status, and faculty locations."

**After AI:**
- User: "What's the food like in the cafeteria?"
- Bot: 🤖 "The cafeteria at DSU offers a variety of food options including Indian, Chinese, and continental dishes. Many students enjoy the South Indian breakfast and the chaat corner. Prices are student-friendly!"

---

## Features

✅ **Fallback AI Responses** - When the bot doesn't recognize a specific intent, it uses AI
✅ **Campus Context** - AI is trained with DSU campus knowledge
✅ **Gen-Z Personality** - Responses are friendly and conversational
✅ **Free Tier** - Uses Google's free Gemini API
✅ **Graceful Degradation** - If AI is not configured, bot still works normally

---

## Setup Instructions

### Step 1: Get Your Free Gemini API Key

1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy your API key (looks like: `AIzaSy...`)

**Note:** Gemini offers a generous free tier:
- 60 requests per minute
- 1,500 requests per day
- Perfect for testing and development!

### Step 2: Add API Key to Backend

1. Open `backend/.env` file
2. Add your API key:

```env
# Google Gemini AI Configuration
GEMINI_API_KEY=*****************
```

3. Save the file

### Step 3: Restart Backend Server

```bash
cd backend
npm start
```

You should see:
```
✓ Gemini AI initialized successfully
✓ Server running on http://localhost:3000
```

### Step 4: Test AI Responses

1. Open your chatbot: http://localhost:8000
2. Login to your account
3. Try these questions:
   - "What should I study for exams?"
   - "Tell me about campus events"
   - "What's the best way to make friends?"
   - "How do I join clubs?"

The bot will use AI to answer! 🎉

---

## AI Behavior

### When AI is Used

AI responses are triggered when users ask:
- General campus questions
- Academic advice
- Campus life questions
- Questions not matching specific intents

### When AI is NOT Used

The bot uses direct database queries for:
- ✅ Free classroom queries
- ✅ Library status queries
- ✅ Faculty location queries

These are **always faster and more accurate** than AI!

---

## Customizing AI Personality

Want to change how the AI responds? Edit `backend/geminiAI.js`:

```javascript
const CAMPUS_CONTEXT = `
You are ASK DSU, a friendly Gen-Z campus assistant chatbot...

// Modify this section to change personality
// Add more campus-specific knowledge
// Adjust response style
`;
```

**Examples of customization:**
- Add specific DSU events
- Include campus policies
- Add department information
- Adjust tone (more formal/casual)

---

## Cost & Limits

### Free Tier Limits

- **60 requests/minute** - More than enough for testing
- **1,500 requests/day** - ~20 users asking 75 questions each
- **No credit card required**

### What Happens When Limits Are Reached?

If you exceed the free tier:
- AI responses will gracefully fail
- Bot will show: "I help with campus stuff: free classrooms, library status..."
- Users can still use all core features

---

## Troubleshooting

### "AI is not configured"

**Cause:** API key is missing or invalid

**Solution:**
1. Check `backend/.env` has `GEMINI_API_KEY=...`
2. Verify API key is correct (no extra spaces)
3. Restart backend server

### "API_KEY_INVALID" Error

**Cause:** API key is incorrect

**Solution:**
1. Go to https://makersuite.google.com/app/apikey
2. Generate a new API key
3. Update `.env` file
4. Restart server

### "quota exceeded" Error

**Cause:** You've hit the free tier limits

**Solution:**
- Wait 1 minute (for per-minute limit)
- Wait until next day (for daily limit)
- Or upgrade to paid tier if needed

### AI Responses Too Slow

**Normal Behavior:** AI responses take 1-3 seconds (slower than database queries)

**If Too Slow (>5 seconds):**
- Check your internet connection
- Try during off-peak hours
- Database queries (classrooms, library, faculty) remain instant!

---

## Testing Without AI

Want to test without setting up AI?

**Just don't add the API key!**

The chatbot will work perfectly without AI:
- Classroom queries ✅
- Library queries ✅
- Faculty queries ✅
- Unknown queries → default message

---

## Best Practices

### 1. Use AI Sparingly
- Let database handle specific queries
- Use AI for general questions only
- This keeps responses fast and accurate

### 2. Monitor Usage
- Check API usage at: https://console.cloud.google.com
- Stay within free tier limits
- Upgrade if needed for production

### 3. Cache Common Questions
- For production, cache frequent AI responses
- Reduces API calls
- Faster response times

### 4. Fallback Gracefully
- Always have a default response
- Don't break if AI fails
- Code already handles this!

---

## Advanced Configuration

### Change AI Model

Want to use a different model? Edit `backend/geminiAI.js`:

```javascript
// Default (recommended)
model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// For longer responses (if available)
model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
```

### Add Safety Settings

Filter inappropriate content:

```javascript
const generationConfig = {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 200,
};

const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
];

const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig,
    safetySettings,
});
```

### Response Length Control

Limit response length in `CAMPUS_CONTEXT`:

```javascript
Important:
- Keep responses under 100 words  // Change this number
- Be concise and to the point
```

---

## Security Notes

🔒 **API Key Security:**
- Never commit `.env` to Git
- `.env` is already in `.gitignore`
- Only use on your backend (never in frontend!)
- Rotate keys periodically

🔒 **Rate Limiting:**
- Consider adding rate limiting to prevent abuse
- Use express-rate-limit for production
- Prevents API quota exhaustion

---

## Production Deployment

When deploying to production:

1. **Environment Variables:**
   - Add `GEMINI_API_KEY` to your hosting provider
   - Vercel: Settings → Environment Variables
   - Heroku: Settings → Config Vars

2. **Monitoring:**
   - Set up error logging (Sentry, LogRocket)
   - Monitor API usage
   - Set up alerts for quota warnings

3. **Caching:**
   - Implement Redis caching for common queries
   - Reduces API costs
   - Faster responses

---

## FAQ

**Q: Is Gemini AI free?**
A: Yes! Free tier includes 1,500 requests/day.

**Q: Do I need a credit card?**
A: No! Free tier has no credit card requirement.

**Q: Will the bot break without AI?**
A: No! All core features work without AI.

**Q: How fast are AI responses?**
A: 1-3 seconds typically. Database queries remain instant.

**Q: Can I use ChatGPT instead?**
A: Yes! Modify `geminiAI.js` to use OpenAI API instead.

**Q: Should I use AI for everything?**
A: No! Use database for specific data (classrooms, library, faculty). Use AI for general questions only.

---

## Example Queries for Testing

### Good AI Queries (General Questions)
- "What should I bring to campus?"
- "How do I prepare for exams?"
- "Tell me about campus life at DSU"
- "What clubs can I join?"
- "How do I make friends?"

### Bad AI Queries (Use Database Instead)
- "Where is Dr. Sharma?" → Uses faculty database
- "Show me free classrooms" → Uses classroom database
- "Library status?" → Uses library database

---

## Support

**Getting Help:**
- Gemini Docs: https://ai.google.dev/docs
- API Issues: https://console.cloud.google.com
- ASK DSU Issues: Check `docs/TROUBLESHOOTING.md`

**Community:**
- Google AI Forum: https://discuss.ai.google.dev
- Stack Overflow: Tag `google-gemini`

---

## What's Next?

Optional enhancements:
1. Add conversation memory (remember context)
2. Add voice input/output
3. Implement caching for common questions
4. Add admin panel to see AI usage
5. Fine-tune responses with user feedback
6. Add image understanding (gemini-pro-vision)

---

## Summary

✅ **Easy Setup** - Just add API key and restart
✅ **Free to Use** - Generous free tier
✅ **Graceful Fallback** - Works without AI too
✅ **Campus Context** - AI knows about DSU
✅ **Production Ready** - Built with error handling

**Enjoy your AI-powered campus assistant!** 🎓🤖

# AI Email Parser Setup Guide

This guide will help you set up the AI email parser features using Google's Gemini AI.

## Prerequisites

1. A Google account
2. Access to Google AI Studio

## Step 1: Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key (you'll need this for the next step)

## Step 2: Configure Environment Variables

1. Create a `.env` file in your project root (if it doesn't exist)
2. Add the following variables to your `.env` file:

```env
# Supabase Configuration (required)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google Gemini AI Configuration (for AI Email Parser)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

3. Replace `your_gemini_api_key_here` with the API key you copied from Google AI Studio

## Step 3: Restart Your Application

After adding the API key to your `.env` file, restart your development server:

```bash
npm run dev
```

## Step 4: Test the AI Parsers

### Initial Email Parser
1. Open your application
2. Click "Add New Placement"
3. Click "Use AI Email Parser"
4. Paste a sample email content
5. Click "Extract with AI"

### Follow-Up Email Parser
1. Open your application
2. Click "Follow-Up Parser" button
3. Select an existing placement to update
4. Paste the follow-up email content
5. Click "Extract & Update"

## How It Works

### Initial Email Parser
The AI email parser:

1. **Receives Email Content**: You paste the complete email content
2. **AI Analysis**: Gemini AI analyzes the text and extracts key placement details
3. **Data Extraction**: Extracts company name, role, CTC, location, eligibility, deadlines, links, tests, and interviews
4. **User Verification**: You can review and edit the extracted data
5. **Form Import**: The verified data is imported into the placement form

### Follow-Up Email Parser
The follow-up email parser:

1. **Select Placement**: Choose an existing placement to update
2. **Receive Follow-Up Email**: Paste the follow-up email content
3. **AI Analysis**: Gemini AI extracts new information (tests, interviews, results, status updates)
4. **Data Extraction**: Extracts only NEW information that updates the existing placement
5. **User Verification**: Review and edit the extracted updates
6. **Database Update**: Directly updates the existing placement record

## What the AI Extracts

### Initial Email Parser
- Company name
- Job role/position
- CTC (Cost to Company)
- Job location
- Eligibility criteria
- Registration deadline (date and time)
- Registration link
- Test details (up to 5 rounds)
- Interview details (up to 3 rounds)

### Follow-Up Email Parser
- New test schedules and details
- New interview schedules and types
- Test results (Passed, Failed, Waitlisted)
- Interview results (Selected, Rejected, Waitlisted)
- Status updates (Applied → In Progress → Selected/Rejected)
- Any additional information mentioned in follow-up emails

## Example Email Content

### Initial Placement Email
```
Subject: Google Placement Drive - Registration Open

Dear Students,

Google is conducting a placement drive for Software Engineer positions.

Position: Software Engineer
CTC: 18 LPA
Location: Bangalore/Hyderabad
Eligibility: B.Tech CSE/IT, 7+ CGPA

Registration Deadline: December 31, 2024 at 11:59 PM
Register at: https://careers.google.com/placement

Selection Process:
1. Online Coding Test - January 5, 2025 at 10:00 AM
2. Technical Interview - January 10, 2025 at 2:00 PM
3. HR Interview - January 15, 2025 at 11:00 AM

Best regards,
Placement Cell
```

### Follow-Up Email
```
Subject: Google Placement - Test Results & Next Round

Dear Candidate,

Congratulations! You have successfully cleared the Online Coding Test.

Test Result: PASSED
Score: 85/100

Next Round: Technical Interview
Date: January 10, 2025
Time: 2:00 PM
Duration: 45 minutes
Platform: Google Meet

Please join the interview 10 minutes before the scheduled time.

Best regards,
Google Recruitment Team
```

## Troubleshooting

### "Gemini API key not configured" Error
- Make sure you've added `VITE_GEMINI_API_KEY` to your `.env` file
- Restart your development server after adding the key
- Check that the API key is valid and active

### "Failed to extract data from email" Error
- Ensure the email content is complete and readable
- Try with a different email format
- Check your internet connection

### API Quota Issues
- Google AI Studio provides free credits for testing
- Monitor your usage in the Google AI Studio dashboard
- Consider upgrading if you need more API calls

## Security Notes

- Never commit your `.env` file to version control
- Keep your API keys secure and private
- The API key is only used client-side for AI processing
- No email content is stored permanently

## Cost Information

- Google AI Studio provides free credits for new users
- Check [Google AI Studio pricing](https://ai.google.dev/pricing) for current rates
- Monitor your usage to avoid unexpected charges 
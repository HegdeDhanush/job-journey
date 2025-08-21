# Job Journey Log

A comprehensive application to track your placement journey with AI-powered email parsing capabilities.

## Features

- **AI Email Parser**: Use Gemini AI to automatically extract placement details from email content
- **Manual Entry**: Traditional form-based placement tracking
- **Real-time Updates**: Track your application status, tests, and interviews
- **User Authentication**: Secure login with Supabase
- **Responsive Design**: Works on desktop and mobile devices

## Database Setup

### Required Database Updates

After setting up your Supabase project, you need to run the database migrations to support all features:

1. **Run the database update script** in your Supabase SQL editor:

```sql
-- Copy and paste the contents of database_update.sql into your Supabase SQL editor
-- This will add all required columns and update constraints for the new "Not Eligible" status
```

2. **Verify the update** by checking that the `placements` table has:
   - All test and interview date/time columns
   - `registration_deadline_time` column
   - Updated status check constraint that includes "Not Eligible"

### Database Schema

The application requires the following columns in the `placements` table:

- Basic fields: `company_name`, `role`, `ctc`, `location`, `eligibility`
- Registration: `registration_deadline`, `registration_deadline_time`, `registration_link`
- Status: `status` (with constraint allowing "Not Eligible")
- Eligibility: `are_you_eligible`
- Tests: `test_1` through `test_5` with corresponding `_date` and `_time` fields
- Interviews: `interview_1` through `interview_3` with corresponding `_date` and `_time` fields
- Results: `result_1` through `result_5` and `interview_result_1` through `interview_result_3`

## AI Email Parser

The application now includes an AI-powered email parser that can automatically extract placement details from email content using Google's Gemini AI. Here's how it works:

1. **Paste Email Content**: Copy and paste the complete email content into the AI parser
2. **AI Extraction**: Gemini AI analyzes the email and extracts key placement details
3. **Review & Edit**: Verify and edit the extracted information before proceeding
4. **Import to Form**: The extracted data is automatically imported into the placement form

### Setting up Gemini AI

To use the AI email parser feature, you need to configure the Gemini API key:

1. **Get API Key**: 
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key for Gemini

2. **Configure Environment**:
   - Add the API key to your `.env` file:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Restart Application**: Restart your development server after adding the API key

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd job-journey-log
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## Usage

### Adding a New Placement

1. **Manual Entry**: Fill out the placement form manually with all required details
2. **AI-Powered Entry**: 
   - Click "Use AI Email Parser" button
   - Paste the complete email content
   - Let AI extract the details
   - Review and verify the extracted information
   - Complete any remaining details in the form

### Tracking Progress

- Update test results and interview outcomes
- Track application status (Applied, In Progress, Selected, Rejected, Withdrawn)
- Add notes and additional information

## Technologies Used

- React 18 with TypeScript
- Vite for build tooling
- Supabase for backend and authentication
- Google Gemini AI for email parsing
- Tailwind CSS for styling
- Shadcn/ui for UI components
- React Router for navigation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

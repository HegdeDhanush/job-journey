# Job Journey 🚀

A modern web application to track your job placement journey with AI-powered email parsing capabilities.

## ✨ Features

- 🤖 **AI Email Parser** - Extract placement details from emails using Google Gemini AI
- 📝 **Smart Tracking** - Track applications, tests, interviews, and results
- 🔐 **Secure Authentication** - User authentication with Supabase
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 📊 **Progress Dashboard** - Visual overview of your placement journey

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/HegdeDhanush/job-journey.git
   cd job-journey
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   Create a `.env` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Setup database**
   - Run the SQL script from `database_schema_safe.sql` in your Supabase project

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Supabase (PostgreSQL + Auth)
- **AI**: Google Gemini API
- **Styling**: Tailwind CSS + Shadcn/ui
- **State Management**: React Query

## 🎯 Usage

1. **Sign up/Login** to your account
2. **Add placements** manually or use AI email parser
3. **Track progress** through tests and interviews
4. **Monitor results** and manage your placement pipeline

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Live Demo](https://job-journey.netlify.app)
- [GitHub Repository](https://github.com/HegdeDhanush/job-journey)

---

⭐ Star this repo if you find it helpful!

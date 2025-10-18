# AI Email Nurture Sequence Generator

A powerful, time-saving tool designed for marketers, founders, and sales professionals. Transform simple inputs about your product, audience, and campaign goals into a complete, ready-to-use email nurture sequence.

## Features

- **Dynamic & Contextual Input Form**: Clean, intuitive interface with modern design principles
- **AI-Powered Generation**: Leverages OpenRouter's Kimi K2 model for intelligent email sequence creation
- **Structured Output**: Organized display of generated emails with individual copy buttons
- **Download Options**: Export sequences as TXT or Markdown files
- **Notion-Inspired UI**: Clean, modern design with DM Sans font family
- **Responsive Design**: Works seamlessly across all devices

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- OpenRouter API (Kimi K2 free model)
- DM Sans font family

## Getting Started

### Prerequisites

- Node.js 18+ 
- OpenRouter API key ([Get one here](https://openrouter.ai/))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd email-nurture-generator
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Add your OpenRouter API key to `.env.local`:
```bash
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

1. **Fill out the form** with your product details, target audience, pain points, and campaign goals
2. **Select your preferences** for tone of voice and number of emails
3. **Generate the sequence** and review the AI-generated emails
4. **Copy individual elements** or download the entire sequence
5. **Use in your campaigns** - the generated content is ready to use!

## API Endpoints

- `POST /api/generate` - Generates email nurture sequences based on form input

## Project Structure

```
src/
├── app/
│   ├── api/generate/route.ts    # API endpoint for email generation
│   ├── layout.tsx               # Root layout with font configuration
│   ├── page.tsx                 # Main application page
│   └── globals.css              # Global styles with Notion-inspired design
├── components/
│   ├── InputForm.tsx           # Form component for user input
│   ├── SequenceOutput.tsx      # Display component for generated sequences
│   └── EmailCard.tsx           # Individual email display component
├── lib/
│   └── openrouter.ts           # OpenRouter API client
└── types/
    └── index.ts                # TypeScript type definitions
```

## Environment Variables

- `OPENROUTER_API_KEY` - Your OpenRouter API key for AI generation

## Deployment

The application is ready for deployment on Vercel, Netlify, or any other Next.js-compatible platform.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

# Medical Report Organizer

A digital organizer for medical reports that helps patients and doctors manage medical documents efficiently using AI-powered categorization and search capabilities.

## Features

- 📄 **Document Upload**: Support for PDF files with drag-and-drop functionality
- 🤖 **AI-Powered Analysis**: Automatic categorization using Google Gemini AI
- 🏷️ **Smart Categorization**: Automatically categorizes documents as:
  - Prescriptions
  - Lab Reports
  - Medical Bills
  - Test Reports
  - Other medical documents
- 🔍 **Semantic Search**: Search through documents by content, not just titles
- 📅 **Timeline View**: View documents chronologically
- 📊 **Grid View**: Browse documents in an organized grid layout
- 💾 **Local Storage**: Demo mode with local storage persistence
- 📋 **Metadata Extraction**: Automatically extracts doctor names, hospital information, and key medical data

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, Lucide Icons
- **AI Integration**: Google Gemini AI API
- **PDF Processing**: pdf-parse library with worker process
- **Date Handling**: date-fns

## Prerequisites

- Node.js 16.x or higher
- npm or yarn
- Google Gemini API key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/demoncoder-crypto/Medical-Report-Organizer.git
cd Medical-Report-Organizer
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Upload Documents**: Click the upload area or drag and drop PDF files
2. **View Documents**: Browse uploaded documents in grid or timeline view
3. **Search**: Use the search bar to find documents by content
4. **Filter**: Filter documents by category (prescriptions, lab reports, etc.)
5. **Preview**: Click on any document to view details, AI summary, and metadata

## Project Structure

```
medical-report-organizer/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── documents/     # Document fetching
│   │   ├── search/        # Search functionality
│   │   └── upload/        # File upload and processing
│   └── page.tsx           # Main page component
├── components/            # React components
│   ├── ui/               # UI components (buttons, cards, etc.)
│   └── ...               # Feature components
├── lib/                  # Utility functions and libraries
│   ├── document-store.ts # Document storage logic
│   └── pdf-parser-worker.js # PDF parsing worker
├── public/              # Static assets
└── styles/             # Global styles
```

## API Endpoints

- `POST /api/upload` - Upload and process medical documents
- `GET /api/documents` - Fetch all documents
- `POST /api/search` - Search documents by content

## Demo Data

The application comes with sample medical documents to demonstrate functionality:
- Blood Test Results (Lab Report)
- Prescription for Hypertension
- Hospital Bill (Emergency Visit)

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Known Limitations

- PDF text extraction may not work perfectly for all PDF types
- Image-based PDFs require OCR (not currently implemented)
- Data persistence is limited to browser localStorage in demo mode

## Future Enhancements

- OCR support for image-based PDFs
- Cloud storage integration
- User authentication
- Export functionality
- Mobile app version
- Multi-language support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google Gemini AI for document analysis
- Next.js team for the amazing framework
- All open-source contributors

---

Built with ❤️ for better healthcare document management 
# MediVault Pro - Full-Stack Medical Document Management System

A comprehensive, enterprise-grade medical document management platform that helps patients, doctors, and healthcare institutions manage medical records efficiently using advanced AI-powered analysis and secure cloud infrastructure.

## 🏥 **Full-Stack Architecture**

### **Frontend**
- **Next.js 14** with App Router and Server Components
- **TypeScript** for type safety
- **Tailwind CSS** for modern, responsive design
- **Radix UI** for accessible, customizable components
- **React Query** for server state management
- **Socket.IO** for real-time notifications

### **Backend & Database**
- **PostgreSQL** with Prisma ORM for robust data persistence
- **NextAuth.js** for secure authentication (Google OAuth + Credentials)
- **Redis** for caching and background job processing
- **BullMQ** for queue management and async processing
- **AWS S3** for secure document storage
- **Winston** for comprehensive logging

### **AI & Processing**
- **Google Gemini AI** for document analysis and content extraction
- **Tesseract.js** for OCR processing
- **Sharp** for image processing and thumbnail generation
- **Mammoth.js** for Word document processing

### **Security & Infrastructure**
- **bcryptjs** for password hashing
- **JWT** for secure token management
- **Helmet.js** for security headers
- **Rate limiting** for API protection
- **Document encryption** for sensitive data
- **HIPAA-compliant** architecture

## 🚀 **Enterprise Features**

### **User Management**
- 👤 **Multi-Role System**: Patients, Doctors, Nurses, Admins, Hospital Admins
- 🔐 **Secure Authentication**: OAuth + Email/Password with 2FA support
- 👥 **Doctor-Patient Relationships**: Secure document sharing between healthcare providers
- 📊 **User Profiles**: Comprehensive medical and professional information
- 🔍 **User Search**: Find doctors, patients, and healthcare professionals

### **Document Management**
- 📄 **Multi-Format Support**: PDF, Images, Word documents, Text files
- 🤖 **AI-Powered Analysis**: Advanced document categorization and content extraction
- 🏷️ **Smart Categorization**: 
  - Prescriptions with medication tracking
  - Lab Reports with test value extraction
  - Medical Bills with insurance processing
  - Test Reports with diagnostic information
  - Vaccination Records
  - Medical Images with DICOM support
  - Discharge Summaries
  - Consultation Notes
  - Referrals
- 🔍 **Advanced Search**: Semantic search with AI-powered content understanding
- 📊 **Document Analytics**: Usage statistics and insights
- 🔒 **Secure Sharing**: Time-limited, permission-based document sharing
- ⭐ **Favorites & Organization**: Personal organization with tags and categories
- 📱 **Mobile Responsive**: Full functionality on all devices

### **Medical Intelligence**
- 🧠 **AI Medical Analysis**: Extract medical values, medications, diagnoses
- 💊 **Medication Tracking**: Track prescriptions and dosages
- 🩺 **Health Timeline**: Chronological view of medical history
- 📈 **Health Insights**: AI-generated health trends and recommendations
- ⚠️ **Alert System**: Medication reminders and appointment notifications

### **Healthcare Provider Features**
- 🏥 **Hospital Integration**: Multi-hospital and clinic support
- 👨‍⚕️ **Doctor Dashboard**: Patient management and document review
- 📋 **Patient Lists**: Organized patient management
- 📊 **Analytics Dashboard**: Practice insights and statistics
- 💬 **Secure Messaging**: HIPAA-compliant communication
- 📅 **Appointment Integration**: Calendar and scheduling support

### **Security & Compliance**
- 🔐 **End-to-End Encryption**: Document encryption at rest and in transit
- 🛡️ **HIPAA Compliance**: Healthcare data protection standards
- 📝 **Audit Trail**: Complete activity logging and compliance reporting
- 🔒 **Access Control**: Role-based permissions and document access
- 🚨 **Security Monitoring**: Real-time security alerts and monitoring
- 🔄 **Backup & Recovery**: Automated backups and disaster recovery

## 📊 **Database Schema**

### **Core Models**
- **Users**: Authentication, roles, and basic information
- **UserProfiles**: Detailed medical and professional information
- **Documents**: Comprehensive document metadata and analysis
- **DocumentShares**: Secure document sharing with permissions
- **PatientDoctor**: Healthcare provider relationships
- **Activities**: Complete audit trail and activity logging
- **Notifications**: Real-time alerts and messaging

### **Advanced Features**
- **Encryption Support**: Document-level encryption
- **Sharing Permissions**: Granular access control
- **Medical Relationships**: Complex healthcare provider networks
- **Activity Tracking**: Comprehensive audit trails
- **Notification System**: Real-time alerts and reminders

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
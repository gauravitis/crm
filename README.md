# CRM System

A comprehensive Customer Relationship Management (CRM) system designed for business process automation, with a focus on quotation management and analytics. Built with React and TypeScript for the frontend and Firebase for the backend, this system offers robust features for multi-company operations, client management, and advanced document generation.

## 🚀 Technologies Used

### Frontend
- **React 18** - UI Library
- **TypeScript** - Programming Language
- **Vite** - Build Tool
- **React Router DOM** - Routing
- **Zustand** - State Management
- **React Query** - Data Fetching & Caching
- **Material UI & Shadcn UI** - UI Components
- **Tailwind CSS** - Styling
- **React Hook Form** - Form Management
- **Zod** - Schema Validation
- **Recharts** - Data Visualization Library

### Backend & Database
- **Firebase** - Backend-as-a-Service
  - **Firestore** - NoSQL Database
  - **Authentication** - User Management
  - **Cloud Storage** - File Storage
  - **Cloud Functions** - Serverless Functions (planned)
- **Express.js** - Node.js Web Framework (for specific API endpoints)

### Services & Integrations
- **Resend** - Transactional Emails
- **Vercel** - Deployment Platform

### Document Generation
- **@react-pdf/renderer** - PDF Generation
- **docx** - Word Document Generation with dynamic company profiles
- **jspdf** & **jspdf-autotable** - PDF Generation
- **html2canvas** - HTML to Canvas Conversion

### Development Tools
- **ESLint** - Code Linting
- **Prettier** - Code Formatting
- **TypeScript** - Type Checking
- **Git & GitHub** - Version Control

## 📁 Project Structure

The project follows a modular architecture for maintainability and scalability.

### Frontend Structure
```
frontend/
├── src/
│   ├── assets/          # Static assets and images
│   ├── components/      # Reusable UI components
│   │   ├── ui/          # Base UI components from Shadcn
│   │   ├── client/      # Client management components
│   │   ├── company/     # Company management components
│   │   ├── dashboard/   # Dashboard widgets and charts
│   │   ├── items/       # Item inventory components
│   │   └── quotation-generator/ # Quotation creation components
│   ├── config/          # Configuration files (Firebase, etc.)
│   ├── context/         # React Context providers
│   ├── hooks/           # Custom React hooks for data and business logic
│   ├── lib/             # Utility libraries
│   ├── pages/           # Application pages/routes
│   ├── services/        # API and external service integrations
│   ├── store/           # State management (Zustand)
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Helper functions and document generators
```

### Backend Structure
```
backend/
├── controllers/     # Request handlers
├── models/         # Data models
├── routes/         # API routes
├── services/       # Business logic
├── utils/          # Helper functions
└── server.js       # Entry point
```

## 🔑 Key Features

### 1. Multi-Company Management
   - Support for multiple companies within a single CRM instance
   - Company-specific settings, branding, and document templates
   - Company-specific bank account details for financial documents
   - Filtering of data by company throughout the application

### 2. Advanced Dashboard & Analytics
   - Interactive data visualization with Recharts
   - Company-specific dashboard filtering
   - Time period comparison (current vs previous period, year-over-year)
   - Key performance indicators:
     - Conversion rates from quotations to sales
     - Revenue tracking and growth analysis
     - Average quotation value by company
     - Status distribution analytics (pending, completed, rejected)

### 3. Comprehensive Client Management
   - Detailed client profiles with contact information
   - Client history and interaction tracking
   - Client categorization and segmentation
   - Quick access to client-specific quotations

### 4. Sophisticated Quotation System
   - Dynamic quotation generation with real-time calculations
   - Custom reference number format with company-specific prefixes
   - Multiple formats: PDF, HTML, and Word Document export options
   - Company-specific templates with correct bank details and branding
   - Multi-currency support
   - Custom terms and conditions
   - Item inventory integration with price management

### 5. Document Generation & Management
   - Word document generation with dynamic company profiles
   - PDF quotation generation with customizable templates
   - Email integration for sending documents directly to clients
   - Document versioning and history

### 6. Item & Inventory Management
   - Product/service catalog management
   - Pricing tiers and customization
   - Stock tracking capabilities
   - Quick item selection in quotations

### 7. User Experience
   - Responsive design for desktop and mobile devices
   - Dark mode support
   - Role-based access control
   - Intuitive navigation and workflows
   - Fast performance with optimized data fetching

## 💻 Technical Highlights

### Firebase Integration
- Firestore for real-time data synchronization
- Cloud Storage for document management
- Authentication with multiple provider options
- Security rules for data protection

### Reactive UI
- React 18 with concurrent features
- Server components for improved performance
- Efficient state management with Zustand

### Document Generation
- Custom-built document generators
- Dynamic template system
- Company-specific branding and details
- Multi-format support (PDF, DOCX, HTML)

### Data Visualization
- Interactive charts with Recharts
- Responsive design for all screen sizes
- Real-time data updates
- Comparative analysis tools

## 🚀 Getting Started

1. Clone the repository
2. Set up the frontend:
   ```bash
   cd frontend
   npm install
   ```
3. Set up the backend:
   ```bash
   cd backend
   npm install
   ```
4. Create `.env` files in both frontend and backend directories based on `.env.example`
5. Start the development servers:
   
   Frontend:
   ```bash
   cd frontend
   npm run dev
   ```
   
   Backend:
   ```bash
   cd backend
   npm run dev
   ```

## 📦 Build and Deployment

### Frontend Deployment
```bash
cd frontend
npm run build
```

### Backend Deployment
```bash
cd backend
npm run build
```

## 🔧 Development Workflow

### Frontend Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Backend Development
- `npm run dev` - Start development server with hot reload
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🔍 Future Enhancements

1. **Advanced Reporting** - Customizable report generation with export options
2. **Mobile Application** - Native mobile experience using React Native
3. **AI-Powered Insights** - Integration with AI services for business intelligence
4. **Expanded Integrations** - Connecting with third-party services like accounting software
5. **Workflow Automation** - Custom workflow rules and triggers

## 📝 License

This project is private and confidential, developed for internal business use.

# CRM System

A modern Customer Relationship Management (CRM) system built with React and TypeScript, featuring a robust tech stack and comprehensive functionality.

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

### Backend & Services
- **Firebase** - Backend as a Service
  - Authentication
  - Firestore Database
  - Cloud Storage

### PDF & Document Generation
- **@react-pdf/renderer** - PDF Generation
- **docx** - Word Document Generation
- **jspdf** & **jspdf-autotable** - PDF Generation
- **html2canvas** - HTML to Canvas Conversion

### Development Tools
- **ESLint** - Code Linting
- **Prettier** - Code Formatting
- **TypeScript** - Type Checking

## 📁 Project Structure

```
src/
├── assets/          # Static assets and images
├── components/      # Reusable UI components
├── config/          # Configuration files
├── context/        # React Context providers
├── hooks/          # Custom React hooks
├── lib/            # Utility libraries
├── pages/          # Application pages/routes
├── services/       # API and external service integrations
├── store/          # State management (Zustand)
├── types/          # TypeScript type definitions
└── utils/          # Helper functions and utilities
```

## 🔑 Key Features

1. **Authentication & Authorization**
   - User authentication via Firebase
   - Role-based access control

2. **Customer Management**
   - Customer profiles
   - Contact information
   - Interaction history

3. **Document Management**
   - PDF generation
   - Word document generation
   - Document templates

4. **Data Visualization**
   - Charts and graphs using Recharts
   - Business analytics

5. **Responsive Design**
   - Mobile-friendly interface
   - Modern UI/UX

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`
4. Start the development server:
   ```bash
   npm run dev
   ```

## 📦 Build

To build for production:
```bash
npm run build
```

## 🔧 Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is private and confidential.

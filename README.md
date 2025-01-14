# CRM System

A modern Customer Relationship Management (CRM) system built with React and TypeScript for the frontend and Express.js for the backend, featuring a robust tech stack and comprehensive functionality.

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

### Backend
- **Express.js** - Node.js Web Framework
- **Firebase Admin** - Authentication & Database
- **Resend** - Email Service

### Services & Integrations
- **Firebase** - Authentication & Database
  - Authentication
  - Firestore Database
  - Cloud Storage
- **Resend** - Transactional Emails

### Document Generation
- **@react-pdf/renderer** - PDF Generation
- **docx** - Word Document Generation
- **jspdf** & **jspdf-autotable** - PDF Generation
- **html2canvas** - HTML to Canvas Conversion

### Development Tools
- **ESLint** - Code Linting
- **Prettier** - Code Formatting
- **TypeScript** - Type Checking

## 📁 Project Structure

The project is divided into two main parts: frontend and backend.

### Frontend Structure
```
frontend/
├── src/
│   ├── assets/          # Static assets and images
│   ├── components/      # Reusable UI components
│   ├── config/          # Configuration files
│   ├── context/         # React Context providers
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility libraries
│   ├── pages/           # Application pages/routes
│   ├── services/        # API and external service integrations
│   ├── store/           # State management (Zustand)
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Helper functions and utilities
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

1. **Authentication & Authorization**
   - User authentication via Firebase
   - Role-based access control
   - Secure API endpoints

2. **Customer Management**
   - Customer profiles
   - Contact information
   - Interaction history

3. **Quotation System**
   - Dynamic quotation generation
   - Custom reference number format (CBL-2024-25-XXX)
   - Item inventory management
   - Payment terms customization

4. **Document Management**
   - PDF quotation generation
   - Word document generation
   - Customizable templates
   - Email integration

5. **Data Visualization**
   - Charts and graphs using Recharts
   - Business analytics
   - Sales tracking

6. **Responsive Design**
   - Mobile-friendly interface
   - Modern UI/UX

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

## 📦 Build

To build the frontend for production:
```bash
cd frontend
npm run build
```

To build the backend for production:
```bash
cd backend
npm run build
```

## 🔧 Development

Frontend commands:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

Backend commands:
- `npm run dev` - Start development server with hot reload
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is private and confidential.

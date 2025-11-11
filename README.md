# 🛍️ Modern E-commerce Platform

A complete modern e-commerce platform with Apple-inspired design, built with React, Node.js, and PostgreSQL.

## ✨ Features

- **Modern Design**: Apple-inspired minimalist UI/UX
- **Full E-commerce**: Product catalog, shopping cart, order management
- **User Management**: Registration, authentication, user profiles
- **Admin Panel**: Complete backend management system
- **Real-time Updates**: Live inventory and order status
- **Responsive Design**: Mobile-first approach
- **Secure**: JWT authentication, input validation, rate limiting

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **Zustand** for state management
- **React Query** for server state

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Prisma** ORM
- **PostgreSQL** database (Supabase)
- **JWT** authentication
- **Stripe** payment integration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- PostgreSQL database (or Supabase account)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   
   # Configure your environment variables
   # See environment setup section below
   ```

4. **Database Setup**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Start Development**
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 🔧 Environment Setup

### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce"
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"

# Third-party Services
STRIPE_SECRET_KEY="sk_test_..."
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email
SENDGRID_API_KEY="SG..."
FROM_EMAIL="noreply@yourdomain.com"

# App
NODE_ENV="development"
PORT="3001"
FRONTEND_URL="http://localhost:3000"
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=E-commerce Store
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

## 📁 Project Structure

```
ecommerce-platform/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   ├── store/          # State management
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript types
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js backend application
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── services/       # Business logic
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript types
│   ├── prisma/             # Database schema and migrations
│   └── package.json
├── docs/                   # Documentation
└── package.json           # Root package.json
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run backend tests
npm run test:backend

# Run frontend tests
npm run test:frontend

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Docker Deployment
```bash
docker-compose up -d
```

### Manual Deployment
1. Build the application: `npm run build`
2. Deploy backend to your server
3. Deploy frontend to Vercel/Netlify
4. Configure environment variables
5. Run database migrations

## 📚 Documentation

- [Project Overview](./docs/01_project_overview.md)
- [UI/UX Design](./docs/02_ui_ux_design.md)
- [Frontend Architecture](./docs/03_frontend_architecture.md)
- [Backend Architecture](./docs/04_backend_architecture.md)
- [Database Schema](./docs/05_database_schema.md)
- [Security & Maintenance](./docs/06_security_maintenance.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the documentation
- Contact the development team

---

Built with ❤️ using modern web technologies



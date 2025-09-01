# Scentrise – Full MERN E‑Commerce (Perfume Shop)

A complete MERN stack e-commerce application for selling perfumes with modern payment integration and responsive design.

## 🚀 Tech Stack

- **Frontend**: React 18 + Vite, TypeScript, TailwindCSS, Redux Toolkit
- **Backend**: Node.js + Express, TypeScript, MongoDB + Mongoose  
- **Authentication**: JWT with httpOnly cookies
- **Payments**: Razorpay (primary) + Stripe (fallback, test mode)
- **Testing**: Jest + Supertest
- **Build System**: pnpm workspaces (monorepo)

## 📋 Features

- **Product Catalog**: Browse by gender (Men/Women/Unisex), fragrance families, price filters
- **Search & Sort**: Full-text search, sort by price/rating/newest
- **Product Details**: Image gallery, fragrance notes, reviews & ratings
- **Shopping Cart**: Persistent cart, quantity management
- **User Authentication**: Register, login, profile management
- **Checkout Flow**: Address management, payment method selection
- **Payment Processing**: Razorpay Checkout integration with fallback options
- **Order Management**: Order history, status tracking
- **Admin Dashboard**: Product CRUD, order management
- **Responsive Design**: Mobile-first with TailwindCSS

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- pnpm 8+
- MongoDB (local or Atlas)

### Quick Start

```bash
# Install pnpm globally if not already installed
npm install -g pnpm

# Clone and install dependencies
git clone <repository-url>
cd scentrise
pnpm install

# Set up environment variables
cp server/.env.example server/.env
cp client/.env.example client/.env

# Start MongoDB (if local)
mongod

# Seed the database with sample data
pnpm seed

# Start development servers
pnpm dev
```

The app will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 🔧 Environment Variables

### Server (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/scentrise
JWT_SECRET=your-super-secret-jwt-key
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
STRIPE_SECRET=sk_test_xxx
```

### Client (.env)
```env
VITE_API_URL=http://localhost:5000
```

## 📦 Available Scripts

```bash
# Development
pnpm dev              # Start both client and server
pnpm --filter client dev   # Start only frontend
pnpm --filter server dev   # Start only backend

# Building
pnpm build            # Build all packages
pnpm --filter client build # Build only frontend
pnpm --filter server build # Build only backend

# Database
pnpm seed             # Seed database with sample data

# Testing
pnpm test             # Run all tests
pnpm --filter server test  # Run backend tests

# Linting
pnpm lint             # Lint all packages
```

## 🏗️ Project Structure

```
scentrise/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── features/       # Redux slices
│   │   ├── pages/          # Route components
│   │   ├── lib/            # API & store setup
│   │   └── ...
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── config/         # Configuration
│   │   └── ...
│   ├── package.json
│   └── tsconfig.json
├── shared/                 # Shared types
│   ├── src/types.ts
│   └── package.json
├── docker-compose.yml
└── package.json           # Root workspace config
```

## 🚀 Deployment

### Backend (Render/Railway)
1. Create new service from GitHub repository
2. Set build command: `pnpm install && pnpm --filter server build`
3. Set start command: `pnpm --filter server start`
4. Add environment variables from `.env.example`
5. Use MongoDB Atlas for production database

### Frontend (Vercel/Netlify)
1. Connect GitHub repository
2. Set build command: `cd client && pnpm install && pnpm build`
3. Set publish directory: `client/dist`
4. Add environment variable: `VITE_API_URL=https://your-api-domain.com`

## 🔑 Payment Setup

### Razorpay (Primary - India)
1. Sign up at [razorpay.com](https://razorpay.com)
2. Get test API keys from Dashboard
3. Add keys to server `.env` file
4. For production, complete KYC verification

### Stripe (Fallback - Global)
1. Sign up at [stripe.com](https://stripe.com)
2. Get test API keys from Dashboard  
3. Add secret key to server `.env` file
4. Configure webhooks for production

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm --filter server test --watch

# Run tests with coverage
pnpm --filter server test --coverage
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions, please open an issue in the GitHub repository.

---

Built with ❤️ using the MERN stack

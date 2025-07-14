# 🏫 Columbus Student Marketplace

A modern, secure marketplace designed exclusively for students with .edu email addresses. Built with React, Node.js, Express, and MySQL.

## ✨ Features
- 🔐 **Student Authentication** - .edu email required
- 👤 **User Profiles** - Manage your account
- 🛍️ **Product Catalog** - Browse student marketplace
- 🛒 **Shopping Cart** - Add items to cart
- ❤️ **Wishlist** - Save items for later
- 📊 **User Dashboard** - Track your activity
- 🔒 **JWT Security** - Secure session management

## 🚀 **Live Demo**
- **Frontend:** [Coming Soon - Netlify URL]
- **Backend API:** [Coming Soon - Railway URL]

## 💻 **Local Development**

### Prerequisites
- Node.js (v16+)
- MySQL (v8+)
- Git

### Setup
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/columbus-marketplace.git
cd columbus-marketplace

# Install all dependencies (backend + frontend)
npm run install:all

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Set up database
npm run setup-db

# Development options:
# Option 1: Run both frontend and backend together
npm run dev:both

# Option 2: Run separately (in different terminals)
npm run dev:server    # Backend only
npm run dev:client    # Frontend only

# Production build
npm run build
```

### **Available Scripts**
- `npm run dev:both` - Run frontend and backend concurrently
- `npm run dev:server` - Run backend only (port 5005)
- `npm run dev:client` - Run frontend only (port 3000)
- `npm run install:all` - Install dependencies for both frontend and backend
- `npm run setup-db` - Initialize database with schema and sample data
- `npm run build` - Build frontend for production
- `npm start` - Start production server

### Environment Variables
```env
DATABASE_HOST=localhost
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE=Columbus_Marketplace
JWT_SECRET=your_secret_key
```

## 🌐 **Deployment**
See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed deployment instructions using:
- **Frontend:** Netlify (Free)
- **Backend:** Railway (Free)
- **Database:** Railway MySQL (Free)

## 📁 **Project Structure**

```
CSC4330ProjectGroup1/
├── 📱 client/              # Frontend Application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components  
│   │   ├── context/       # React context providers
│   │   └── services/      # API service calls
│   ├── public/           # Static assets
│   ├── package.json      # Frontend dependencies
│   └── vite.config.js    # Vite configuration
│
├── 🔧 server/              # Backend Application
│   ├── app.js            # Main Express server
│   ├── controllers/      # Business logic handlers
│   ├── routes/           # API route definitions
│   ├── database/         # Database schemas & setup
│   └── public/           # Static file serving
│
├── 🚀 config/              # Deployment Configuration
│   ├── netlify.toml      # Frontend deployment config
│   ├── railway.toml      # Backend deployment config
│   └── railway-db-setup.sh # Database setup script
│
├── 📚 docs/                # Documentation
│   ├── DEPLOYMENT.md     # Deployment instructions
│   ├── CONTRIBUTING.md   # Contribution guidelines
│   └── CHANGELOG.md      # Version history
│
└── 📋 Root Level           # Project Essentials
    ├── .env              # Environment variables
    ├── .gitignore        # Git ignore rules
    ├── package.json      # Backend dependencies
    ├── package-lock.json # Dependency lock file
    └── README.md         # Project documentation
```

### **Architecture Overview**
- **`client/`** - Complete React frontend with Vite build system
- **`server/`** - Complete Node.js/Express backend with API logic
- **`config/`** - All deployment and environment configurations
- **`docs/`** - Project documentation and guides
- **Root Level** - Essential project files (package.json, .env, etc.)

## 🛠️ **Tech Stack**

### **Frontend**
- **React** - Modern UI library
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Tailwind CSS + Custom CSS** - Styling system
- **CSS Variables** - Theming and design tokens

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MySQL2** - Database driver
- **JWT (jsonwebtoken)** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### **Database**
- **MySQL** - Relational database
- **Railway MySQL** - Cloud database hosting (production)
- **Local MySQL** - Local development

### **Deployment & Hosting**
- **Netlify** - Frontend hosting with automatic deployments
- **Railway** - Backend hosting with database
- **Git** - Version control
- **GitHub** - Repository hosting

### **Development Tools**
- **Vite** - Frontend build tool
- **npm** - Package manager
- **VS Code** - Development environment
- **Concurrently** - Run multiple dev servers simultaneously

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](./docs/CONTRIBUTING.md) for details on:
- Development setup
- Code style guidelines  
- Pull request process
- Project structure

## 📚 **Documentation**

- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Detailed deployment instructions
- **[Contributing Guide](./docs/CONTRIBUTING.md)** - How to contribute to the project
- **[Changelog](./docs/CHANGELOG.md)** - Version history and updates

## 📞 **Support**

- 📧 **Email**: [your-email@example.com]
- 🐛 **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/columbus-marketplace/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/columbus-marketplace/discussions)

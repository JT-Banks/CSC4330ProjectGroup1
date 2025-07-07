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

# Install backend dependencies
npm install

# Install frontend dependencies
cd client && npm install && cd ..

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Set up database
npm run setup-db

# Start development servers
npm run dev
```

### Environment Variables
```env
DATABASE_HOST=localhost
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE=Columbus_Marketplace
JWT_SECRET=your_secret_key
```

## 🌐 **Deployment**
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions using:
- **Frontend:** Netlify (Free)
- **Backend:** Railway (Free)
- **Database:** Railway MySQL (Free)

## 📁 **Project Structure**
2. In a terminal, in the parent directory of the application: ``npm install``
3. Utilize the script located in the ``Database`` folder, simply copy and paste or load the script and run it to load the database.
4. Once installation is finished: ``npm start``
5. In select browser: ``localhost:5005``
6. .env file configuration: Database info, such as password, host, jwt cookie configs(this is meant to be private, up to you really) \
Here's an example: \
![image](https://user-images.githubusercontent.com/48796307/161466329-9d5b3825-1f78-4984-8305-f2c84b0f90b5.png)


Database setup: 
1. Once Xampp or Mamp is installed, navigate to ``http://localhost/phpmyadmin/index.php``
2. Click new -> Create database, name it ``columbus_marketplace``
3. Create database, then load the provided script in Database folder

Tech stack:
- Xampp (MySQL, and Apache)
- Handle-bars
- React
- Express
- Cookie Parser
- dotenv

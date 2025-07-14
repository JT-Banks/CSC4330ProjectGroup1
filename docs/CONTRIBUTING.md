# Contributing to Columbus Student Marketplace

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/columbus-marketplace.git
   cd columbus-marketplace
   ```

2. **Install Dependencies**
   ```bash
   npm run install:all
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Fill in your database credentials
   ```

4. **Database Setup**
   ```bash
   npm run setup-db
   ```

5. **Start Development**
   ```bash
   npm run dev:both
   ```

## Code Style

- **Frontend**: Follow React best practices, use functional components with hooks
- **Backend**: Follow Express.js conventions, use async/await for database operations
- **Database**: Use proper SQL naming conventions (snake_case for tables/columns)

## Folder Structure

- `client/` - React frontend application
- `server/` - Node.js/Express backend application
- `config/` - Deployment and environment configurations
- `docs/` - Project documentation

## Pull Request Process

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes and test locally
3. Commit with clear, descriptive messages
4. Push to your fork and submit a pull request
5. Ensure all checks pass and address any feedback

## Testing

Currently, this project doesn't have automated tests, but manual testing should cover:
- User authentication (.edu email validation)
- Product CRUD operations
- Cart functionality
- Wishlist features
- Database connections

## Questions?

Feel free to open an issue for any questions or suggestions!

# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2025-01-13

### ✨ Added
- Complete project restructure with `client/`, `server/`, `config/`, and `docs/` directories
- Modern CSS architecture with custom properties and component-based styling
- Category icons with proper emoji display support
- Comprehensive npm scripts for development workflow
- Professional development setup with concurrently for running frontend/backend together

### 🔧 Changed
- Moved backend code from root to `server/` directory
- Consolidated deployment configurations in `config/` directory
- Updated project documentation to reflect new structure
- Enhanced database schema with category icon support

### 🗑️ Removed
- 50+ obsolete files and legacy code
- Duplicate controllers and unused database scripts
- Old Handlebars templates (migrated to React)
- Redundant CSS files (consolidated into new architecture)

### 🐛 Fixed
- Category emojis now display properly instead of question marks
- Streamlined database setup process
- Improved code organization and maintainability

## [1.0.0] - Previous Version

### ✨ Initial Features
- Student marketplace with .edu email authentication
- Product catalog, shopping cart, and wishlist functionality
- JWT-based security system
- MySQL database integration
- React frontend with Tailwind CSS
- Express.js backend API

---

## Version Format
This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality additions  
- **PATCH** version for backwards-compatible bug fixes

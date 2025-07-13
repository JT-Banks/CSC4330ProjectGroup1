# PROJECT CLEANUP PLAN

## 🗑️ FILES TO DELETE (Temporary/Dead Code)

### Root Directory - Database Test/Setup Files:
- add-marketplace-features.js
- check-cart-table.js  
- check-cart-tables.js
- check-local-products.js
- check-mysql-case-settings.js
- check-products-columns.js
- check-products-table.js
- check-table-data.js
- check-table-names.js
- check-wishlist-table.js
- cleanup-duplicate-tables.js
- cleanup-final-tables.js
- create-cart-wishlist.js
- fix-category-icons.js (we already applied this)
- frontend-api-test.html
- recreate-database.js
- rename-tables-to-proper-case.js
- setup-categories.js
- setup-database.js
- setup-local-tables.js
- setup-student-marketplace.js
- test-api.js
- test-cart-insert.js
- test-db-connection.js
- test-frontend-api.js
- test-profile.jsx
- test-railway-cart.js
- update-local-db.js
- update-local-schema.js
- update-table-names.js

### Database Directory - Old Schema Files:
- marketplace_migration.sql (superseded by student_marketplace_schema.sql)
- marketplace_setup.sql (superseded by student_marketplace_schema.sql)
- improved_schema.sql (superseded by student_marketplace_schema.sql)
- categories_schema.sql (features merged into current schema)
- products_schema.sql (superseded by student_marketplace_schema.sql)
- cart_wishlist_tables.sql (superseded by student_marketplace_schema.sql)

### Client Directory:
- FORCE_DEPLOY.txt (deployment artifact)

## 📁 FILES TO KEEP:

### Root Directory:
- app.js (main backend server)
- package.json, package-lock.json (.env, .gitignore, etc.)
- README.md, DEPLOYMENT.md
- controllers/, routes/, public/
- netlify.toml, railway.toml (deployment configs)

### Database Directory:
- student_marketplace_schema.sql (current main schema)
- local_migration.sql (current migration script)  
- sample_data.sql (sample data for testing)

### Client Directory:
- All src/ files (main application)
- package.json, vite.config.js, tailwind.config.js, etc.

## 🎨 CSS REFACTORING PLAN:

1. Create dedicated CSS modules in client/src/styles/
2. Extract Tailwind utility classes to semantic CSS classes
3. Organize by component/page
4. Create a theme system for colors and typography

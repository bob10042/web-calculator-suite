# Web Development Projects

A comprehensive collection of web development projects demonstrating frontend, backend, database, and full-stack development.

## 📁 Project Structure

```
web_projects/
├── frontend/              # HTML/CSS/JavaScript Frontend
│   ├── index.html        # Advanced Calculator Web App
│   ├── styles.css        # Responsive CSS with dark/light themes
│   └── calculator.js     # Interactive JavaScript functionality
├── backend/              # Node.js/Express Backend
│   ├── server.js         # REST API server
│   └── package.json      # Backend dependencies
├── database/             # Database Layer
│   ├── database.sql      # SQLite schema and sample data
│   ├── database.js       # Database ORM/wrapper class
│   ├── test-db.js        # Database testing script
│   └── package.json      # Database dependencies
├── fullstack_demo/       # Complete Full-Stack Application
│   ├── app.js           # Integrated backend with database
│   └── package.json     # Full-stack dependencies
└── README.md            # This file
```

## 🚀 Projects Overview

### 1. Frontend Project (`frontend/`)

**Advanced Web Calculator** - Pure client-side application

**Features:**
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🧮 **Scientific Calculator** - Basic arithmetic + trigonometry, square root
- 💾 **Memory Operations** - Store, recall, clear, add to memory
- 📚 **History Management** - Local storage with export functionality
- 🌙 **Dark/Light Themes** - Toggle with localStorage persistence
- ⌨️ **Keyboard Support** - Full keyboard navigation
- 🎨 **Modern UI** - CSS Grid, Flexbox, animations, color-coded buttons

**Technologies:** HTML5, CSS3, JavaScript ES6+, Local Storage

### 2. Backend Project (`backend/`)

**REST API Server** - Node.js backend with Express

**Features:**
- 🔧 **RESTful API** - Complete CRUD operations
- 🧮 **Calculation Engine** - Server-side mathematical operations
- 👥 **User Management** - Registration, login, user profiles
- 📊 **Statistics API** - Usage analytics and reporting
- 📤 **Data Export** - JSON and CSV export functionality
- ⚡ **Real-time Operations** - Fast response times
- 🛡️ **Error Handling** - Comprehensive error management

**Technologies:** Node.js, Express.js, CORS

### 3. Database Project (`database/`)

**SQLite Database Layer** - Persistent data storage

**Features:**
- 👤 **User Management** - Registration, authentication, preferences
- 🧮 **Calculation Storage** - Persistent calculation history
- 💾 **Memory Operations** - User-specific memory storage
- 📊 **Usage Analytics** - Detailed statistics and reporting
- 🔧 **Database ORM** - Custom wrapper class for easy operations
- 🧹 **Maintenance Tools** - Cleanup, backup, migration scripts
- 📈 **Performance** - Indexed queries and optimizations

**Technologies:** SQLite3, SQL, Node.js

### 4. Full-Stack Demo (`fullstack_demo/`)

**Complete Web Application** - Integrated frontend, backend, and database

**Features:**
- 🌐 **Single Application** - All components integrated
- 👤 **User Accounts** - Registration, login, personalized experience
- 💾 **Persistent Data** - All calculations and settings saved
- 📊 **Rich Dashboard** - Personal analytics and statistics
- 🎛️ **User Preferences** - Customizable themes and settings
- 📚 **Calculation History** - Searchable, filterable history
- ⭐ **Favorites** - Mark important calculations
- 🛠️ **Admin Tools** - Analytics and maintenance endpoints

**Technologies:** All of the above + integrated architecture

## 🛠️ Installation & Setup

### Prerequisites
```bash
# Ensure Node.js is installed
node --version  # Should be 14.0.0 or higher
npm --version
```

### Quick Start - Individual Projects

#### Frontend Only
```bash
cd frontend
# Open index.html in browser or serve with:
python3 -m http.server 8000
# Visit: http://localhost:8000
```

#### Backend Only
```bash
cd backend
npm install
npm start
# API available at: http://localhost:3000
```

#### Database Only
```bash
cd database
npm install
npm run test  # Test database operations
```

#### Full-Stack Application
```bash
cd fullstack_demo
npm run setup  # Install all dependencies
npm start
# Visit: http://localhost:3001
```

### Complete Setup (All Projects)
```bash
# Install all dependencies for all projects
cd backend && npm install && cd ..
cd database && npm install && cd ..
cd fullstack_demo && npm install && cd ..
```

## 🎮 Usage Examples

### Frontend Calculator
- Open `frontend/index.html` in browser
- Perform calculations using mouse or keyboard
- Toggle dark/light theme with button
- View calculation history in side panel
- Export history as CSV file

### Backend API Testing
```bash
# Start backend server
cd backend && npm start

# Test endpoints with curl:
curl http://localhost:3000/api/health
curl -X POST http://localhost:3000/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"add","operand1":5,"operand2":3}'
```

### Database Operations
```bash
cd database
npm run test  # Run comprehensive database tests
```

### Full-Stack Demo
```bash
cd fullstack_demo && npm start
# 1. Visit http://localhost:3001
# 2. Register a new user account
# 3. Login and use calculator
# 4. View your dashboard with statistics
# 5. Customize preferences
```

## 📡 API Documentation

### Backend Endpoints (`backend/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| GET | `/api/calculations` | Get all calculations |
| POST | `/api/calculations` | Save a calculation |
| POST | `/api/calculate` | Perform calculation |
| POST | `/api/calculate/scientific` | Scientific operations |
| GET | `/api/users` | Get all users |
| POST | `/api/users` | Create user |
| GET | `/api/stats` | Get statistics |
| GET | `/api/export/:format` | Export data (json/csv) |

### Full-Stack Endpoints (`fullstack_demo/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | User registration |
| POST | `/api/login` | User login |
| GET | `/api/users/:id/calculations` | User's calculation history |
| GET/POST/DELETE | `/api/users/:id/memory` | Memory operations |
| GET/PUT | `/api/users/:id/preferences` | User preferences |
| GET | `/api/users/:id/dashboard` | User dashboard data |
| POST | `/api/calculations/:id/favorite` | Toggle favorite |
| GET | `/api/admin/analytics` | Admin analytics |

## 🧪 Testing

### Frontend Testing
- Open browser developer tools
- Test responsive design with device simulation
- Verify local storage functionality
- Test keyboard shortcuts

### Backend Testing
```bash
cd backend
npm test  # Run Jest tests (if configured)

# Manual API testing
curl -X POST http://localhost:3000/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"multiply","operand1":7,"operand2":6}'
```

### Database Testing
```bash
cd database
npm run test  # Comprehensive database operation tests
```

### Full-Stack Testing
```bash
cd fullstack_demo
npm test  # Integration tests
```

## 🔧 Development

### Adding New Features

#### Frontend
1. Add HTML elements to `index.html`
2. Style with CSS in `styles.css`
3. Add JavaScript functionality to `calculator.js`

#### Backend
1. Add new routes to `server.js`
2. Implement business logic
3. Add error handling

#### Database
1. Add new tables to `database.sql`
2. Update `database.js` with new methods
3. Add tests to `test-db.js`

### Project Extensions
- **Authentication**: Add JWT tokens, password hashing
- **Real-time**: WebSocket support for live updates
- **Mobile App**: React Native or Flutter frontend
- **Deployment**: Docker containers, cloud deployment
- **Testing**: Unit tests, integration tests, E2E tests

## 🌟 Features Demonstrated

### Frontend Technologies
- ✅ **Responsive Design** (CSS Grid, Flexbox)
- ✅ **Modern JavaScript** (ES6+, Async/Await)
- ✅ **Local Storage** (Data persistence)
- ✅ **CSS Variables** (Theming system)
- ✅ **Event Handling** (Mouse, keyboard, touch)
- ✅ **Animation** (CSS transitions, transforms)

### Backend Technologies
- ✅ **RESTful API** (Express.js)
- ✅ **Middleware** (CORS, JSON parsing, error handling)
- ✅ **File Operations** (Export, serve static files)
- ✅ **Data Validation** (Input sanitization)
- ✅ **Error Handling** (Try/catch, error middleware)

### Database Technologies
- ✅ **SQL Schema Design** (Tables, relationships, indexes)
- ✅ **CRUD Operations** (Create, Read, Update, Delete)
- ✅ **Data Modeling** (Users, calculations, preferences)
- ✅ **Query Optimization** (Indexes, efficient queries)
- ✅ **Data Analytics** (Statistics, reporting)

### Full-Stack Integration
- ✅ **Authentication** (Login, registration)
- ✅ **Session Management** (User state persistence)
- ✅ **Data Flow** (Frontend ↔ Backend ↔ Database)
- ✅ **Error Handling** (End-to-end error management)
- ✅ **Performance** (Optimized queries, caching)

## 📚 Learning Outcomes

This project collection demonstrates:

1. **Frontend Development** - Modern web UI/UX design
2. **Backend Development** - API design and server architecture
3. **Database Design** - Relational data modeling and optimization
4. **Full-Stack Integration** - Connecting all layers effectively
5. **Software Architecture** - Separation of concerns, modularity
6. **Web Standards** - HTML5, CSS3, ES6+, REST APIs
7. **Development Workflow** - Testing, debugging, deployment preparation

Perfect for learning web development, building portfolios, or demonstrating technical skills to employers!

## 🔗 Related Projects

This web development collection complements other projects in your environment:
- **Java GUI Calculator** (`/home/bob43/java_projects/sample_project/`)
- **MicroPython Hardware** (`/home/bob43/micropython/`)
- **C# Calibration Software** (`/home/bob43/CalTestGUIW/`)

## 📄 License

MIT License - Feel free to use for learning, development, and commercial projects.
# Chat Node - Real-Time Chat Application

A TypeScript-based chat application built with Express, Socket.io, and Prisma.

## 🎯 Project Status

### ✅ **Completed - Full Stack Real-Time Chat**
- TypeScript with strict mode
- Express server with error handling
- Environment configuration with Zod validation
- Layered architecture (Controllers → Services → Repositories)
- **Database**: Prisma + PostgreSQL
- **Authentication**: JWT + bcrypt password hashing
- **Models**: User, Room, RoomMember, Message
- **REST API**: Auth, Rooms, Messages
- **WebSockets**: Socket.io with real-time messaging
- **Deployed**: Production ready on Railway

---

## 📁 Project Structure

```
chatNode/
├── prisma/
│   ├── schema.prisma              # Database schema (4 models)
│   └── migrations/                # SQL migrations
├── src/
│   ├── config/                    # Environment & database connection
│   ├── dtos/                      # TypeScript interfaces for API
│   ├── types/                     # Type extensions (Express)
│   ├── utils/                     # Errors, logger
│   ├── middlewares/               # Auth, error handling
│   ├── repositories/              # Database access layer
│   ├── services/                  # Business logic layer
│   ├── controllers/               # HTTP request handlers
│   ├── routes/                    # API route definitions
│   ├── sockets/                   # WebSocket handlers (TODO)
│   ├── app.ts                     # Express configuration
│   └── server.ts                  # Server startup
├── .env                           # Environment variables
├── dev.db                         # SQLite database
└── package.json
```

---

## 🚀 Quick Start

### **Install Dependencies**
```bash
npm install
```

### **Database Setup**
```bash
# Run migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# (Optional) View database in browser
npx prisma studio
```

### **Run Development Server**
```bash
npm run dev
```

Server runs on: http://localhost:3000

### **Available Scripts**
```bash
npm run dev              # Development mode (auto-restart)
npm run build            # Compile TypeScript
npm start                # Run production build
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run new migration
npm run prisma:studio    # Visual database editor
```

---

## 📡 API Endpoints

### **Authentication**
```
POST   /api/auth/register    # Register new user
POST   /api/auth/login       # Login user
GET    /api/auth/me          # Get current user (requires auth)
```

### **Rooms**
```
POST   /api/rooms                  # Create room
GET    /api/rooms                  # List all rooms
GET    /api/rooms/my               # Get user's rooms
GET    /api/rooms/:roomId          # Get room details
PUT    /api/rooms/:roomId          # Update room
DELETE /api/rooms/:roomId          # Delete room
POST   /api/rooms/:roomId/join     # Join room
POST   /api/rooms/:roomId/leave    # Leave room
```

### **Messages**
```
POST   /api/rooms/:roomId/messages      # Send message
GET    /api/rooms/:roomId/messages      # Get messages (paginated)
       ?page=1&limit=50
DELETE /api/messages/:messageId         # Delete message
```

---

## 🧪 Testing the API

### **1. Register a user**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"password123"}'
```

Response includes JWT token - save it!

### **2. Create a room** (use token from step 1)
```bash
curl -X POST http://localhost:3000/api/rooms \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"name":"General Chat","description":"Welcome!"}'
```

### **3. Send a message** (use roomId from step 2)
```bash
curl -X POST http://localhost:3000/api/rooms/ROOM_ID/messages \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello everyone!"}'
```

### **4. Get messages**
```bash
curl http://localhost:3000/api/rooms/ROOM_ID/messages?limit=10 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🗄️ Database Schema

### **User**
- id (UUID)
- username (unique)
- email (unique)
- password (bcrypt hashed)
- createdAt, updatedAt

### **Room**
- id (UUID)
- name
- description (optional)
- createdAt, updatedAt

### **RoomMember** (join table)
- id (UUID)
- userId → User
- roomId → Room
- joinedAt
- Unique constraint: (userId, roomId)

### **Message**
- id (UUID)
- content
- userId → User
- roomId → Room
- createdAt, updatedAt
- Index on: (roomId, createdAt)

---

## 🏗️ Architecture

### **Layered Architecture**
```
Request → Routes → Controller → Service → Repository → Database
                      ↓
                  Middleware (auth, errors)
                      ↓
                  Response
```

### **Layer Responsibilities**

| Layer | Responsibility | Example |
|-------|---------------|---------|
| **Routes** | URL mapping | `POST /api/rooms → createRoom` |
| **Controller** | HTTP handling | Parse request, send response |
| **Service** | Business logic | "Can user send message?" |
| **Repository** | Database access | "Save message to DB" |
| **Middleware** | Cross-cutting | Auth, logging, errors |

---

## 🔐 Authentication Flow

1. **Register/Login** → Password hashed with bcrypt → JWT token issued
2. **Client sends request** → Token in `Authorization: Bearer <token>` header
3. **Auth middleware** → Verifies token → Attaches user to `req.user`
4. **Controller** → Accesses `req.user.id` to know who's making request

---

## 📚 Key Technologies

- **TypeScript** - Type safety
- **Express** - Web framework
- **Prisma 5** - Type-safe ORM
- **PostgreSQL** - Production database
- **JWT** - Stateless authentication
- **bcrypt** - Password hashing
- **Zod** - Runtime validation
- **Socket.io** - Real-time WebSockets

---

## 🚀 Deployment (Railway)

### Environment Variables Required:
```env
NODE_ENV=production
JWT_SECRET=<minimum-32-characters>
JWT_EXPIRES_IN=7d
DATABASE_URL=<postgresql-connection-string>
CORS_ORIGIN=<frontend-url>
```

### Deploy Steps:
1. Connect GitHub repository to Railway
2. Add PostgreSQL service
3. Configure environment variables
4. Railway automatically builds and deploys
5. Access at: `https://your-app.up.railway.app`

---

## 📝 Environment Variables

Create a `.env` file (already exists):

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=7d
DATABASE_URL=file:./dev.db
CORS_ORIGIN=http://localhost:3000
```

---

## 🐛 Troubleshooting

### **Database not found**
```bash
npx prisma migrate deploy
```

### **TypeScript errors after schema change**
```bash
npx prisma generate
```

### **Port already in use**
Change `PORT` in `.env` file

### **Authentication errors**
Check that `JWT_SECRET` is at least 32 characters

---

## 📖 Learning Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **Express Docs**: https://expressjs.com
- **Socket.io Docs**: https://socket.io/docs
- **TypeScript Handbook**: https://www.typescriptlang.org/docs

---

## 👨‍💻 Development Notes

### **Prisma Version**
Using Prisma 5.x (not 7.x) for better SQLite compatibility

### **Database File**
`dev.db` in root directory (gitignored)

### **Generated Files**
- `src/generated/prisma/` - Auto-generated Prisma Client (gitignored)

---

**Built with educational purposes - following clean architecture principles!** 🎓

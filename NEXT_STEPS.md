# Next Steps - Etapa 3: WebSockets

When you're ready to continue building the real-time features, follow these steps:

---

## 🚀 Quick Start to Resume

```bash
# 1. Navigate to project
cd C:\Repos\chatNode

# 2. Start development server
npm run dev

# 3. Verify everything works
curl http://localhost:3000/api/health
```

---

## 📋 Etapa 3 Implementation Checklist

### Phase 1: Socket.io Setup (30-45 min)

**Install dependencies:**
```bash
npm install socket.io
npm install -D @types/socket.io
```

**Files to create:**
1. `src/sockets/socket.ts` - Initialize Socket.io server
2. Update `src/server.ts` - Attach Socket.io to HTTP server
3. `src/sockets/middlewares/auth.middleware.ts` - WebSocket authentication

**What you'll learn:**
- How Socket.io integrates with Express
- Difference between HTTP and WebSocket connections
- Authenticating WebSocket connections

---

### Phase 2: Connection Management (30 min)

**Files to create:**
1. `src/services/connection.service.ts` - Track active socket connections
2. `src/sockets/handlers/connection.handler.ts` - Handle connect/disconnect

**Features:**
- Track which users are online
- Map socket IDs to user IDs
- Handle graceful disconnections

**What you'll learn:**
- Managing stateful connections
- Singleton pattern for connection tracking
- Memory cleanup on disconnect

---

### Phase 3: Real-Time Messaging (45 min)

**Files to create:**
1. `src/sockets/handlers/message.handler.ts` - Real-time message events
2. Update `src/services/message.service.ts` - Emit socket events when message saved

**Events to implement:**
- `send-message` (client → server)
- `message-received` (server → room members)

**What you'll learn:**
- Broadcasting to specific rooms
- Combining HTTP and WebSocket
- Event-driven architecture

---

### Phase 4: Room & Presence (30 min)

**Files to create:**
1. `src/sockets/handlers/room.handler.ts` - Room join/leave events

**Events to implement:**
- `join-room` (client → server)
- `leave-room` (client → server)
- `user-joined` (server → room)
- `user-left` (server → room)

**What you'll learn:**
- Socket.io rooms
- Presence detection
- Multi-room subscriptions

---

### Phase 5: Typing Indicators (15 min)

**Events to implement:**
- `typing-start` (client → server → room)
- `typing-stop` (client → server → room)

**What you'll learn:**
- Ephemeral events (not saved to DB)
- Broadcast without persistence
- Debouncing techniques

---

### Phase 6: Testing (30 min)

**Create test client:**
- Simple HTML/JS client to test events
- Or use Postman/Socket.io client

**Test scenarios:**
1. Two users connect
2. Both join same room
3. User 1 sends message → User 2 receives instantly
4. User 1 types → User 2 sees "User 1 is typing..."
5. User 1 disconnects → User 2 sees "User 1 left"

---

## 🎯 Expected Flow After Etapa 3

### Current (HTTP only):
```
1. Alice sends message via POST /api/rooms/:id/messages
2. Message saved to database
3. Bob must refresh or poll to see new message
```

### After WebSockets:
```
1. Alice sends message via socket.emit('send-message', data)
2. Server saves to database
3. Server broadcasts to all room members via socket
4. Bob receives message INSTANTLY (no refresh!)
```

---

## 📁 New Folder Structure After Etapa 3

```
src/
├── sockets/
│   ├── socket.ts                         # Socket.io server setup
│   ├── middlewares/
│   │   └── auth.middleware.ts            # Socket authentication
│   └── handlers/
│       ├── connection.handler.ts         # Connect/disconnect
│       ├── message.handler.ts            # Real-time messages
│       └── room.handler.ts               # Join/leave rooms
├── services/
│   ├── connection.service.ts             # NEW: Track active connections
│   ├── auth.service.ts                   # Existing
│   ├── room.service.ts                   # Existing
│   └── message.service.ts                # UPDATE: Emit socket events
└── server.ts                             # UPDATE: Attach Socket.io
```

---

## 💡 Key Concepts for Etapa 3

### Socket.io Rooms
```typescript
// Join a room
socket.join(`room:${roomId}`);

// Broadcast to everyone in room EXCEPT sender
socket.to(`room:${roomId}`).emit('message-received', data);

// Broadcast to everyone in room INCLUDING sender
io.to(`room:${roomId}`).emit('user-joined', data);
```

### Authentication Flow
```typescript
// Client connects with token
const socket = io('http://localhost:3000', {
  auth: {
    token: 'jwt-token-here'
  }
});

// Server verifies token before allowing connection
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  const user = await verifyToken(token);
  socket.data.user = user;  // Attach user to socket
  next();
});
```

### Event Pattern
```typescript
// Client → Server
socket.emit('send-message', { roomId, content });

// Server validates → Saves to DB → Broadcasts
socket.on('send-message', async (data) => {
  const message = await messageService.create(data);
  io.to(`room:${data.roomId}`).emit('message-received', message);
});

// Server → Client
socket.on('message-received', (message) => {
  // Update UI with new message
});
```

---

## 🧪 How to Test WebSockets

### Option 1: Browser Console
```javascript
// In browser console
const socket = io('http://localhost:3000', {
  auth: { token: 'your-jwt-token' }
});

socket.on('connect', () => console.log('Connected!'));
socket.emit('join-room', { roomId: 'room-id-here' });
socket.on('message-received', (msg) => console.log('New message:', msg));
```

### Option 2: Simple HTML Client
Create `test-client.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
</head>
<body>
  <h1>Socket.io Test Client</h1>
  <div id="messages"></div>
  <input id="messageInput" type="text" />
  <button onclick="sendMessage()">Send</button>

  <script>
    const token = 'paste-jwt-token-here';
    const socket = io('http://localhost:3000', { auth: { token } });

    socket.on('message-received', (msg) => {
      document.getElementById('messages').innerHTML +=
        `<p>${msg.user.username}: ${msg.content}</p>`;
    });

    function sendMessage() {
      const content = document.getElementById('messageInput').value;
      socket.emit('send-message', { roomId: 'room-id', content });
    }
  </script>
</body>
</html>
```

### Option 3: Postman
Postman supports WebSocket connections for testing.

---

## 🎓 What You'll Learn in Etapa 3

1. **WebSockets vs HTTP**
   - Persistent connections
   - Bidirectional communication
   - Event-driven architecture

2. **Socket.io Features**
   - Rooms and namespaces
   - Broadcasting patterns
   - Acknowledgments
   - Reconnection handling

3. **Real-Time Patterns**
   - Pub/Sub (publish-subscribe)
   - Presence detection
   - Optimistic updates

4. **State Management**
   - In-memory connection tracking
   - Ephemeral vs persistent data
   - Cleanup on disconnect

5. **Scalability Considerations**
   - Socket.io + Redis adapter (for multiple servers)
   - Horizontal scaling challenges
   - Stateful vs stateless design

---

## 📚 Helpful Resources

- **Socket.io Docs**: https://socket.io/docs/v4/
- **Socket.io Client API**: https://socket.io/docs/v4/client-api/
- **Emit Cheatsheet**: https://socket.io/docs/v4/emit-cheatsheet/
- **Socket.io + Express**: https://socket.io/get-started/chat

---

## 🐛 Common Issues & Solutions

### Issue: CORS errors with Socket.io
**Solution**: Configure CORS in Socket.io setup
```typescript
const io = new Server(server, {
  cors: {
    origin: env.CORS_ORIGIN,
    credentials: true
  }
});
```

### Issue: Socket disconnects immediately
**Solution**: Check authentication middleware, ensure JWT is valid

### Issue: Messages not broadcasting
**Solution**: Verify socket.join() was called for the room

---

## ✅ When You're Done with Etapa 3

You should be able to:
- ✅ Open two browser tabs
- ✅ Login as different users in each tab
- ✅ Both join the same room
- ✅ Send message from Tab 1 → See it INSTANTLY in Tab 2
- ✅ See typing indicators
- ✅ See user join/leave notifications

---

**Ready to build?** Just say "Let's start Etapa 3!" and I'll guide you through each phase! 🚀

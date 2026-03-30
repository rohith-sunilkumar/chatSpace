# ChatSpace

ChatSpace is a modern, real-time workspace and messaging application built with the MERN stack (MongoDB, Express, React, Node.js), Socket.io, and Tailwind CSS v4. It provides a Slack-like experience with isolated workspaces, topic-based channels, and instantaneous messaging features.

## Live Demo & Screenshots
**Live App:** [Link to Live App] *(Deploy via Vercel/Render)*

### Screenshots
*(Add screenshots here showing the Dashboard, Chat Interface, and Mobile Responsiveness)*

---

## Core Features

### Dashboard
The Dashboard serves as the central hub for users immediately after authenticating.
* **Profile Overview**: Displays securely fetched user details including Full Name, Email, unique User ID, and account creation date.
* **Session Management**: Visually indicates JWT (JSON Web Token) session health and active authentication state.
* **Gateway**: Acts as the launchpad to transition into the active interactive Workspace.

### Workspace & Chat System
The core engine of ChatSpace, designed to facilitate continuous team communication.

* **Workspaces**: Isolated team environments. Users can create a new workspace from scratch or join an existing colleague's workspace via a secure 8-character `Invite Code`.
* **Channels**: Dedicated sub-rooms within a workspace (e.g., `#announcements`, `#general`) to keep conversations organized by topic.
* **Real-Time Socket Connection**: Powered by WebSockets (Socket.io) for instantaneous, zero-latency message delivery.
* **Advanced Messaging Features**:
  * **Live Typing Indicators**: See exactly when colleagues are drafting a message (e.g., "Rohith is typing...").
  * **Message Editing**: Fix typos on the fly. Edited messages are automatically flagged with an *(edited)* tag for transparency.
  * **Message Deletion**: Remove mistakes immediately across all connected clients.
  * **Emoji Reactions**: React to messages inline with emojis (👍, ❤️, 😂, 🎉, 🚀). Reaction counts update globally in real-time.
  * **Smart Auto-Scroll**: The chat interface automatically keeps you at the newest message if you are currently at the bottom of the feed.

---

## Architecture Overview

- **REST APIs** handle authentication, workspace management, and message persistence.
- **Socket.io** handles real-time communication between clients and the server.
- **Data Synchronization**: Messages are stored in MongoDB first, then instantly synced to connected clients via WebSockets.
- **Room Isolation**: Each channel acts as an isolated Socket room, ensuring events are only broadcast to active participants.
- **API Security**: JWT middleware is used for securing all private API routes and injecting the authorized user object.

### Tech Stack
* **Frontend**: React.js (Vite), Tailwind CSS v4, React Router, Context API
* **Backend**: Node.js, Express.js
* **Database**: MongoDB & Mongoose ODM
* **Real-time Engine**: Socket.io
* **Authentication**: JWT (JSON Web Tokens) using HTTP-only cookies (recommended) or localStorage.

---

## Database Design

**User Model**
- `name` (String)
- `email` (String, unique)
- `password` (String, hashed)

**Workspace Model**
- `name` (String)
- `members` (Array of ObjectId refs to User)
- `inviteCode` (String, unique 8-character code)

**Channel Model**
- `name` (String, formatted lowercase/hyphenated)
- `workspaceId` (ObjectId ref to Workspace)

**Message Model**
- `senderId` (ObjectId ref to User)
- `content` (String)
- `channelId` (ObjectId ref to Channel)
- `isEdited` (Boolean)
- `reactions` (Array of objects tracking emojis and users)
- `timestamps` (CreatedAt / UpdatedAt)

---

## API Endpoints

### Auth
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate and receive JWT

### Workspace
- `POST /api/workspaces` - Create a new workspace
- `GET /api/workspaces` - Retrieve workspaces the user is a member of
- `POST /api/workspaces/join` - Join workspace via invite code

### Channels
- `POST /api/channels` - Create an organizing channel inside a workspace
- `GET /api/channels/:workspaceId` - Get list of channels for a workspace

### Messages
- `POST /api/messages` - Send a text payload to a channel
- `GET /api/messages/:channelId` - Retrieve historical message thread for a channel
- `PUT /api/messages/:id` - Edit an existing message payload
- `DELETE /api/messages/:id` - Delete a specific message
- `POST /api/messages/:id/react` - Toggle an emoji reaction on a message

---

## Security

- Passwords are salted and hashed using **bcryptjs** before storage.
- Authentication utilizes stateless **JWT-based authentication**.
- Protected API routes strictly enforce `authMiddleware` to reject unauthenticated requests.
- **Workspace Access Control Validated**: Database queries rigorously check that the requesting user `_id` is inside the workspace `members` array before disclosing channel/message data.

---

## Local Setup Instructions

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and **MongoDB** installed on your system.

### 2. Backend Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key
   JWT_EXPIRES_IN=30d
   FRONTEND_URL=http://localhost:5173
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `client` directory:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```

---

## Socket Event Reference
* `join_channel`: Sent by client to subscribe to a specific channel room.
* `send_message`: Broadcasts a new chat payload to the room.
* `receive_message`: Emitted to all clients in the room to render the new text.
* `message_updated`: Synchronizes edited message text across clients.
* `message_deleted`: Instructs all clients in the room to wipe a specific message ID.
* `message_reaction`: Updates the active emoji counter metrics.
* `typing`: Toggles the UI typing indicator on/off for specific users.

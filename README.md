# EduQuest

EduQuest is a computer science education platform featuring interactive coding environments, competitive programming modes, and AI-assisted learning tools.

## Key Features

### Interactive Coding Playgrounds
- Support for HTML, CSS, JavaScript, and Python
- Real-time code compilation and testing
- Progressive difficulty challenges
- Automated testing and immediate feedback

### Competitive Programming
- Multiple competition modes including Classic, Scenario, Debug Detective, Production Outage, Code Refactor, and Missing Link
- Real-time multiplayer synchronization
- Global and friend leaderboards

### AI-Assisted Learning
- Structured course generation based on user-provided topics
- PDF processing for automated summarization and quiz generation
- Context-aware progressive hints for problem solving

### Social and Gamification
- Experience points (XP) and level progression
- Achievement badges and daily streaks
- Social feeds, discussion forums, and peer connections

## System Architecture

- **Frontend**: React, Vite, Tailwind CSS, Radix UI, Redux Toolkit, Monaco Editor, Socket.io Client
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.io, JSON Web Tokens (JWT)
- **External Integrations**: Google Gemini API, Cloudinary, Piston Code Executor, Google OAuth

## Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- MongoDB 5.0 or higher (local or cloud instance)
- Google AI API Key

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd eduQuest
   ```

2. Install dependencies:
   ```bash
   # Install root dependencies
   npm install

   # Install client dependencies
   cd client
   npm install

   # Install server dependencies
   cd ../server
   npm install
   ```

## Configuration

Copy the example environment files and configure the necessary variables.

**Server Environment (`server/.env`)**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/eduquest
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=7d
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_AI_API_KEY=your-gemini-api-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLIENT_URL=http://localhost:5173
```

**Client Environment (`client/.env`)**
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## Running the Application

Start the development servers:

```bash
# Start backend server
cd server
npm run dev

# Start frontend development server in a new terminal
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## API Structure

The backend provides the following main API routes:
- `/api/v1/auth`: Registration, login, and Google OAuth
- `/api/v1/playground`: Coding problems, submissions, and progress tracking
- `/api/v1/competition`: Competition room management and real-time event handling
- `/api/v1/ai`: Course generation, PDF processing, and dynamic question generation

## Testing

```bash
# Run client tests
cd client
npm test

# Run server tests
cd ../server
npm test
```

## License

This project is licensed under the ISC License. See the LICENSE file for details.

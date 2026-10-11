# Tandemly

Tandemly is a full-stack web application that enables users to exchange knowledge through peer-to-peer skill sharing. The platform connects individuals who want to learn a particular skill with those who are willing to teach it. Instead of relying solely on paid learning platforms, Tandemly promotes collaborative learning by allowing users to teach, learn, and grow together within a community-driven ecosystem.

The application uses a token-based model where users earn tokens by teaching others and spend tokens to learn new skills. This approach encourages active participation while maintaining a balanced exchange of knowledge.

## Problem Statement

Many learners struggle to find affordable, personalized learning opportunities, while individuals with valuable skills often lack an effective platform to share their expertise. Existing online learning platforms primarily focus on instructor-led courses and offer limited opportunities for direct peer collaboration.

Tandemly addresses this problem by providing a platform where users can connect based on complementary skills, making learning more accessible, interactive, and community-driven.

## Features

* User registration and authentication using JWT
* Secure password hashing with bcrypt
* User profile creation and management
* Add and manage teachable and learning skills
* Skill-based user discovery
* Peer matching based on user interests
* Send, accept, and manage learning requests
* Token-based reward system
* User dashboard with personalized information
* Search and filter users by skills
* Responsive user interface

## Technology Stack

### Frontend

* React.js
* TypeScript
* Tailwind CSS
* Axios

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Authentication

* JSON Web Tokens (JWT)
* bcrypt

## Installation

Clone the repository.

```bash
git clone https://github.com/your-username/tandemly.git
```

Install dependencies for both the frontend and backend.

```bash
npm install
```

Configure the required environment variables.

```env
PORT=
MONGODB_URI=
JWT_SECRET=
CLIENT_URL=
```

Start the development servers.

```bash
npm run dev
```

## Future Enhancements

* AI-based skill recommendations
* Real-time messaging
* Video calling for learning sessions
* Session scheduling and calendar integration
* User ratings and feedback
* Notification system
* Learning progress tracking
* Payment gateway integration for purchasing tokens
* Group learning sessions
* Administrative dashboard

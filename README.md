# Low Level Quest

A platform for learning and practicing low-level programming concepts through interactive coding challenges.

## Features

### Current Functionality

#### Problem Categories
- Memory Management
- Data Structures
- Algorithms

#### User Management
- User registration and authentication
- Progress tracking per category
- Problem completion status

#### Problem Solving
- Interactive code editor
- Real-time code execution
- Test case validation
- Hints system
- Problem difficulty levels

#### Community Features
- Discussion board per problem
- Comment system
- User progress tracking

### API Endpoints

#### Authentication
```
POST /api/auth/register
- Register a new user
- Body: { username, email, password }
- Returns: { token, user }

POST /api/auth/login
- Login existing user
- Body: { email, password }
- Returns: { token, user }

GET /api/auth/profile
- Get current user profile
- Headers: Authorization: Bearer <token>
- Returns: { user }
```

#### Problems
```
GET /api/problems
- Get all problems
- Query params: { category, difficulty }
- Returns: [{ id, title, description, difficulty, category }]

GET /api/problems/:id
- Get specific problem details
- Returns: { problem, testCases: [...], hints: [...] }

POST /api/problems/:id/run
- Run code against test cases
- Body: { code }
- Returns: { success, output, error, testResults }

POST /api/problems/:id/submit
- Submit solution for verification
- Body: { code }
- Returns: { success, solved, testResults }
```

#### Categories
```
GET /api/categories
- Get all categories
- Returns: [{ id, name, description }]

GET /api/categories/:id/problems
- Get problems in category
- Returns: [{ id, title, difficulty }]
```

#### User Progress
```
GET /api/progress
- Get user's overall progress
- Headers: Authorization: Bearer <token>
- Returns: { categoriesProgress: [...], problemsSolved, totalAttempts }

GET /api/progress/:categoryId
- Get progress in specific category
- Headers: Authorization: Bearer <token>
- Returns: { problemsSolved, totalAttempts, lastActivity }
```

#### Discussions
```
GET /api/problems/:id/discussions
- Get discussions for a problem
- Returns: [{ id, title, content, user, comments: [...] }]

POST /api/problems/:id/discussions
- Create new discussion
- Body: { title, content }
- Headers: Authorization: Bearer <token>
- Returns: { discussion }

POST /api/discussions/:id/comments
- Add comment to discussion
- Body: { content }
- Headers: Authorization: Bearer <token>
- Returns: { comment }
```

#### Hints
```
GET /api/problems/:id/hints
- Get hints for a problem
- Headers: Authorization: Bearer <token>
- Returns: [{ content, orderNumber }]
```

## Database Schema

The platform uses PostgreSQL with the following main tables:
- categories
- problems
- test_cases
- users
- user_problem_status
- user_progress
- discussions
- comments
- hints

## Future Enhancements

### Planned Features
1. **Advanced Code Execution**
   - Support for multiple programming languages
   - Interactive debugging capabilities
   - Memory usage visualization

2. **Learning Path**
   - Structured learning tracks
   - Prerequisites system
   - Difficulty progression

3. **Social Features**
   - User rankings and leaderboards
   - Achievement system
   - Code sharing and collaboration

4. **Content Enhancement**
   - Video explanations
   - Interactive tutorials
   - More problem categories
   - Community-contributed problems

5. **Performance Optimization**
   - Code execution sandboxing
   - Caching system
   - Rate limiting

6. **UI/UX Improvements**
   - Dark mode
   - Customizable editor themes
   - Mobile responsiveness
   - Accessibility features

### API Enhancements
1. **User Management**
   - Password reset
   - Email verification
   - OAuth integration
   - Profile customization

2. **Problem Management**
   - Problem creation interface
   - Test case generation
   - Custom input testing

3. **Analytics**
   - User performance metrics
   - Problem difficulty analysis
   - Learning progress tracking

## Getting Started

### Prerequisites
- Node.js
- PostgreSQL
- npm or yarn

### Installation
1. Clone the repository
```bash
git clone https://github.com/yourusername/low-level-quest.git
```

2. Install dependencies
```bash
cd low-level-quest
npm install
```

3. Set up the database
```bash
psql -d lowlevel_quest -f database_dump.sql
```

4. Start the development server
```bash
npm run dev
```

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
# Mesmerize Quiz App - Backend

## Overview
This is a Node.js/Express backend API that serves educational quiz packages to the Mesmerize mobile app. The backend manages package metadata, serves package content, and handles package distribution. It uses MongoDB for data storage and provides RESTful APIs for package management.

**Tech Stack:**
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB
- **Development**: Nodemon for hot reloading
- **Build**: TypeScript compilation with tsx

## Project Structure

```
backend/
├── src/
│   ├── models/             # Data models and schemas
│   ├── packages/           # Package management logic
│   │   ├── package.router.ts    # API routes
│   │   └── package.service.ts   # Business logic
│   ├── utils/              # Utility functions
│   │   └── mongo.ts        # Database connection
│   ├── index.ts            # Main server file
│   └── index.html          # Basic HTML page (unused)
├── package.json            # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── nodemon.json           # Development configuration
└── process-env.d.ts       # Environment variable types
```

## Server Architecture

### Main Server (`src/index.ts`)
**Purpose**: Express server setup and configuration

**Configuration**:
```typescript
const PORT = process.env.PORT || "8080";
const HOST = process.env.HOST || "0.0.0.0";
```

**Middleware Stack**:
1. **CORS**: Allows all origins (`origin: '*'`) - needs security improvement
2. **JSON Parser**: Handles JSON payloads up to 50MB
3. **URL Encoded**: Handles form data
4. **Package Router**: Routes `/api/packages/*` requests

**Server Features**:
- Environment-based configuration
- CORS enabled for cross-origin requests
- Large payload support for package data
- Modular router architecture

### Database Connection (`src/utils/mongo.ts`)
**Purpose**: MongoDB connection management

**Implementation**:
```typescript
const mongo: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.DATABASE_URL!);
```

**Database Structure**:
- **Database Name**: `packages`
- **Collections**:
  - `package-info`: Package metadata and configuration
  - `[package-name]`: Individual package content (dynamic collection names)

**Connection Pattern**:
- Connect before operations
- Close after operations (finally block)
- Environment variable for connection string

## Package Management System

### Package Router (`src/packages/package.router.ts`)
**Purpose**: RESTful API endpoints for package operations

#### Routes:

##### GET `/api/packages/`
**Purpose**: Retrieve all available packages
**Response**: Array of package metadata objects
**Usage**: Frontend store screen loads available packages

**Example Response**:
```json
[
  {
    "title": "World Capitals",
    "name": "world-capitals",
    "attributes": [...],
    "divisions": [...],
    "version": "1.0.0",
    "has_maps": true
  }
]
```

##### GET `/api/packages/:name`
**Purpose**: Download specific package content
**Parameters**: `name` - Package identifier
**Response**: Array of package items (questions/answers)
**Usage**: Frontend downloads full package data

**Example Response**:
```json
[
  {
    "name": "Paris",
    "capital": "France",
    "population": 2161000,
    "continent": "Europe",
    "mappable": true,
    "weight": 1
  }
]
```

### Package Service (`src/packages/package.service.ts`)
**Purpose**: Business logic for package operations

#### Functions:

##### `getAvailablePackages()`
**Purpose**: Fetch all package metadata
**Process**:
1. Connect to MongoDB
2. Query `package-info` collection
3. Return all package metadata
4. Close connection

**Database Query**:
```typescript
const pack = database.collection("package-info");
const available = await pack.find(query).toArray();
```

##### `getPackage(name: string)`
**Purpose**: Fetch specific package content
**Process**:
1. Connect to MongoDB
2. Query collection named after package
3. Return all package items
4. Close connection

**Database Query**:
```typescript
const pack = database.collection(name);
const countries = await pack.find(query).toArray();
```

## Data Models

### Package Metadata Structure
**Collection**: `package-info`

**Schema**:
```typescript
{
  title: string,           // Display name
  name: string,           // Unique identifier
  attributes: Array<{     // Available fields
    name: string,
    title: string,
    type: string,
    question: boolean,
    answer: boolean
  }>,
  divisions: Array<{       // Filtering options
    name: string,
    title: string,
    options: Array<{
      name: string,
      title: string
    }>
  }>,
  accepted: Array<string>, // Alternative answers
  test_division: string,   // Test-specific division
  has_maps: boolean,       // Map support flag
  test_time: number,       // Test time limit
  sort_attr: string,       // Sorting attribute
  ranged: string,          // Range filtering attribute
  version: string          // Package version
}
```

### Package Content Structure
**Collection**: `[package-name]` (dynamic)

**Schema**:
```typescript
{
  name: string,           // Item identifier
  [attribute]: any,       // Dynamic attributes based on package
  mappable: boolean,      // Map display capability
  weight: number,         // Question selection weight
  accepted?: Array<string> // Alternative answers
}
```

**Example Package Content**:
```typescript
// World Capitals package
{
  name: "Paris",
  capital: "France",
  population: 2161000,
  continent: "Europe",
  mappable: true,
  weight: 1,
  accepted: ["French Republic"]
}
```

## API Design Patterns

### RESTful Design
- **GET** for data retrieval
- **POST** for data creation (future)
- **PUT** for updates (future)
- **DELETE** for removal (future)

### Error Handling
**Pattern**:
```typescript
try {
  const result = await operation();
  return res.status(200).json(result);
} catch (error: any) {
  console.log(error.message);
  return res.status(500).send(error.message);
}
```

**Error Types**:
- **500**: Server errors (database, connection)
- **200**: Success responses
- **404**: Not found (future implementation)

### Response Format
- **Success**: JSON data with appropriate status
- **Error**: Error message with 500 status
- **Consistent**: All endpoints follow same pattern

## Database Architecture

### MongoDB Collections

#### Package Info Collection
**Name**: `package-info`
**Purpose**: Package metadata and configuration
**Indexes**: `name` (unique identifier)

**Sample Document**:
```json
{
  "_id": ObjectId("..."),
  "title": "World Capitals",
  "name": "world-capitals",
  "attributes": [
    {
      "name": "capital",
      "title": "Capital City",
      "type": "string",
      "question": true,
      "answer": true
    }
  ],
  "divisions": [
    {
      "name": "continent",
      "title": "Continent",
      "options": [
        {"name": "Europe", "title": "Europe"},
        {"name": "Asia", "title": "Asia"}
      ]
    }
  ],
  "version": "1.0.0",
  "has_maps": true
}
```

#### Package Content Collections
**Name**: `[package-name]` (e.g., `world-capitals`)
**Purpose**: Actual package data items
**Indexes**: `name` (item identifier)

**Sample Document**:
```json
{
  "_id": ObjectId("..."),
  "name": "Paris",
  "capital": "France",
  "population": 2161000,
  "continent": "Europe",
  "mappable": true,
  "weight": 1
}
```

### Data Relationships
- **One-to-Many**: Package info → Package items
- **Dynamic Schema**: Package content varies by package type
- **Versioning**: Package metadata includes version info

## Environment Configuration

### Required Environment Variables
```bash
DATABASE_URL=mongodb://localhost:27017/packages
PORT=8080
HOST=0.0.0.0
```

### Development Setup
**Nodemon Configuration** (`nodemon.json`):
```json
{
  "watch": ["src"],
  "ext": ".ts,.js",
  "ignore": [],
  "exec": "npx tsx ./src/index.ts"
}
```

**TypeScript Configuration** (`tsconfig.json`):
- Target: ES2020
- Module: CommonJS
- Strict mode enabled
- Source maps for debugging

## Security Considerations

### Current Security Issues
1. **CORS**: Allows all origins (`origin: '*'`)
2. **No Authentication**: No user verification
3. **No Rate Limiting**: No request throttling
4. **No Input Validation**: No data sanitization

### Recommended Improvements
1. **CORS**: Restrict to specific domains
2. **Authentication**: JWT or session-based auth
3. **Rate Limiting**: Prevent abuse
4. **Input Validation**: Sanitize all inputs
5. **HTTPS**: Encrypt all communications
6. **Environment Variables**: Secure configuration

## Performance Considerations

### Database Optimization
- **Connection Pooling**: Reuse connections
- **Indexing**: Add indexes on frequently queried fields
- **Query Optimization**: Limit returned fields
- **Caching**: Implement Redis for frequently accessed data

### API Optimization
- **Pagination**: Limit large result sets
- **Compression**: Enable gzip compression
- **Caching Headers**: Add appropriate cache headers
- **Response Size**: Monitor payload sizes

## Development Workflow

### Local Development
1. **Start MongoDB**: Local or cloud instance
2. **Set Environment**: Configure DATABASE_URL
3. **Install Dependencies**: `npm install`
4. **Start Development**: `npm run dev`
5. **Hot Reload**: Nodemon watches for changes

### Package Management
1. **Add Package**: Insert metadata into `package-info`
2. **Create Collection**: Create collection with package name
3. **Insert Data**: Add package items to collection
4. **Test API**: Verify endpoints work correctly

### Database Operations
```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017/packages

# View package info
db.getCollection("package-info").find({})

# View package content
db.getCollection("world-capitals").find({})
```

## Deployment Considerations

### Production Setup
1. **Environment Variables**: Secure configuration
2. **Process Manager**: PM2 or similar
3. **Reverse Proxy**: Nginx for load balancing
4. **SSL Certificate**: HTTPS encryption
5. **Database**: MongoDB Atlas or managed instance
6. **Monitoring**: Log aggregation and monitoring

### Scaling Strategies
1. **Horizontal Scaling**: Multiple server instances
2. **Database Sharding**: Distribute data across shards
3. **CDN**: Static asset delivery
4. **Caching**: Redis for session and data caching

## API Documentation

### Endpoints Summary

| Method | Endpoint | Purpose | Response |
|--------|----------|---------|----------|
| GET | `/api/packages/` | List available packages | Array of package metadata |
| GET | `/api/packages/:name` | Download package content | Array of package items |

### Error Codes
- **200**: Success
- **500**: Internal server error
- **404**: Package not found (future)

### Response Examples
See Package Router section for detailed examples.

## Future Enhancements

### Planned Features
1. **Package CRUD**: Create, update, delete packages
2. **User Management**: Authentication and authorization
3. **Analytics**: Usage tracking and statistics
4. **Package Versioning**: Version management system
5. **Admin Panel**: Web interface for package management
6. **API Documentation**: Swagger/OpenAPI documentation

### Technical Improvements
1. **TypeScript Strict**: Enhanced type safety
2. **Testing**: Unit and integration tests
3. **Logging**: Structured logging system
4. **Monitoring**: Health checks and metrics
5. **Documentation**: Comprehensive API docs

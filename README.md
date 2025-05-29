# REviewer 2.0
## Description
**REviewer 2.0** is your personal web application for creating, managing, and sharing reviews for various types of content. 
The platform allows users to share their opinions on movies, books, games, and tv series - and to create their personal journal by doing so.

###  Key Features
- **User Authentication:** Secure registration and login system with JWT-based authorization
- **Review Management:** Create, read, update, and delete reviews with media attachments
- **Role-Based Access Control:** Different permissions for regular users and administrators
- **Admin Panel:** Comprehensive tools for user management and activity monitoring
- **Responsive UI:** Modern interface that works on desktop and mobile devices
- **Comprehensive Logging:** Detailed activity logs for users, reviews, and administrative actions
- **REST API:** Well-documented API with Swagger/OpenAPI integration

# Run instruction:
### Frontend:
`cd frontend`
`npm install`
`npm start`

### Backend:
`mvn clean install`
`mvn spring-boot:run`

# List of used tools and technologies within the project:
### Backend
- **Spring Boot** - framework
- **Spring Security** - authentication and security
- **Spring Data JPA** - warstwa dostępu do danych
- **Jakarta** - ORM (mapping objects to database entities) (specification)
- **Hibernate** ORM (implementation)
- **JWT** - secure tokens
- **Lombok** - helper, significatnly reduces redundant code (getters, setters, etc.)
- **PostgreSQL** - database

### Frontend
- **React** - highly-supported frontend JS library
- **React Router** - navigation
- **CSS** - stylizing
- **JavaScript** - frontend

### Narzędzia i infrastruktura
- **Maven** - build automation and project management tool
- **Git** - version control
- **REST API** - communication backend->frontend

## API Documentation

The API documentation is available through Swagger/OpenAPI at:

```
http://localhost:8080/api/docs
```

The raw API specification is available at:

```
http://localhost:8080/api-docs
```

## Documentation Features

The API documentation provides:

1. **Complete Endpoint Listing** with all available operations
2. **Parameter Details** for each endpoint
3. **Response Status Codes** (200, 400, 404, 422, etc.) with descriptions
4. **Example Request/Response Bodies**
5. **Authentication Requirements**
6. **Interactive Testing** capability

## Authentication

Most endpoints require authentication using JWT tokens. The documentation includes:

- How to obtain a JWT token via the login endpoint
- How to refresh a token using the refresh token endpoint
- How to include the token in subsequent requests

## Key Endpoints

### Authentication

- `POST /api/users/login` - User login
- `POST /api/users/register` - User registration
- `POST /api/users/logout` - User logout
- `POST /api/users/refresh` - Refresh JWT token
- `POST /api/users/revoke-refresh` - Revoke refresh token

### Reviews

- `GET /api/reviews` - Get all reviews
- `POST /api/reviews` - Create a new review
- `GET /api/reviews/{reviewId}` - Get a specific review
- `PUT /api/reviews/{reviewId}` - Update a review
- `DELETE /api/reviews/{reviewId}` - Delete a review
- `GET /api/reviews/latest` - Get the latest reviews
- `GET /api/reviews/user/{userId}` - Get reviews by a specific user

### User Management

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/{id}` - Get a specific user
- `PUT /api/users/{id}/role` - Update a user's role (admin only)
- `DELETE /api/users/{id}` - Delete a user (admin only)
- `GET /api/users/search` - Search for users

### Logs

- `GET /api/logs/users` - Get all user logs (admin only)
- `GET /api/logs/reviews` - Get all review logs (admin only)
- `GET /api/logs/admin` - Get all admin logs (admin only)

## Error Handling

The API provides standardized error responses with appropriate HTTP status codes:

- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Authentication required or token expired
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation errors
- `500 Internal Server Error` - Server-side issues

Each error response includes a descriptive message to help diagnose the issue.

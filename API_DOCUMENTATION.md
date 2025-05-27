# REviewer 2.0 API Documentation

## Overview

REviewer 2.0 provides a comprehensive REST API for managing user accounts, reviews, and administrative functions.

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

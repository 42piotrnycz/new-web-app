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

# List of used tools and technologies within the project:
### Backend
- **Spring Boot** - framework
- **Spring Security** - authentication and security
- **Spring Data JPA** - data access layer
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

![ERD Diagram](https://github.com/42piotrnycz/new-web-app/blob/feat(%236)-final-fixes/src/main/resources/static/postgres.png)

## SQL CLONE CODE:

create sequence users_id_seq;

alter sequence users_id_seq owner to postgres;

create table users
(
    id       integer default nextval('users_id_seq'::regclass) not null
        primary key,
    password varchar(255)                                      not null,
    username varchar(255)                                      not null
        constraint uk_r43af9ap4edm43mmtq01oddj6
            unique,
    email    varchar(255),
    role     varchar(255)
);

alter table users
    owner to postgres;

alter sequence users_id_seq owned by users.id;

create table reviews
(
    "reviewID"          integer generated always as identity
        primary key,
    "userID"            integer not null
        constraint "userID"
            references users,
    "contentType"       text    not null,
    "contentTitle"      text    not null,
    "reviewTitle"       text,
    "reviewDescription" text    not null,
    "coverFile"         varchar(255)
);

alter table reviews
    owner to postgres;

create table "userLogs"
(
    "logID"   integer generated always as identity
        primary key,
    "userID"  integer                  not null,
    operation text                     not null,
    date      timestamp with time zone not null
);

alter table "userLogs"
    owner to postgres;

create table "reviewLogs"
(
    "logID"    integer generated always as identity
        primary key,
    "reviewID" integer                  not null,
    operation  text                     not null,
    date       timestamp with time zone not null
);

alter table "reviewLogs"
    owner to postgres;

create table "adminLogs"
(
    "logID"   integer generated always as identity
        primary key,
    "userID"  integer                  not null,
    operation text                     not null,
    date      timestamp with time zone not null
);

alter table "adminLogs"
    owner to postgres;

create table "refreshTokens"
(
    "tokenID"    bigserial
        primary key,
    "createdAt"  timestamp(6) not null,
    "expiryDate" timestamp(6) not null,
    revoke       boolean      not null,
    token        varchar(500) not null
        constraint uk_hoqia4lrlabslq9yymy7nlino
            unique,
    "userID"     integer      not null
        constraint "FKhj05usp8tloagjkhatqfjly18"
            references users
);

alter table "refreshTokens"
    owner to postgres;

create function log_user_change() returns trigger
    language plpgsql
as
$$BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public."userLogs" ("userID", operation, date)
        VALUES (NEW.id, 'REGISTERED', CURRENT_TIMESTAMP);
        RETURN NEW;

    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public."userLogs" ("userID", operation, date)
        VALUES (OLD.id, 'DELETED', CURRENT_TIMESTAMP);
        RETURN OLD;

    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public."userLogs" ("userID", operation, date)
        VALUES (NEW.id, 'MODIFIED', CURRENT_TIMESTAMP);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;$$;

alter function log_user_change() owner to postgres;

create trigger "onInsert"
    after insert
    on users
    for each row
execute procedure log_user_change();

create trigger "onDelete"
    after delete
    on users
    for each row
execute procedure log_user_change();

create trigger "onUpdate"
    after update
    on users
    for each row
execute procedure log_user_change();

create function log_user_role_change() returns trigger
    language plpgsql
as
$$BEGIN
    IF TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role THEN
        INSERT INTO public."userLogs" ("userID", operation, date)
        VALUES (
            NEW.id,
            FORMAT('ROLE CHANGE FROM ''%s'' TO ''%s''', OLD.role, NEW.role),
            CURRENT_TIMESTAMP
        );
    END IF;

    RETURN NEW;
END;$$;

alter function log_user_role_change() owner to postgres;

create trigger "onRoleChange"
    after update
    on users
    for each row
execute procedure log_user_role_change();

create function log_review() returns trigger
    language plpgsql
as
$$BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public."reviewLogs" ("reviewID", operation, date)
        VALUES (NEW."reviewID", 'CREATED', CURRENT_TIMESTAMP);
        RETURN NEW;

    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public."reviewLogs" ("reviewID", operation, date)
        VALUES (OLD."reviewID", 'DELETED', CURRENT_TIMESTAMP);
        RETURN OLD;

    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public."reviewLogs" ("reviewID", operation, date)
        VALUES (NEW."reviewID", 'MODIFIED', CURRENT_TIMESTAMP);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;$$;

alter function log_review() owner to postgres;

create trigger "onInsert"
    after insert
    on reviews
    for each row
execute procedure log_review();

create trigger "onUpdate"
    after update
    on reviews
    for each row
execute procedure log_review();

create trigger "onDelete"
    before delete
    on reviews
    for each row
execute procedure log_review();

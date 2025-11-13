# Library Management API

## Overview
- Backend service for managing authors and books in a library catalogue.
- Built with Express and MongoDB, exposing RESTful endpoints for CRUD operations.
- Validates requests with `celebrate`/`Joi`, logs activity via `morgan`, and supports Cloudinary uploads for author photos.
- Provides search and pagination across books, with optional filtering by title or author.

## Tech Stack
- Node.js 20+, Express 5
- MongoDB with Mongoose ODM
- Celebrate/Joi validation middleware
- Cloudinary + Multer for file storage
- CORS, dotenv, morgan for cross-cutting concerns

## Project Structure
```
taski_technologies_assesment/
├── index.js                   # App bootstrap & middleware setup
├── src/
│   ├── config/db.js           # MongoDB connection helper
│   ├── controllers/           # Route handlers for authors & books
│   ├── helper/multer.js       # Cloudinary-backed file upload config
│   ├── models/                # Mongoose schemas (Author, Book)
│   └── routes/                # Route definitions and router aggregator
└── package.json
```

## Request Flow
1. Client sends HTTP request to `/api/*`.
2. Celebrate validates `params`, `query`, and `body` data before invoking controllers.
3. Controllers perform:
   - Input normalization (e.g. trimming strings, enforcing date formats).
   - Cross-entity checks (e.g. verifying referenced author).
   - Database persistence via Mongoose models.
4. Responses are serialized JSON payloads with HTTP status codes (201 for creates, 200 for reads/updates, etc.).
5. Errors bubble to Express error handler; celebrate provides 400-level responses for validation errors, while custom checks return descriptive messages.

## Features
- Create/list authors with optional biography and profile image.
- Upload author profile pictures directly to Cloudinary.
- Create/list/update/delete books tied to existing authors.
- Search books by title or author name, with server-side pagination.
- Centralized input validation and human-readable error messages.
- Environment-driven configuration for DB and Cloudinary credentials.

## Prerequisites
- Node.js ≥ 20
- npm ≥ 9
- MongoDB cluster or Atlas connection string
- Cloudinary account (for author profile images)

## Getting Started
```bash
# install dependencies
npm install

# run the development server (nodemon)
npm start
```

The server listens on the port defined in `.env` (defaults to `7000`) and exposes a health message at `/`.

## Environment Variables
Create a `.env` file in the project root with:

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | Port for the Express server (defaults to 7000). |
| `DBURL` | Yes | MongoDB connection string. |
| `CLOUD_NAME` | Yes | Cloudinary cloud name. |
| `CLOUDINARY_KEY` | Yes | Cloudinary API key. |
| `CLOUDINARY_SECRET` | Yes | Cloudinary API secret. |

## API Reference
All endpoints are prefixed with `/api`.

### Authors
- `POST /api/newAuthor`
  - Form-data fields: `name` (string, required), `bio` (string), `dob` (YYYY-MM-DD, required), `profilePic` (file, optional).
  - Validation: rejects duplicate names and invalid dates.
  - Response: `201 Created` with the stored author document.

- `GET /api/authors?search=<string>`
  - Query: optional `search` string (case-insensitive).
  - Response: array of matching authors.

### Books
- `POST /api/newBook`
  - JSON body: `{ "title": "...", "genre": "...", "publishedAt": "YYYY-MM-DD", "author": "<authorId>" }`.
  - Requires an existing author ID; enforces unique title and date format.
  - Response: `201 Created` with populated author reference.

- `GET /api/getBooks?title=&author=&page=&limit=`
  - Query parameters:
    - `title`, `author` (optional strings for partial, case-insensitive search).
    - `page` (default 1) and `limit` (default 10) for pagination.
  - Response shape:
```json
{
  "data": [
    {
      "_id": "bookId",
      "title": "Example",
      "genre": "Fiction",
      "publishedAt": "2024-09-01",
      "author": {
        "_id": "authorId",
        "name": "Author Name",
        "bio": "...",
        "dob": "1990-01-01",
        "profilePic": "https://res.cloudinary.com/..."
      }
    }
  ],
  "pagination": {
    "total": 12,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

- `PUT /api/editBook/:id`
  - Path params: `id` (book `_id`).
  - Body: any subset of `title`, `genre`, `publishedAt`, `author`.
  - Performs uniqueness/date/author checks before update.

- `DELETE /api/removeBook/:id`
  - Path params: `id` (book `_id`).
  - Removes the book if it exists.

## Validation & Error Handling
- Celebrate generates 400 responses for malformed payloads; error payload follows `{ "validation": { ... } }`.
- Controllers return 4xx/5xx responses with `{ "error": "<message>" }` when business rules fail.
- Multer enforces a 24 MB upload limit and returns `{ "message": "File size should not exceed 24MB!" }` when exceeded.
- Unhandled errors propagate to Express' default error handler after logging.

## Logging & Monitoring
- `morgan` logs every HTTP request in `combined` format.
- MongoDB connection logs success/failure via console.

## Future Enhancements (Ideas)
- Add automated tests (Jest/Supertest) for controllers and routes.
- Introduce authentication/authorization for protected operations.
- Serve Swagger/OpenAPI documentation for faster integration.
- Implement rate limiting and caching for popular endpoints.


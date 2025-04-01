# PDF to XML Converter Backend

This is the backend service for the PDF to XML converter application. It provides APIs for user authentication and PDF conversion functionality.

## Features

- User registration and authentication with JWT
- PDF file upload and conversion to XML
- Conversion history management
- Secure file handling and validation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

3. Create an `uploads` directory in the root folder:
```bash
mkdir uploads
```

## Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user

### PDF Conversion
- POST `/api/conversions/convert` - Upload and convert PDF to XML
- GET `/api/conversions/history` - Get user's conversion history
- GET `/api/conversions/:id` - Get specific conversion details

## Error Handling

The application includes comprehensive error handling for:
- Invalid file types
- File size limits
- Authentication errors
- Database errors
- PDF processing errors

## Security Features

- JWT-based authentication
- Password hashing
- File type validation
- File size limits
- Secure file storage
- User data isolation

## Dependencies

- express: Web framework
- mongoose: MongoDB ODM
- jsonwebtoken: JWT authentication
- multer: File upload handling
- pdf-parse: PDF parsing
- zod: Input validation
- bcryptjs: Password hashing
- cors: Cross-origin resource sharing
- dotenv: Environment variable management 
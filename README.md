# PDF to XML Converter

A full-stack web application that allows users to convert PDF documents to structured XML format. Built with React, Node.js, and MongoDB.

## 🌟 Features

### Level 1 Implementation
- ✅ User Authentication (Login/Register)
- ✅ PDF File Upload
- ✅ Basic PDF to XML Conversion
- ✅ Conversion History
- ✅ Download Converted Files

### Level 2 Implementation
- ✅ JWT Authentication
- ✅ Enhanced PDF to XML Conversion
- ✅ Multi-page Support
- ✅ Sidebar Navigation
- ✅ XML Preview
- ✅ Error Handling
- ✅ User Profile Management

### Level 3 Implementation
- ✅ Advanced PDF Parsing (Tables, Lists)
- ✅ Real-time Conversion Status
- ✅ Responsive Design
- ✅ XML Search & Filter
- ✅ Progress Indicators

## 🚀 Getting Started

### Prerequisites
- Node.js (v20 or higher)
- MongoDB
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/SachinM44/pdf-xml-converter.git
cd pdf-xml-converter
```

2. Install Backend Dependencies
```bash
cd backend
npm install
```

3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

4. Environment Setup
   
Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
```

### Running the Application

1. Start the Backend Server
```bash
cd backend
npm run dev
```

2. Start the Frontend Development Server
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`

## 🛠️ Technology Stack

### Frontend
- React
- Vite
- React Router DOM
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express
- MongoDB
- JWT Authentication
- Multer (File Upload)

## 📁 Project Structure

```
pdf-xml-converter/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   ├── .env
│   └── package.json
└── README.md
```

## 🔒 Security Features
- JWT Authentication
- Password Hashing
- Protected Routes
- File Type Validation
- Error Handling
- Input Sanitization

## 💻 Development

### Running Tests
```bash
# Backend Tests
cd backend
npm test

# Frontend Tests
cd frontend
npm test
```

### Code Style
The project uses ESLint and Prettier for code formatting. Run:
```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

## 🚀 Deployment

The application can be deployed using platforms like:
- Frontend: Vercel, Netlify
- Backend: Heroku, Railway
- Database: MongoDB Atlas

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Sachin M** - *Initial work* - [SachinM44](https://github.com/SachinM44)

## 🙏 Acknowledgments

- PDF.js for PDF parsing
- React community for excellent tools and libraries
- MongoDB for reliable database service 
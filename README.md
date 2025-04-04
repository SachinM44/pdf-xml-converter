# PDF to XML Converter

A full-stack web application that allows users to convert PDF documents to structured XML format. Built with React, Node.js, and MongoDB.


The application is deployed and available at: [https://pdf-xml-converter.netlify.app](https://pdf-xml-converter.netlify.app)

## ⚠️ Important Note for First-Time Users

This application uses a secure HTTPS connection with a self-signed certificate for the backend API. When you first visit the site, you'll need to accept the certificate:

1. Visit [https://13.60.82.211/api/health](https://13.60.82.211/api/health) directly
2. Click "Advanced" in the browser warning
3. Click "Proceed" to accept the certificate

**Why a self-signed certificate?** 
- We implemented HTTPS to ensure secure data transmission between the frontend and backend
- The self-signed certificate provides encryption without the cost of a commercial certificate
- This approach demonstrates security best practices in a development environment
- In a production environment, we would use a proper CA-issued certificate

This implementation showcases both security awareness and a practical solution for secure API communication in a development context.

## 📋 Challenge Implementation

This project was developed for the "Full Stack Developer Intern Coding Challenge" and implements the **Level 3 (Advanced Implementation)** requirements. The key features include:

- Advanced PDF parsing that preserves complex formatting (tables, lists, styling)
- XML output that closely mirrors the PDF's structure and layout
- Interactive multi-page viewer for both PDFs and converted XML
- Real-time conversion status updates
- Advanced filtering and searching of conversion history
- Comprehensive error handling and edge cases
- Responsive design that works well on mobile devices

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
- ✅ Secure HTTPS Communication
- ✅ Continuous Server Operation (PM2)

## 📝 Approach to PDF-to-XML Conversion

The conversion process involves several steps:

1. **Document Parsing**: Using a specialized PDF parsing library to extract structured content
2. **Structure Identification**: Analyzing the document to identify headers, paragraphs, tables, lists, and other elements
3. **XML Generation**: Creating a well-formed XML document that preserves the document hierarchy
4. **Styling Preservation**: Maintaining font information, colors, and other styling elements
5. **Layout Maintenance**: Preserving the spatial relationships between elements

The conversion is performed asynchronously, allowing users to continue using the application while their documents are being processed.

## 🔒 Security Features
- JWT Authentication
- Password Hashing
- Protected Routes
- File Type Validation
- Error Handling
- Input Sanitization
- HTTPS with SSL/TLS Encryption
- Nginx Reverse Proxy
- Proper CORS Configuration

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
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
- PM2 Process Manager
- Nginx (Reverse Proxy)
- SSL/TLS for HTTPS

## 📁 Project Structure

```
pdf-xml-converter/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── index.js
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

The application is deployed on:
- Frontend: Netlify ([https://pdf-xml-converter.netlify.app](https://pdf-xml-converter.netlify.app))
- Backend: AWS EC2 instance with PM2 for 24/7 operation
- Database: MongoDB Atlas
- Security: Nginx reverse proxy with SSL/TLS

## 🔍 Limitations and Future Improvements

### Limitations
- Currently supports PDFs up to 5MB in size
- Complex tables with merged cells may not preserve exact structure
- Some highly specialized PDF features may not be fully supported
- Using a self-signed certificate (would use a proper CA certificate in production)

### Future Improvements
- Add batch processing for multiple files
- Implement user-defined XML templates
- Add additional export formats (JSON, CSV)
- Improve performance for very large documents
- Add collaborative features for team environments
- Replace self-signed certificate with a CA-issued certificate

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
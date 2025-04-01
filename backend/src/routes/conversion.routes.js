const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const Conversion = require('../models/conversion.model');
const auth = require('../middleware/auth.middleware');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload and convert PDF
router.post('/convert', auth, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded' });
    }

    console.log('File received:', req.file);

    // Create conversion record
    const conversion = new Conversion({
      userId: req.user._id,
      originalFileName: req.file.originalname,
      originalFileUrl: `/uploads/${req.file.filename}`,
      status: 'pending'
    });
    await conversion.save();

    // Process PDF in background
    processPDF(req.file.path, conversion._id).catch(error => {
      console.error('PDF processing error:', error);
      Conversion.findByIdAndUpdate(conversion._id, {
        status: 'failed',
        error: error.message
      }).exec();
    });

    res.status(202).json({
      message: 'PDF upload successful, conversion in progress',
      conversionId: conversion._id
    });
  } catch (error) {
    console.error('Upload error:', error);
    // Clean up uploaded file if it exists
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    res.status(500).json({ 
      message: 'Error processing PDF upload',
      error: error.message 
    });
  }
});

// Get user's conversion history
router.get('/history', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const conversions = await Conversion.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(conversions);
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ message: 'Error fetching conversion history' });
  }
});

// Get specific conversion
router.get('/:id', auth, async (req, res) => {
  try {
    const conversion = await Conversion.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!conversion) {
      return res.status(404).json({ message: 'Conversion not found' });
    }

    res.json(conversion);
  } catch (error) {
    console.error('Conversion fetch error:', error);
    res.status(500).json({ message: 'Error fetching conversion' });
  }
});

// Download converted XML
router.get('/:id/download', auth, async (req, res) => {
  try {
    const conversion = await Conversion.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!conversion) {
      return res.status(404).json({ message: 'Conversion not found' });
    }

    if (conversion.status !== 'completed') {
      return res.status(400).json({ message: 'Conversion is not completed yet' });
    }

    // Set headers for XML download
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename=${conversion.originalFileName.replace('.pdf', '.xml')}`);
    
    // Send the XML content
    res.send(conversion.convertedXml);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Error downloading conversion' });
  }
});

// Helper function to process PDF
async function processPDF(filePath, conversionId) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

    // Convert to XML (basic structure)
    const xml = convertToXML(data);

    // Update conversion record
    await Conversion.findByIdAndUpdate(conversionId, {
      convertedXml: xml,
      status: 'completed'
    }).exec();

    // Clean up the file after processing
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting processed file:', err);
    });
  } catch (error) {
    console.error('PDF processing error:', error);
    throw new Error('Error processing PDF: ' + error.message);
  }
}

// Helper function to escape XML special characters
function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '') // Remove surrogate pairs
    .replace(/[\uFDD0-\uFDEF\uFFFE\uFFFF\u0000]/g, ''); // Remove non-characters
}

// Helper function to convert PDF data to XML
function convertToXML(data) {
  // Basic XML structure
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<document>\n';
  
  // Add metadata
  xml += '  <metadata>\n';
  xml += `    <title>${escapeXml(data.info?.Title || 'Untitled')}</title>\n`;
  xml += `    <author>${escapeXml(data.info?.Author || 'Unknown')}</author>\n`;
  xml += `    <pages>${data.numpages}</pages>\n`;
  xml += `    <creationDate>${escapeXml(data.info?.CreationDate || 'Unknown')}</creationDate>\n`;
  xml += `    <modificationDate>${escapeXml(data.info?.ModDate || 'Unknown')}</modificationDate>\n`;
  xml += '  </metadata>\n';

  // Add content
  xml += '  <content>\n';
  
  // Split text into paragraphs and process each page
  const pages = data.text.split('\n\n\n');
  pages.forEach((page, index) => {
    xml += `    <page number="${index + 1}">\n`;
    const paragraphs = page.split('\n\n');
    paragraphs.forEach(paragraph => {
      if (paragraph.trim()) {
        // Clean up the paragraph text
        const cleanParagraph = paragraph.trim()
          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
          .replace(/[\r\n]+/g, ' '); // Replace newlines with space
        xml += `      <paragraph>${escapeXml(cleanParagraph)}</paragraph>\n`;
      }
    });
    xml += '    </page>\n';
  });

  xml += '  </content>\n';
  xml += '</document>';
  
  return xml;
}

module.exports = router; 
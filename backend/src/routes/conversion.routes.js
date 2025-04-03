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

// ✅ Apply auth ONLY to protected routes, NOT globally
router.post('/convert', auth, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded' });
    }

    console.log('File received:', req.file);

    const conversion = new Conversion({
      userId: req.user._id,
      originalFileName: req.file.originalname,
      originalFileUrl: `/uploads/${req.file.filename}`,
      status: 'pending'
    });
    await conversion.save();

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

// ✅ Apply auth to conversion history
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

// ✅ Apply auth to get specific conversion
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

// ✅ Apply auth to download converted XML
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

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename=${conversion.originalFileName.replace('.pdf', '.xml')}`);
    
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

    const xml = convertToXML(data);

    await Conversion.findByIdAndUpdate(conversionId, {
      convertedXml: xml,
      status: 'completed'
    }).exec();

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
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')
    .replace(/[\uFDD0-\uFDEF\uFFFE\uFFFF\u0000]/g, '');
}

// Helper function to convert PDF data to XML
function convertToXML(data) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<document>\n';

  xml += '  <metadata>\n';
  xml += `    <title>${escapeXml(data.info?.Title || 'Untitled')}</title>\n`;
  xml += `    <author>${escapeXml(data.info?.Author || 'Unknown')}</author>\n`;
  xml += `    <pages>${data.numpages}</pages>\n`;
  xml += `    <creationDate>${escapeXml(data.info?.CreationDate || 'Unknown')}</creationDate>\n`;
  xml += `    <modificationDate>${escapeXml(data.info?.ModDate || 'Unknown')}</modificationDate>\n`;
  xml += '  </metadata>\n';

  xml += '  <content>\n';

  const pages = data.text.split('\n\n\n');
  pages.forEach((page, index) => {
    xml += `    <page number="${index + 1}">\n`;
    const lines = page.split('\n');
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;
      xml += `      <paragraph>${escapeXml(trimmedLine)}</paragraph>\n`;
    });
    xml += '    </page>\n';
  });

  xml += '  </content>\n';
  xml += '</document>';

  return xml;
}

module.exports = router;

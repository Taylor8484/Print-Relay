const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const storage = require('node-persist');
const bonjour = require('bonjour')();

const execAsync = promisify(exec);
const app = express();
const PORT = process.env.PORT || 5000;

// Initialize node-persist for configuration storage
storage.init({
  dir: './printer-config',
  stringify: JSON.stringify,
  parse: JSON.parse,
  encoding: 'utf8',
  logging: false,
  ttl: false,
  expiredInterval: 2 * 60 * 1000,
  forgiveParseErrors: false
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const upload = multer({
  dest: '/tmp/printer-uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  }
});

// ============================================
// API ROUTES
// ============================================

/**
 * GET /api/printers
 * Returns a list of available CUPS printers
 */
app.get('/api/printers', async (req, res) => {
  try {
    const { stdout } = await execAsync('lpstat -p');

    // Parse lpstat output
    // Example output:
    // printer HP_LaserJet is idle.  enabled since ...
    // printer Brother_Printer disabled since ...

    const printers = [];
    const lines = stdout.split('\n').filter(line => line.trim());

    for (const line of lines) {
      const match = line.match(/^printer\s+(\S+)\s+(.*)/);
      if (match) {
        const name = match[1];
        const status = match[2];
        const isEnabled = status.includes('idle') || status.includes('printing');

        printers.push({
          name,
          status: isEnabled ? 'enabled' : 'disabled',
          rawStatus: status
        });
      }
    }

    res.json({ printers });
  } catch (error) {
    // If lpstat fails (no printers or CUPS not running)
    console.error('Error fetching printers:', error);
    res.status(500).json({
      error: 'Failed to retrieve printers',
      message: error.message,
      printers: []
    });
  }
});

/**
 * POST /api/config
 * Save printer configuration
 * Body: { printerName: "My_Printer" }
 */
app.post('/api/config', async (req, res) => {
  try {
    const { printerName } = req.body;

    if (!printerName) {
      return res.status(400).json({ error: 'printerName is required' });
    }

    // Save to persistent storage
    await storage.setItem('selectedPrinter', printerName);

    res.json({
      success: true,
      message: `Printer "${printerName}" saved successfully`,
      printerName
    });
  } catch (error) {
    console.error('Error saving printer config:', error);
    res.status(500).json({
      error: 'Failed to save printer configuration',
      message: error.message
    });
  }
});

/**
 * GET /api/config
 * Get current printer configuration
 */
app.get('/api/config', async (req, res) => {
  try {
    const printerName = await storage.getItem('selectedPrinter');

    if (!printerName) {
      return res.json({
        configured: false,
        printerName: null
      });
    }

    res.json({
      configured: true,
      printerName
    });
  } catch (error) {
    console.error('Error retrieving printer config:', error);
    res.status(500).json({
      error: 'Failed to retrieve printer configuration',
      message: error.message
    });
  }
});

/**
 * POST /api/print
 * Print a document to the configured printer
 * Body: multipart/form-data with 'file' and 'copies' fields
 */
app.post('/api/print', upload.single('file'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get printer name from storage
    const printerName = await storage.getItem('selectedPrinter');

    if (!printerName) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        error: 'No printer configured. Please configure a printer first using /api/config'
      });
    }

    // Get number of copies (default to 1)
    const copies = parseInt(req.body.copies) || 1;

    // Validate copies
    if (copies < 1 || copies > 999) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Copies must be between 1 and 999' });
    }

    // Build lp command
    const filePath = req.file.path;
    const command = `lp -d "${printerName}" -n ${copies} "${filePath}"`;

    console.log(`Executing print command: ${command}`);

    // Execute print command
    const { stdout, stderr } = await execAsync(command);

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    // lp command returns "request id is ..." on success
    const jobIdMatch = stdout.match(/request id is (.+)/);
    const jobId = jobIdMatch ? jobIdMatch[1].trim() : 'unknown';

    res.json({
      success: true,
      message: `Print job submitted successfully`,
      jobId,
      printer: printerName,
      copies,
      fileName: req.file.originalname
    });

  } catch (error) {
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error('Error printing:', error);
    res.status(500).json({
      error: 'Failed to print document',
      message: error.message
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ============================================
// STATIC FILE SERVING (React App)
// ============================================

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all handler for React Router (client-side routing)
// Must be AFTER API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ============================================
// ERROR HANDLING
// ============================================

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`PrintRelay server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

  // Advertise service via mDNS/Bonjour
  bonjour.publish({
    name: 'PrintRelay',
    type: 'http',
    port: PORT,
    txt: {
      path: '/',
      version: '1.0.0'
    }
  });

  console.log(`mDNS: Service advertised as printrelay.local`);
  console.log(`Access via: http://printrelay.local:${PORT}`);
});

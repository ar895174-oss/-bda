const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Serve the main dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to analyze a binary
app.post('/api/analyze', async (req, res) => {
  const { binaryPath, sampleTime, referenceDep } = req.body;

  if (!binaryPath) {
    return res.status(400).json({ error: 'binaryPath is required' });
  }

  try {
    const rexeOutput = await runBinaryTool('rexe', ['-t', sampleTime || '300', binaryPath]);
    const rdepOutput = await runBinaryTool('rdep', ['-d', referenceDep || 'default', binaryPath]);

    res.json({
      success: true,
      binary: path.basename(binaryPath),
      sampleTime: sampleTime || 300,
      rexeOutput,
      rdepOutput,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to get binary info
app.post('/api/info', async (req, res) => {
  const { binaryPath } = req.body;

  if (!binaryPath) {
    return res.status(400).json({ error: 'binaryPath is required' });
  }

  try {
    const output = await runBinaryTool('rinfo', [binaryPath]);
    res.json({
      success: true,
      binary: path.basename(binaryPath),
      info: output
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to list available binaries
app.get('/api/binaries', (req, res) => {
  const binsDir = path.join(__dirname, 'bins');
  try {
    const binaries = fs.readdirSync(binsDir).filter(f => {
      const stat = fs.statSync(path.join(binsDir, f));
      return stat.isFile() && f !== '.gitkeep';
    });
    res.json({ success: true, binaries });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to run BDA tools
function runBinaryTool(tool, args) {
  return new Promise((resolve, reject) => {
    const binaryPath = path.join(__dirname, 'bins', tool);
    const process = spawn(binaryPath, args, { 
      env: { ...process.env, RUST_LOG: 'info' },
      timeout: 60000 
    });

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    process.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`${tool} failed with code ${code}: ${stderr}`));
      } else {
        resolve({ stdout, stderr });
      }
    });

    process.on('error', (err) => {
      reject(err);
    });
  });
}

app.listen(PORT, () => {
  console.log(`🚀 BDA Dashboard running at http://localhost:${PORT}`);
  console.log(`📊 Open your browser to explore binary dependencies`);
});

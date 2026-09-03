# BDA Dashboard - Quick Start Guide

A modern, web-based interface for Binary Dependence Analysis. Visualize dependencies like a map!

## 🚀 Quick Start

### Prerequisites
1. **radare2** - Install as described in main README
2. **Node.js** - v14+ required

### Installation

```bash
# 1. Install Node.js dependencies
npm install

# 2. Make binaries executable
chmod +x bins/rexe bins/rdep bins/rgdb bins/rinfo
```

### Run the Dashboard

```bash
# Start the server
npm start

# Development mode with auto-reload
npm run dev
```

The dashboard will be available at **http://localhost:3000**

## 📊 Features

### 🎨 Interactive Dependency Graph
- **Visual node-edge representation** of binary dependencies (like Google Maps for code)
- **Color-coded relationships**:
  - 🟢 Green: Valid dependencies
  - 🔴 Red: Missing dependencies
  - 🟡 Yellow: Extra dependencies
- **Drag, zoom, and pan** through the dependency map
- **Hover for details** on each connection

### 📈 Live Statistics
- Reference dependency count
- Missing dependencies found
- Extra dependencies detected
- Real-time analysis status

### 📋 Data Table View
- Browse all dependencies in tabular format
- Filter and sort results
- Quick status overview

### 📝 Live Logs
- Real-time execution logs
- Error tracking
- Performance metrics

## 🎯 How to Use

### Analyze a Binary

1. **Enter Binary Path**
   ```
   /path/to/your/binary
   ```

2. **Configure Analysis**
   - **Sample Time**: Sampling duration in milliseconds (default: 300)
   - **Reference Dependencies**: Path to reference dependency file (default: "default")

3. **Click "Analyze Binary"**
   - Watch the progress in logs
   - Graph populates automatically

### Explore Results

- **Dependency Graph Tab**: See the visual map of dependencies
- **Data Table Tab**: Browse all relationships in detail
- **Logs Tab**: Review execution details and any issues

### Get Binary Info

- Click **"ℹ️ Get Info"** for binary metadata
- Useful for verification before analysis

## 🎮 Keyboard Shortcuts

In the graph view:
- **Drag**: Move nodes
- **Scroll**: Zoom in/out
- **Click & Drag Background**: Pan the view
- **Click Node**: Select/highlight
- **Double-click**: Expand connections

## 📱 Responsive Design

- Works on desktop, tablet, and mobile
- Sidebar converts to horizontal layout on smaller screens
- Touch-friendly interaction

## ⚙️ API Endpoints

### POST `/api/analyze`
Analyze a binary executable

**Request:**
```json
{
  "binaryPath": "/path/to/binary",
  "sampleTime": 300,
  "referenceDep": "default"
}
```

**Response:**
```json
{
  "success": true,
  "binary": "binary_name",
  "sampleTime": 300,
  "rexeOutput": { "stdout": "...", "stderr": "..." },
  "rdepOutput": { "stdout": "...", "stderr": "..." },
  "timestamp": "2026-09-03T..."
}
```

### POST `/api/info`
Get binary metadata

**Request:**
```json
{
  "binaryPath": "/path/to/binary"
}
```

**Response:**
```json
{
  "success": true,
  "binary": "binary_name",
  "info": { "stdout": "...", "stderr": "..." }
}
```

### GET `/api/binaries`
List available binaries in the `bins/` directory

**Response:**
```json
{
  "success": true,
  "binaries": ["rexe", "rdep", "rgdb", "rinfo"]
}
```

## 🛠️ Development

### Modify UI
- Edit `public/index.html` for structure
- Edit `public/styles.css` for styling
- Edit `public/app.js` for functionality

### Modify Backend
- Edit `server.js` for API logic
- Add new endpoints as needed
- Server automatically restarts on file changes (with nodemon)

## 🐛 Troubleshooting

### "Binary not found"
- Ensure the full path to your binary is correct
- Check permissions: `chmod +x /path/to/binary`

### "Analysis failed"
- Ensure radare2 is installed correctly
- Check logs tab for detailed error messages
- Verify binary is actually an executable

### "Server won't start"
- Check if port 3000 is already in use: `lsof -i :3000`
- Change port: `PORT=3001 npm start`

### Graph not rendering
- Try switching tabs or refreshing the page
- Check browser console (F12) for JavaScript errors
- Ensure JavaScript and WebGL are enabled

## 📦 Dependencies

- **Express.js**: Web server
- **vis.js**: Network graph visualization
- **CORS**: Cross-origin requests
- **body-parser**: JSON parsing

## 📚 Learn More

- [BDA README](README.md) - Main project documentation
- [radare2 Documentation](https://rada.re/r/)
- [vis.js Network Documentation](https://visjs.github.io/vis-network/docs/network/)

## 💡 Tips

1. **Batch Analysis**: Open multiple windows to analyze different binaries side-by-side
2. **Export Results**: Take screenshots of the graph for reports
3. **Custom Sample Times**: Lower values = faster but less accurate; higher = slower but more thorough
4. **Large Binaries**: May take longer to visualize; be patient with the progress logs

---

**Happy analyzing! 🎉**

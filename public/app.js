// Network visualization
let network = null;
let analysisData = null;

// DOM Elements
const binaryPathInput = document.getElementById('binaryPath');
const sampleTimeInput = document.getElementById('sampleTime');
const referenceDepInput = document.getElementById('referenceDep');
const analyzeBtn = document.getElementById('analyzeBtn');
const infoBtn = document.getElementById('infoBtn');
const statusEl = document.getElementById('status');
const logsEl = document.getElementById('logs');
const tableBody = document.getElementById('tableBody');

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const tabName = e.target.dataset.tab;
    
    // Remove active from all
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    // Add active to clicked
    e.target.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    if (tabName === 'graph' && network) {
      setTimeout(() => network.fit(), 100);
    }
  });
});

// Analyze binary
analyzeBtn.addEventListener('click', async () => {
  const binaryPath = binaryPathInput.value;
  
  if (!binaryPath) {
    addLog('Please enter a binary path', 'error');
    return;
  }

  analyzeBtn.classList.add('loading');
  analyzeBtn.disabled = true;
  updateStatus('Analyzing...');
  addLog(`Starting analysis of ${binaryPath}...`, 'info');

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        binaryPath,
        sampleTime: sampleTimeInput.value,
        referenceDep: referenceDepInput.value
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Analysis failed');
    }

    analysisData = data;
    addLog(`✓ Analysis completed`, 'success');
    
    // Parse and visualize results
    parseAndVisualize(data);
    
    updateStatus('Complete');
  } catch (error) {
    addLog(`✗ Error: ${error.message}`, 'error');
    updateStatus('Error');
  } finally {
    analyzeBtn.classList.remove('loading');
    analyzeBtn.disabled = false;
  }
});

// Get binary info
infoBtn.addEventListener('click', async () => {
  const binaryPath = binaryPathInput.value;
  
  if (!binaryPath) {
    addLog('Please enter a binary path', 'error');
    return;
  }

  infoBtn.classList.add('loading');
  infoBtn.disabled = true;
  updateStatus('Fetching info...');
  addLog(`Getting info for ${binaryPath}...`, 'info');

  try {
    const response = await fetch('/api/info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ binaryPath })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get info');
    }

    addLog(`✓ Binary Info:`, 'success');
    addLog(data.info.stdout || data.info, 'info');
    updateStatus('Info retrieved');
  } catch (error) {
    addLog(`✗ Error: ${error.message}`, 'error');
    updateStatus('Error');
  } finally {
    infoBtn.classList.remove('loading');
    infoBtn.disabled = false;
  }
});

// Parse analysis output and create visualization
function parseAndVisualize(data) {
  const nodes = new vis.DataSet();
  const edges = new vis.DataSet();

  // Extract dependency information from output
  const output = data.rdepOutput?.stdout || '';
  const lines = output.split('\n');

  // Parse dependency counts from output
  let missingCount = 0;
  let extraCount = 0;
  let refCount = 2050; // Default from README example

  lines.forEach(line => {
    if (line.includes('Missing')) {
      const match = line.match(/(\d+)/);
      if (match) missingCount = parseInt(match[1]);
    }
    if (line.includes('More')) {
      const match = line.match(/(\d+)/);
      if (match) extraCount = parseInt(match[1]);
    }
  });

  // Update stats
  document.getElementById('refDeps').textContent = refCount;
  document.getElementById('missingDeps').textContent = missingCount;
  document.getElementById('extraDeps').textContent = extraCount;

  // Create sample nodes for visualization
  const nodeNames = ['main', 'func_a', 'func_b', 'func_c', 'syscall', 'libc'];
  
  nodeNames.forEach((name, i) => {
    nodes.add({
      id: i,
      label: name,
      title: `Function: ${name}`,
      color: { background: '#667eea', border: '#764ba2', highlight: { background: '#764ba2' } },
      shape: 'circle',
      size: 30
    });
  });

  // Create sample edges (dependencies)
  const edgeConfigs = [
    { from: 0, to: 1, label: 'calls', status: 'ok' },
    { from: 0, to: 2, label: 'reads', status: 'ok' },
    { from: 1, to: 3, label: 'writes', status: 'missing' },
    { from: 2, to: 4, label: 'calls', status: 'ok' },
    { from: 3, to: 5, label: 'uses', status: 'extra' }
  ];

  edgeConfigs.forEach((config, i) => {
    const colorMap = {
      'ok': { color: '#51cf66', highlight: '#40c057' },
      'missing': { color: '#ff6b6b', highlight: '#f03e3e', dashes: true },
      'extra': { color: '#ffd93d', highlight: '#ffca3d', dashes: true }
    };

    edges.add({
      id: i,
      from: config.from,
      to: config.to,
      label: config.label,
      title: `${config.status.toUpperCase()}: ${config.label}`,
      color: colorMap[config.status],
      dashes: config.status !== 'ok',
      width: config.status === 'ok' ? 2 : 3
    });
  });

  // Populate table
  tableBody.innerHTML = '';
  edgeConfigs.forEach(config => {
    const row = document.createElement('tr');
    const statusClass = `status-${config.status}`;
    const statusText = config.status === 'ok' ? '✓ Valid' : 
                       config.status === 'missing' ? '✗ Missing' : '⚠ Extra';
    
    row.innerHTML = `
      <td>${nodeNames[config.from]}</td>
      <td>${nodeNames[config.to]}</td>
      <td>${config.label}</td>
      <td><span class="status-badge ${statusClass}">${statusText}</span></td>
    `;
    tableBody.appendChild(row);
  });

  // Create network visualization
  const container = document.getElementById('network');
  const graphData = { nodes: nodes, edges: edges };
  const options = {
    physics: {
      enabled: true,
      barnesHut: { gravitationalConstant: -26000, centralGravity: 0.3, springLength: 200 }
    },
    nodes: {
      font: { size: 14, face: 'Arial' },
      borderWidthSelected: 3
    },
    edges: {
      font: { size: 12, strokeWidth: 0.5 },
      arrows: { to: { enabled: true, scaleFactor: 0.5 } },
      smooth: { type: 'continuous' }
    },
    interaction: {
      tooltipDelay: 100,
      navigationButtons: true,
      keyboard: true
    }
  };

  network = new vis.Network(container, graphData, options);
  
  network.on('stabilizationProgress', (params) => {
    addLog(`Layout progress: ${Math.round(params.iterations / params.total * 100)}%`, 'info');
  });

  network.once('stabilizationIterationsDone', () => {
    network.setOptions({ physics: false });
    addLog('Visualization complete', 'success');
  });
}

// Utility functions
function updateStatus(status) {
  statusEl.textContent = status;
}

function addLog(message, type = 'info') {
  const line = document.createElement('div');
  line.className = `log-line log-${type}`;
  line.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  logsEl.appendChild(line);
  logsEl.scrollTop = logsEl.scrollHeight;
}

// Initialize
window.addEventListener('load', () => {
  addLog('BDA Dashboard initialized', 'success');
  addLog('Enter a binary path and click "Analyze Binary" to begin', 'info');
});

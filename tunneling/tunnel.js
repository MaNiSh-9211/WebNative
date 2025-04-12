window.addEventListener('DOMContentLoaded', () => {
    const portInput = document.getElementById('portInput');
    const startBtn = document.getElementById('start-tunnel');
    const stopBtn = document.getElementById('stop-tunnel');
    const logDiv = document.getElementById('log');
    const incBtn = document.getElementById('increase');
    const decBtn = document.getElementById('decrease');
  
    let tunnelSuccess = false;
    let tunnelUrl = '';
  
    const clearLog = () => {
      logDiv.innerHTML = '';
    };
  
    const appendLog = (message, isUrl = false) => {
      const el = document.createElement('div');
      el.textContent = message;
      el.style.marginBottom = '10px';
      el.style.fontWeight = isUrl ? 'bold' : 'normal';
      logDiv.appendChild(el);
  
      if (isUrl) {
        const copyBtn = document.createElement('button');
        copyBtn.textContent = '📋 Copy URL';
        copyBtn.style.marginLeft = '10px';
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(message);
          copyBtn.textContent = '✅ Copied!';
          setTimeout(() => copyBtn.textContent = '📋 Copy URL', 2000);
        };
        logDiv.appendChild(copyBtn);
      }
  
      logDiv.scrollTop = logDiv.scrollHeight;
    };
  
    startBtn.addEventListener('click', () => {
      const port = portInput.value.trim();
      tunnelSuccess = false;
      tunnelUrl = '';
      clearLog();
  
      if (!port) {
        appendLog("❌ Please enter a port number.");
        return;
      }
  
      appendLog(`⚙️ Starting Cloudflare tunnel on port: ${port}`);
      window.electron.startCloudflareTunnel(port);
    });
  
    stopBtn.addEventListener('click', () => {
      appendLog("🛑 Stopping Cloudflare tunnel...");
      window.electron.stopCloudflareTunnel();
    });
  
    window.electron.onCloudflareTunnelLog((log) => {
      if (!tunnelSuccess && log.includes("Your quick Tunnel has been created")) {
        tunnelSuccess = true;
      }
  
      if (tunnelSuccess && !tunnelUrl && log.includes("https://")) {
        const match = log.match(/https:\/\/[^\s|]+\.trycloudflare\.com/);
        if (match && match[0]) {
          tunnelUrl = match[0];
          clearLog();
          appendLog("✅ Tunnel created successfully!");
          appendLog(tunnelUrl, true);
          window.open(tunnelUrl, '_blank');
        }
      }
    });
  
    window.electron.onCloudflareTunnelUrl((url) => {
      if (!tunnelUrl) {
        tunnelUrl = url;
        clearLog();
        appendLog("✅ Tunnel created successfully!");
        appendLog(url, true);
        window.open(url, '_blank');
      }
    });
  
    incBtn.addEventListener('click', () => {
      portInput.stepUp();
    });
  
    decBtn.addEventListener('click', () => {
      portInput.stepDown();
    });
  });
  
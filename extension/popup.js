document.getElementById('startBtn').addEventListener('click', () => {
    const statusEl = document.getElementById('status');
    statusEl.innerText = 'Initializing...';

    chrome.runtime.sendMessage({ action: 'START_RECORDING' }, (response) => {
        if (response && response.success) {
            statusEl.innerText = 'Recording...';
            window.close(); // Close popup to show recording
        } else {
            statusEl.innerText = 'Error: ' + (response?.error || 'Failed to start');
        }
    });
});

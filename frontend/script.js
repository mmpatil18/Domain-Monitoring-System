// API Base URL
const API_BASE = '';

// DOM Elements
const keywordForm = document.getElementById('keyword-form');
const keywordsInput = document.getElementById('keywords-input');
const csvFileInput = document.getElementById('csv-file');
const uploadArea = document.getElementById('upload-area');
const uploadBtn = document.getElementById('upload-btn');
const clearBtn = document.getElementById('clear-btn');
const scanNowBtn = document.getElementById('scan-now-btn');
const refreshBtn = document.getElementById('refresh-btn');
const downloadBtn = document.getElementById('download-btn');
const resultsBody = document.getElementById('results-body');
const loading = document.getElementById('loading');
const noResults = document.getElementById('no-results');
const resultsTableWrapper = document.getElementById('results-table-wrapper');
const toast = document.getElementById('toast');

// Status elements
const keywordsCount = document.getElementById('keywords-count');
const domainsCount = document.getElementById('domains-count');
const emailStatus = document.getElementById('email-status');

// Logs & Help Elements
const logsBtn = document.getElementById('open-logs-btn');
const logsModal = document.getElementById('logs-modal');
const closeLogsBtn = document.getElementById('close-logs');
const refreshLogsBtn = document.getElementById('refresh-logs-btn');
const clearLogsBtn = document.getElementById('clear-logs-btn');
const logsArea = document.getElementById('system-logs');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Settings Elements
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
// Note: querySelector('.close') finds the first one (Settings close button)
// We should probably be more specific, but index.html has class="close" for settings and id="close-logs" for logs
const closeSettingsBtn = document.getElementById('close-settings');
const settingsForm = document.getElementById('settings-form');
const testEmailBtn = document.getElementById('test-email-btn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadStatus();
    loadResults();

    // Auto-refresh every 30 seconds
    setInterval(() => {
        loadStatus();
        loadResults();
    }, 30000);
});

// Keyword Form Submit
keywordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const keywordsText = keywordsInput.value.trim();

    if (!keywordsText) {
        showToast(`Please enter at least one keyword`, 'error');
        return;
    }

    const keywords = keywordsText.split(/[\n,]+/).map(k => k.trim()).filter(k => k);

    try {
        const response = await fetch(`${API_BASE}/api/keywords`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keywords }),
        });
        const data = await response.json();
        if (data.success) {
            showToast(data.message, 'success');
            keywordsInput.value = '';
            loadStatus();
        } else {
            showToast(data.error || 'Failed to add keywords', 'error');
        }
    } catch (error) {
        showToast('Error adding keywords: ' + error.message, 'error');
    }
});

// CSV Upload
uploadBtn.addEventListener('click', () => csvFileInput.click());
csvFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
        await uploadCSV(file);
        csvFileInput.value = '';
    }
});

// Drag and Drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});
uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
uploadArea.addEventListener('drop', async (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
        await uploadCSV(file);
    } else {
        showToast('Please upload a CSV file', 'error');
    }
});

async function uploadCSV(file) {
    const formData = new FormData();
    formData.append('file', file);
    try {
        const response = await fetch(`${API_BASE}/api/upload-csv`, { method: 'POST', body: formData });
        const data = await response.json();
        if (data.success) {
            showToast(data.message, 'success');
            loadStatus();
        } else {
            showToast(data.error || 'Failed to upload CSV', 'error');
        }
    } catch (error) {
        showToast('Error uploading CSV: ' + error.message, 'error');
    }
}

// Load Status
async function loadStatus() {
    try {
        const response = await fetch(`${API_BASE}/api/status`);
        const data = await response.json();
        if (data.success) {
            keywordsCount.textContent = data.status.keywords_count;
            domainsCount.textContent = data.status.domains_found;
            if (data.status.email_configured) {
                emailStatus.textContent = '✅ Email Alerts Active';
                emailStatus.style.color = '#10b981';
            } else {
                emailStatus.innerHTML = '⚠️ Enter Email to Get Alerts';
                emailStatus.style.color = '#f59e0b'; // Amber color
                emailStatus.style.cursor = 'pointer';
                emailStatus.onclick = () => {
                    const settingsBtn = document.getElementById('settings-btn');
                    if (settingsBtn) settingsBtn.click();
                };
            }
        }
    } catch (error) {
        console.error('Error loading status:', error);
    }
}

// Load Results
async function loadResults() {
    loading.style.display = 'block';
    noResults.style.display = 'none';
    resultsTableWrapper.style.display = 'none';
    try {
        const response = await fetch(`${API_BASE}/api/results`);
        const data = await response.json();
        loading.style.display = 'none';
        if (data.success && data.results.length > 0) {
            displayResults(data.results);
        } else {
            noResults.style.display = 'block';
        }
    } catch (error) {
        loading.style.display = 'none';
        showToast('Error loading results: ' + error.message, 'error');
    }
}

function displayResults(results) {
    resultsBody.innerHTML = '';
    results.forEach(result => {
        const row = document.createElement('tr');
        const notifiedBadge = result.notified
            ? '<span class="badge badge-success">✓ Sent</span>'
            : '<span class="badge badge-pending">Pending</span>';

        row.innerHTML = `
            <td><strong>${result.domain}</strong></td>
            <td>${result.keyword}</td>
            <td>${new Date(result.checked_date).toLocaleString()}</td>
            <td>${notifiedBadge}</td>
        `;
        resultsBody.appendChild(row);
    });
    resultsTableWrapper.style.display = 'block';
}

// Clear Data
clearBtn.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to clear ALL data?')) return;
    try {
        const response = await fetch(`${API_BASE}/api/clear-data`, { method: 'POST' });
        const data = await response.json();
        if (data.success) {
            showToast('All data cleared successfully', 'success');
            loadStatus();
            loadResults();
        } else {
            showToast(data.error, 'error');
        }
    } catch (error) {
        showToast('Error clearing data: ' + error.message, 'error');
    }
});

// Scan Now
scanNowBtn.addEventListener('click', async () => {
    // Check if any keywords exist before scanning
    const currentKeywordCount = parseInt(keywordsCount.textContent) || 0;
    if (currentKeywordCount === 0) {
        showToast('⚠️ Please add at least one keyword before scanning', 'error');
        return;
    }

    scanNowBtn.disabled = true;
    scanNowBtn.textContent = '⏳ Scanning...';
    try {
        const response = await fetch(`${API_BASE}/api/scan-now`, { method: 'POST' });
        const data = await response.json();
        if (data.success) {
            showToast('Scan started!', 'success');
            setTimeout(() => { loadStatus(); loadResults(); }, 5000);
        } else {
            showToast(data.error, 'error');
        }
    } catch (e) { showToast(e.message, 'error'); }
    finally {
        setTimeout(() => { scanNowBtn.disabled = false; scanNowBtn.textContent = '⚡ Scan Now'; }, 3000);
    }
});

// Refresh & Download
refreshBtn.addEventListener('click', () => { loadStatus(); loadResults(); showToast('Refreshed', 'success'); });
downloadBtn.addEventListener('click', () => { window.location.href = `${API_BASE}/api/download-csv`; showToast('Downloading...', 'success'); });

function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// --- LOGS MODAL ---
if (logsBtn) {
    logsBtn.addEventListener('click', () => {
        if (settingsModal) settingsModal.style.display = 'none'; // Close settings if open
        logsModal.style.display = 'block';
        fetchLogs(); // Auto-fetch when opened
    });
}

if (closeLogsBtn) {
    closeLogsBtn.addEventListener('click', () => {
        logsModal.style.display = 'none';
    });
}

// Tab Switching Logic
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const tabId = btn.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
        if (tabId === 'logs-tab') fetchLogs(); // Refresh logs when tab is clicked
    });
});

async function fetchLogs() {
    logsArea.value = "Loading logs...";
    try {
        const response = await fetch(`${API_BASE}/api/logs`);
        const data = await response.json();
        if (data.success) {
            logsArea.value = data.logs || "No logs available yet.";
            logsArea.scrollTop = logsArea.scrollHeight;
        } else {
            logsArea.value = "Failed: " + data.error;
        }
    } catch (e) { logsArea.value = "Error: " + e.message; }
}

refreshLogsBtn.addEventListener('click', fetchLogs);
clearLogsBtn.addEventListener('click', async () => {
    if (!confirm('Clear logs?')) return;
    await fetch(`${API_BASE}/api/logs/clear`, { method: 'POST' });
    logsArea.value = "";
    showToast('Logs cleared', 'success');
});

// --- SETTINGS MODAL ---
settingsBtn.addEventListener('click', async () => {
    if (logsModal) logsModal.style.display = 'none'; // Close logs if open
    settingsModal.style.display = 'block';
    await loadSettings();
});

closeSettingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target == settingsModal) settingsModal.style.display = 'none';
    if (e.target == logsModal) logsModal.style.display = 'none';
});

// Load Settings
async function loadSettings() {
    try {
        const response = await fetch(`${API_BASE}/api/settings`);
        const data = await response.json();
        if (data.success) {
            const s = data.settings;
            document.getElementById('smtp-server').value = s.smtp_server || '';
            document.getElementById('smtp-port').value = s.smtp_port || '';
            document.getElementById('smtp-username').value = s.smtp_username || '';
            document.getElementById('smtp-password').value = s.smtp_password || '';
            document.getElementById('smtp-from').value = s.smtp_from || '';
            document.getElementById('smtp-to').value = s.smtp_to || '';
        }
    } catch (e) { showToast(e.message, 'error'); }
}

// Save Settings
settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const settings = {
        smtp_server: document.getElementById('smtp-server').value,
        smtp_port: parseInt(document.getElementById('smtp-port').value),
        smtp_username: document.getElementById('smtp-username').value,
        smtp_password: document.getElementById('smtp-password').value,
        smtp_from: document.getElementById('smtp-from').value,
        smtp_to: document.getElementById('smtp-to').value
    };
    try {
        await fetch(`${API_BASE}/api/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ settings })
        });
        showToast('Settings saved', 'success');
        settingsModal.style.display = 'none';
        loadStatus();
    } catch (e) { showToast(e.message, 'error'); }
});

// Test Email
testEmailBtn.addEventListener('click', async () => {
    testEmailBtn.disabled = true;
    testEmailBtn.textContent = '⏳ Sending...';
    // Auto-save first using same logic
    const settings = {
        smtp_server: document.getElementById('smtp-server').value,
        smtp_port: parseInt(document.getElementById('smtp-port').value),
        smtp_username: document.getElementById('smtp-username').value,
        smtp_password: document.getElementById('smtp-password').value,
        smtp_from: document.getElementById('smtp-from').value,
        smtp_to: document.getElementById('smtp-to').value
    };
    try {
        await fetch(`${API_BASE}/api/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ settings })
        });
        const res = await fetch(`${API_BASE}/api/test-email`, { method: 'POST' });
        const data = await res.json();
        if (data.success) showToast('Email sent!', 'success');
        else showToast(data.error, 'error');
    } catch (e) { showToast(e.message, 'error'); }
    finally { testEmailBtn.disabled = false; testEmailBtn.textContent = '📧 Test Email'; }
});

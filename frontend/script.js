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
    console.log('Keywords Input:', keywordsText); // Debug logging

    if (!keywordsText) {
        showToast(`Please enter at least one keyword (Input Length: ${keywordsInput.value.length})`, 'error');
        return;
    }

    // Parse keywords (newline or comma separated)
    const keywords = keywordsText
        .split(/[\n,]+/)
        .map(k => k.trim())
        .filter(k => k);

    try {
        const response = await fetch(`${API_BASE}/api/keywords`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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
uploadBtn.addEventListener('click', () => {
    csvFileInput.click();
});

csvFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    await uploadCSV(file);
    csvFileInput.value = '';
});

// Drag and Drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

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
        const response = await fetch(`${API_BASE}/api/upload-csv`, {
            method: 'POST',
            body: formData,
        });

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
            emailStatus.textContent = data.status.email_configured ? '✓ Configured' : '✗ Not Configured';
            emailStatus.style.color = data.status.email_configured ? '#10b981' : '#ef4444';
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

// Display Results
function displayResults(results) {
    resultsBody.innerHTML = '';

    results.forEach(result => {
        const row = document.createElement('tr');

        const domainCell = document.createElement('td');
        domainCell.innerHTML = `<strong>${result.domain}</strong>`;

        const keywordCell = document.createElement('td');
        keywordCell.textContent = result.keyword;

        const dateCell = document.createElement('td');
        const date = new Date(result.checked_date);
        dateCell.textContent = date.toLocaleString();

        const notifiedCell = document.createElement('td');
        notifiedCell.innerHTML = result.notified
            ? '<span class="badge badge-success">✓ Sent</span>'
            : '<span class="badge badge-pending">Pending</span>';

        row.appendChild(domainCell);
        row.appendChild(keywordCell);
        row.appendChild(dateCell);
        row.appendChild(notifiedCell);

        resultsBody.appendChild(row);
    });

    resultsTableWrapper.style.display = 'block';
}

// Clear Data Button
clearBtn.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to clear ALL data? This includes all keywords and discovered domains. This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/clear-data`, {
            method: 'POST'
        });

        const data = await response.json();

        if (data.success) {
            showToast('All data cleared successfully', 'success');
            loadStatus();
            loadResults();
        } else {
            showToast(data.error || 'Failed to clear data', 'error');
        }
    } catch (error) {
        showToast('Error clearing data: ' + error.message, 'error');
    }
});

// Scan Now Button
scanNowBtn.addEventListener('click', async () => {
    scanNowBtn.disabled = true;
    scanNowBtn.textContent = '⏳ Scanning...';

    try {
        const response = await fetch(`${API_BASE}/api/scan-now`, {
            method: 'POST'
        });

        const data = await response.json();

        if (data.success) {
            showToast('Domain scan started! Results will appear shortly...', 'success');

            // Refresh after 5 seconds to show results
            setTimeout(() => {
                loadStatus();
                loadResults();
            }, 5000);
        } else {
            showToast(data.error || 'Failed to start scan', 'error');
        }
    } catch (error) {
        showToast('Error starting scan: ' + error.message, 'error');
    } finally {
        setTimeout(() => {
            scanNowBtn.disabled = false;
            scanNowBtn.textContent = '⚡ Scan Now';
        }, 3000);
    }
});

// Refresh Button
refreshBtn.addEventListener('click', () => {
    loadStatus();
    loadResults();
    showToast('Results refreshed', 'success');
});

// Download CSV
downloadBtn.addEventListener('click', () => {
    window.location.href = `${API_BASE}/api/download-csv`;
    showToast('Downloading CSV...', 'success');
});

// Toast Notification
function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// --- Settings Modal Logic ---

const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.querySelector('.close');
const settingsForm = document.getElementById('settings-form');
const testEmailBtn = document.getElementById('test-email-btn');

// Open Modal
settingsBtn.addEventListener('click', async () => {
    settingsModal.style.display = 'block';
    await loadSettings();
});

// Close Modal
closeSettingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'none';
});

// Close on outside click
window.addEventListener('click', (e) => {
    if (e.target == settingsModal) {
        settingsModal.style.display = 'none';
    }
});

// Load Settings
async function loadSettings() {
    try {
        const response = await fetch(`${API_BASE}/api/settings`);
        const data = await response.json();

        if (data.success) {
            const s = data.settings;
            document.getElementById('smtp-server').value = s.smtp_server;
            document.getElementById('smtp-port').value = s.smtp_port;
            document.getElementById('smtp-username').value = s.smtp_username;
            document.getElementById('smtp-password').value = s.smtp_password;
            document.getElementById('smtp-from').value = s.smtp_from;
            document.getElementById('smtp-to').value = s.smtp_to;
        }
    } catch (error) {
        showToast('Error loading settings: ' + error.message, 'error');
    }
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
        const response = await fetch(`${API_BASE}/api/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ settings })
        });

        const data = await response.json();

        if (data.success) {
            showToast('Settings saved successfully', 'success');
            settingsModal.style.display = 'none';
            loadStatus(); // Update dashboard status
        } else {
            showToast(data.error || 'Failed to save settings', 'error');
        }
    } catch (error) {
        showToast('Error saving settings: ' + error.message, 'error');
    }
});

// Test Email
testEmailBtn.addEventListener('click', async () => {
    testEmailBtn.disabled = true;
    testEmailBtn.textContent = '⏳ Sending...';

    try {
        // Save first (optional, but good practice to test what's potentially about to be saved or what's in input)
        // But for simplicity, we call the test endpoint which uses SAVED config. 
        // So user must save first? Or we send config to test.
        // The endpoint uses stored config. So we should warn user or save temporarily?
        // Let's assume user saved. Or we can just try to save first.

        // Actually, better UX: Send current form data to test
        // But our backend endpoint uses stored config. 
        // Let's autosave first.

        const settings = {
            smtp_server: document.getElementById('smtp-server').value,
            smtp_port: parseInt(document.getElementById('smtp-port').value),
            smtp_username: document.getElementById('smtp-username').value,
            smtp_password: document.getElementById('smtp-password').value,
            smtp_from: document.getElementById('smtp-from').value,
            smtp_to: document.getElementById('smtp-to').value
        };

        // Save first
        await fetch(`${API_BASE}/api/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ settings })
        });

        // Then test
        const response = await fetch(`${API_BASE}/api/test-email`, { method: 'POST' });
        const data = await response.json();

        if (data.success) {
            showToast('Test email sent! Check your inbox.', 'success');
        } else {
            showToast(data.error || 'Failed to send test email', 'error');
        }
    } catch (error) {
        showToast('Error sending test email: ' + error.message, 'error');
    } finally {
        testEmailBtn.disabled = false;
        testEmailBtn.textContent = '📧 Test Email';
    }
});

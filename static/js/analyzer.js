const form = document.getElementById('analyzerForm');
const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const fileName = document.getElementById('fileName');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingMsg = document.getElementById('loadingMsg');

dropZone.addEventListener('dragover', e => {
    e.preventDefault(); dropZone.classList.add('drag');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag'));
dropZone.addEventListener('drop', e => {
    e.preventDefault(); dropZone.classList.remove('drag');
    fileInput.files = e.dataTransfer.files;
    showFileName();
});
fileInput.addEventListener('change', showFileName);

function showFileName() {
    if (fileInput.files[0]) fileName.textContent = '📎 ' + fileInput.files[0].name;
}

const messages = [
    "Extracting text from document...",
    "Analyzing keywords against JD...",
    "Evaluating each section...",
    "Checking grammar...",
    "Generating suggestions...",
    "Almost done..."
];
let msgIdx = 0;
let msgInterval;

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!fileInput.files[0]) { alert('Please upload a resume'); return; }

    const fd = new FormData(form);
    loadingOverlay.style.display = 'flex';
    msgIdx = 0;
    msgInterval = setInterval(() => {
        loadingMsg.textContent = messages[msgIdx % messages.length];
        msgIdx++;
    }, 1800);

    try {
        const res = await fetch('/analyze', { method: 'POST', body: fd });
        const data = await res.json();
        clearInterval(msgInterval);

        if (data.success) {
            loadingMsg.textContent = `✅ Analysis complete! Score: ${data.ats_score}/100. Redirecting...`;
            setTimeout(() => {
                window.location.href = data.editor_url;
            }, 1200);
        } else {
            loadingOverlay.style.display = 'none';
            alert('Error: ' + (data.error || 'Analysis failed'));
        }
    } catch (err) {
        clearInterval(msgInterval);
        loadingOverlay.style.display = 'none';
        alert('Network error: ' + err.message);
    }
});
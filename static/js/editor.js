const canvasArea = document.getElementById('canvasArea');
const saveBtn = document.getElementById('saveBtn');
const reanalyzeBtn = document.getElementById('reanalyzeBtn');
let documentData = null;
const edits = {};

// ========= LOAD DOCUMENT =========
async function loadDocument() {
    try {
        const res = await fetch(`/extract/${FILE_ID}/${EXT}`);
        documentData = await res.json();

        if (documentData.error) {
            canvasArea.innerHTML = `<p style="color:red">Error: ${documentData.error}</p>`;
            return;
        }

        canvasArea.innerHTML = '';
        if (documentData.type === 'pdf') renderPDF();
        else renderDOCX();
    } catch (e) {
        canvasArea.innerHTML = `<p style="color:red">Failed to load: ${e.message}</p>`;
    }
}

function renderPDF() {
    documentData.pages.forEach((page, pIdx) => {
        const wrap = document.createElement('div');
        wrap.className = 'page-wrap';
        wrap.style.width = page.width + 'px';
        wrap.style.height = page.height + 'px';

        const img = document.createElement('img');
        img.src = `/preview/${FILE_ID}/${EXT}/${pIdx}`;
        img.style.width = page.width + 'px';
        img.style.height = page.height + 'px';
        img.onerror = () => { img.alt = 'Preview not available'; };
        wrap.appendChild(img);

        page.texts.forEach((t, tIdx) => {
            if (!t.text.trim()) return;
            const span = document.createElement('div');
            span.className = 'text-overlay';
            span.contentEditable = true;
            span.style.left = t.x + 'px';
            span.style.top = t.y + 'px';
            span.style.width = (t.x2 - t.x) + 'px';
            span.style.height = (t.y2 - t.y) + 'px';
            span.style.fontSize = t.font_size + 'px';
            span.style.lineHeight = (t.y2 - t.y) + 'px';
            span.textContent = t.text;

            span.addEventListener('input', () => {
                edits[`${pIdx}_${tIdx}`] = {
                    page: pIdx, x: t.x, y: t.y,
                    x2: t.x2, y2: t.y2,
                    font_size: t.font_size,
                    new_text: span.textContent
                };
            });
            wrap.appendChild(span);
        });
        canvasArea.appendChild(wrap);
    });
}

function renderDOCX() {
    const container = document.createElement('div');
    container.className = 'docx-editor';
    documentData.paragraphs.forEach((p) => {
        const div = document.createElement('div');
        div.className = 'docx-para';
        div.contentEditable = true;
        div.textContent = p.text || ' ';
        div.dataset.index = p.index;
        div.addEventListener('input', () => {
            edits[p.index] = { index: p.index, new_text: div.textContent };
        });
        container.appendChild(div);
    });
    canvasArea.appendChild(container);
}

// ========= LOAD ANALYSIS =========
async function loadAnalysis() {
    if (!HAS_ANALYSIS) {
        document.getElementById('analysisSidebar').innerHTML =
            '<p style="padding:20px;color:#888">No analysis data available.</p>';
        return;
    }
    try {
        const res = await fetch(`/get_analysis/${FILE_ID}`);
        const data = await res.json();
        if (data.analysis) renderAnalysis(data.analysis);
    } catch (e) {
        console.error('Analysis load error:', e);
    }
}

function renderAnalysis(analysis) {
    const score = analysis.ats_score || 0;

    // Score bar animation
    const scoreBar = document.getElementById('scoreBar');
    setTimeout(() => { scoreBar.style.width = score + '%'; }, 100);
    scoreBar.className = 'score-bar ' +
        (score >= 75 ? 'good' : score >= 50 ? 'mid' : 'low');

    // Animate number
    let cur = 0;
    const interval = setInterval(() => {
        cur += 2;
        if (cur >= score) { cur = score; clearInterval(interval); }
        document.getElementById('scoreNum').textContent = cur;
    }, 25);

    // Score breakdown
    const breakdown = analysis.score_breakdown || {};
    document.getElementById('scoreBreakdown').innerHTML =
        Object.entries(breakdown).map(([k, v]) => `
            <div class="breakdown-item">
                <span>${k.replace(/_/g, ' ')}</span>
                <strong>${v}%</strong>
            </div>`).join('');

    // Keywords
    const missing = analysis.missing_keywords || [];
    document.getElementById('missingKeywords').innerHTML =
        missing.length ? missing.map(k => `<span class="tag missing">${k}</span>`).join('')
                       : '<em>None - great keyword coverage!</em>';

    const matched = analysis.matched_keywords || [];
    document.getElementById('matchedKeywords').innerHTML =
        matched.length ? matched.map(k => `<span class="tag matched">${k}</span>`).join('')
                       : '<em>No matched keywords found</em>';

    // Section analysis
    const sections = analysis.section_analysis || {};
    document.getElementById('sectionSuggestions').innerHTML =
        Object.entries(sections).map(([name, d]) => `
            <details class="section-item ${d.status || 'good'}">
                <summary>
                    <span class="section-name">${name.replace(/_/g, ' ')}</span>
                    <span class="status-badge ${d.status || 'good'}">${(d.status || 'good').replace(/_/g, ' ')}</span>
                </summary>
                <div class="section-body">
                    ${(d.issues && d.issues.length) ? `<strong>Issues:</strong><ul>${d.issues.map(i => `<li>${i}</li>`).join('')}</ul>` : ''}
                    ${(d.suggestions && d.suggestions.length) ? `<strong>Suggestions:</strong><ul>${d.suggestions.map(s => `<li>${s}</li>`).join('')}</ul>` : ''}
                    ${(d.missing_skills && d.missing_skills.length) ? `<strong>Missing Skills:</strong> <em>${d.missing_skills.join(', ')}</em>` : ''}
                </div>
            </details>`).join('');

    // Grammar errors
    const errors = analysis.grammar_errors || [];
    document.getElementById('grammarErrors').innerHTML = errors.length ?
        errors.map(e => `
            <div class="grammar-item">
                <div class="error-text">❌ ${e.original}</div>
                <div class="correct-text">✅ ${e.corrected}</div>
                <small>in ${e.section}</small>
            </div>`).join('')
        : '<em>No grammar issues found ✓</em>';

    // Overall
    document.getElementById('overallRec').textContent =
        analysis.overall_recommendation || 'Analysis complete';
}

// ========= SAVE =========
saveBtn.addEventListener('click', async () => {
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;
    try {
        const res = await fetch('/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                file_id: FILE_ID, ext: EXT,
                edits: Object.values(edits)
            })
        });
        const data = await res.json();
        if (data.success) {
            window.location.href = data.download_url;
        } else {
            alert('Save failed');
        }
    } catch (e) {
        alert('Error: ' + e.message);
    }
    saveBtn.textContent = '💾 Save & Download';
    saveBtn.disabled = false;
});

// ========= RE-ANALYZE =========
if (reanalyzeBtn) {
    reanalyzeBtn.addEventListener('click', async () => {
        reanalyzeBtn.textContent = '⏳ Re-analyzing...';
        reanalyzeBtn.disabled = true;
        try {
            await fetch('/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    file_id: FILE_ID, ext: EXT,
                    edits: Object.values(edits)
                })
            });
            const res = await fetch(`/reanalyze/${FILE_ID}/${EXT}`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                renderAnalysis(data.analysis);
                alert('✅ Re-analysis complete!');
            } else {
                alert('Failed: ' + (data.error || 'unknown'));
            }
        } catch (e) {
            alert('Error: ' + e.message);
        }
        reanalyzeBtn.textContent = '🔄 Re-analyze';
        reanalyzeBtn.disabled = false;
    });
}

// ========= INIT =========
loadDocument();
loadAnalysis();
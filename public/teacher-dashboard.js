// Teacher Dashboard JavaScript

// Load and display all exam results
function loadResults() {
    const results = getAllExamResults();
    updateStatistics(results);
    displayResults(results);
}

// Get all exam results from localStorage
function getAllExamResults() {
    const results = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('exam_result_')) {
            try {
                const result = JSON.parse(localStorage.getItem(key));
                results.push(result);
            } catch (e) {
                console.error('Error parsing result:', e);
            }
        }
    }
    // Sort by timestamp (newest first)
    results.sort((a, b) => b.timestamp - a.timestamp);
    return results;
}

// Update statistics cards
function updateStatistics(results) {
    const total = results.length;
    const passed = results.filter(r => r.passed).length;
    const failed = total - passed;
    const averageScore = total > 0 ? 
        Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / total) : 0;

    document.getElementById('total-count').textContent = total;
    document.getElementById('passed-count').textContent = passed;
    document.getElementById('failed-count').textContent = failed;
    document.getElementById('average-score').textContent = averageScore + '%';
}

// Display results in table
function displayResults(results) {
    const tbody = document.getElementById('results-body');
    const emptyState = document.getElementById('empty-state');
    
    if (results.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    tbody.innerHTML = results.map((result, index) => `
        <tr>
            <td class="student-name">${escapeHtml(result.studentName || 'Anonymous')}</td>
            <td>${result.examType === 'practice' ? '📝 Practice (20Q)' : '🎯 Full Simulation (40Q)'}</td>
            <td>${formatDate(result.timestamp)}</td>
            <td><strong>${result.percentage}%</strong> (${result.correct}/${result.total})</td>
            <td>
                <span class="score-badge ${result.passed ? 'pass' : 'fail'}">
                    ${result.passed ? '✅ PASS' : '❌ FAIL'}
                </span>
            </td>
            <td>${result.timeSpent || 'N/A'}</td>
            <td>
                <button class="view-btn" onclick="viewDetails(${index})">👁️ View</button>
                <button class="delete-btn" onclick="deleteResult(${index})">🗑️</button>
            </td>
        </tr>
    `).join('');
}

// Format timestamp
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// View detailed results
function viewDetails(index) {
    const results = getFilteredResults();
    const result = results[index];
    
    const modalBody = document.getElementById('modal-body');
    
    // Basic Information
    let html = `
        <div class="detail-section">
            <h3>📋 Student Information</h3>
            <div class="detail-row">
                <span class="detail-label">Student Name:</span>
                <span class="detail-value">${escapeHtml(result.studentName || 'Anonymous')}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Exam Type:</span>
                <span class="detail-value">${result.examType === 'practice' ? 'Practice Exam (20 Questions)' : 'Full Simulation (40 Questions)'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date & Time:</span>
                <span class="detail-value">${formatDate(result.timestamp)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Time Spent:</span>
                <span class="detail-value">${result.timeSpent || 'Not recorded'}</span>
            </div>
        </div>

        <div class="detail-section">
            <h3>📊 Overall Performance</h3>
            <div class="detail-row">
                <span class="detail-label">Total Questions:</span>
                <span class="detail-value">${result.total}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Correct Answers:</span>
                <span class="detail-value" style="color: #27ae60;">${result.correct}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Incorrect Answers:</span>
                <span class="detail-value" style="color: #e74c3c;">${result.total - result.correct}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Percentage Score:</span>
                <span class="detail-value" style="font-size: 1.5rem; font-weight: bold; color: ${result.passed ? '#27ae60' : '#e74c3c'};">
                    ${result.percentage}%
                </span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Certiport Standard (70%):</span>
                <span class="detail-value">
                    <span class="score-badge ${result.passed ? 'pass' : 'fail'}">
                        ${result.passed ? '✅ PASS - Certification Ready' : '❌ FAIL - Additional Study Required'}
                    </span>
                </span>
            </div>
        </div>
    `;
    
    // Domain Breakdown
    if (result.domainScores && Object.keys(result.domainScores).length > 0) {
        html += `
            <div class="detail-section">
                <h3>🎯 Domain Performance Analysis</h3>
                <div class="domain-breakdown">
        `;
        
        for (const [domain, scores] of Object.entries(result.domainScores)) {
            const percentage = Math.round((scores.correct / scores.total) * 100);
            const isPassing = percentage >= 70;
            
            html += `
                <div class="domain-item" style="border-left-color: ${isPassing ? '#27ae60' : '#e74c3c'};">
                    <div class="domain-name">${domain}</div>
                    <div class="domain-score">
                        <span>${scores.correct}/${scores.total}</span>
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill" style="width: ${percentage}%; background: ${isPassing ? '#27ae60' : '#e74c3c'};"></div>
                        </div>
                        <strong style="color: ${isPassing ? '#27ae60' : '#e74c3c'};">${percentage}%</strong>
                    </div>
                </div>
            `;
        }
        
        html += `
                </div>
            </div>
        `;
    }
    
    // Recommendations
    html += `
        <div class="detail-section">
            <h3>💡 Recommendations</h3>
    `;
    
    if (result.passed) {
        html += `
            <div style="background: #e8f8f0; padding: 15px; border-radius: 8px; border-left: 4px solid #27ae60;">
                <strong style="color: #27ae60;">✅ Ready for Certification</strong>
                <p style="margin-top: 8px; color: #2c3e50;">
                    This student has demonstrated proficiency and is ready to take the Certiport Python IT Specialist certification exam.
                </p>
            </div>
        `;
    } else {
        html += `
            <div style="background: #fdeaea; padding: 15px; border-radius: 8px; border-left: 4px solid #e74c3c;">
                <strong style="color: #e74c3c;">📚 Additional Study Recommended</strong>
                <p style="margin-top: 8px; color: #2c3e50;">
                    Score below 70% passing threshold. Focus on domains with lower performance before attempting certification.
                </p>
            </div>
        `;
        
        // Identify weak areas
        if (result.domainScores) {
            const weakDomains = Object.entries(result.domainScores)
                .filter(([_, scores]) => (scores.correct / scores.total) < 0.7)
                .map(([domain, _]) => domain);
            
            if (weakDomains.length > 0) {
                html += `
                    <div style="margin-top: 15px; padding: 15px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #f39c12;">
                        <strong style="color: #f39c12;">⚠️ Areas Needing Improvement:</strong>
                        <ul style="margin-top: 10px; margin-left: 20px; color: #2c3e50;">
                            ${weakDomains.map(d => `<li>${d}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }
        }
    }
    
    html += `
        </div>
    `;
    
    modalBody.innerHTML = html;
    document.getElementById('detail-modal').style.display = 'block';
}

// Close modal
function closeModal() {
    document.getElementById('detail-modal').style.display = 'none';
}

// Delete a result
function deleteResult(index) {
    if (confirm('Are you sure you want to delete this exam result?')) {
        const results = getFilteredResults();
        const result = results[index];
        
        // Find and remove from localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('exam_result_')) {
                const stored = JSON.parse(localStorage.getItem(key));
                if (stored.timestamp === result.timestamp && stored.studentName === result.studentName) {
                    localStorage.removeItem(key);
                    break;
                }
            }
        }
        
        loadResults();
    }
}

// Clear all results
function clearAllResults() {
    if (confirm('⚠️ WARNING: This will permanently delete ALL exam results. This action cannot be undone.\n\nAre you sure you want to continue?')) {
        if (confirm('Final confirmation: Delete all exam results?')) {
            const keysToDelete = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('exam_result_')) {
                    keysToDelete.push(key);
                }
            }
            
            keysToDelete.forEach(key => localStorage.removeItem(key));
            loadResults();
        }
    }
}

// Search and filter functionality
function getFilteredResults() {
    let results = getAllExamResults();
    
    // Search filter
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    if (searchTerm) {
        results = results.filter(r => 
            (r.studentName || '').toLowerCase().includes(searchTerm)
        );
    }
    
    // Pass/Fail filter
    const statusFilter = document.getElementById('filter-select').value;
    if (statusFilter === 'passed') {
        results = results.filter(r => r.passed);
    } else if (statusFilter === 'failed') {
        results = results.filter(r => !r.passed);
    }
    
    // Exam type filter
    const examTypeFilter = document.getElementById('exam-type-filter').value;
    if (examTypeFilter !== 'all') {
        results = results.filter(r => r.examType === examTypeFilter);
    }
    
    return results;
}

// Apply filters
function applyFilters() {
    const results = getFilteredResults();
    displayResults(results);
}

// Export to CSV
function exportToCSV() {
    const results = getFilteredResults();
    
    if (results.length === 0) {
        alert('No results to export');
        return;
    }
    
    let csv = 'Student Name,Exam Type,Date,Score (%),Correct,Total,Result,Time Spent\n';
    
    results.forEach(result => {
        csv += `"${result.studentName || 'Anonymous'}",`;
        csv += `"${result.examType === 'practice' ? 'Practice (20Q)' : 'Full Simulation (40Q)'}",`;
        csv += `"${formatDate(result.timestamp)}",`;
        csv += `${result.percentage},`;
        csv += `${result.correct},`;
        csv += `${result.total},`;
        csv += `"${result.passed ? 'PASS' : 'FAIL'}",`;
        csv += `"${result.timeSpent || 'N/A'}"\n`;
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `python_exam_results_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Event listeners
document.getElementById('search-input').addEventListener('input', applyFilters);
document.getElementById('filter-select').addEventListener('change', applyFilters);
document.getElementById('exam-type-filter').addEventListener('change', applyFilters);

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('detail-modal');
    if (event.target === modal) {
        closeModal();
    }
};

// Load results on page load
window.addEventListener('DOMContentLoaded', loadResults);

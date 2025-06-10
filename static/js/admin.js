// static/js/admin.js
// Admin Panel JS: structure only, backend endpoints to be implemented

document.addEventListener('DOMContentLoaded', function() {
    // Live Users (placeholder)
    document.getElementById('admin-live-users').textContent = 'Feature coming soon: See users online.';

    // User Progress (placeholder)
    document.getElementById('admin-user-progress').textContent = 'Feature coming soon: View and filter user progress.';

    // Content Editor (structure)
    const pageSelect = document.getElementById('admin-page-select');
    const editArea = document.getElementById('admin-content-edit-area');
    // Example pages (should be fetched from backend)
    const pages = [
        {id: 'data_types', name: 'Data Types'},
        {id: 'flow_control', name: 'Flow Control'},
        {id: 'input_output', name: 'Input & Output'},
        {id: 'code_structure', name: 'Code Structure'},
        {id: 'error_handling', name: 'Error Handling'},
        {id: 'modules_tools', name: 'Modules & Tools'},
        {id: 'store', name: 'Store'}
    ];
    pages.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.name;
        pageSelect.appendChild(opt);
    });
    pageSelect.onchange = function() {
        editArea.innerHTML = `<div class='admin-edit-placeholder'>Feature coming soon: Drag, drop, and edit content for <b>${pageSelect.options[pageSelect.selectedIndex].text}</b>.</div>`;
    };
    pageSelect.onchange();

    // Student Work Review (placeholder)
    document.getElementById('admin-student-work').textContent = 'Feature coming soon: Review and comment on student submissions.';

    // Store Editor (placeholder)
    document.getElementById('admin-store-editor').textContent = 'Feature coming soon: Add/remove store items, set prices, and manage inventory.';

    // --- Students CRUD ---
function loadStudents() {
    fetch('/api/admin/students')
        .then(res => res.json())
        .then(students => {
            const tbody = document.querySelector('#students-table tbody');
            tbody.innerHTML = '';
            students.forEach(stu => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${stu.name}</td>
                    <td><input type="number" value="${stu.progress}" min="0" max="100" class="student-progress-input" data-id="${stu.id}"></td>
                    <td><input type="number" value="${stu.points}" min="0" class="student-points-input" data-id="${stu.id}"></td>
                    <td><input type="number" value="${stu.currency}" min="0" class="student-currency-input" data-id="${stu.id}"></td>
                    <td><button class="save-student-btn" data-id="${stu.id}">Save</button></td>
                `;
                tbody.appendChild(tr);
            });
            document.querySelectorAll('.save-student-btn').forEach(btn => {
                btn.onclick = function() {
                    const id = btn.dataset.id;
                    const progress = tbody.querySelector(`.student-progress-input[data-id='${id}']`).value;
                    const points = tbody.querySelector(`.student-points-input[data-id='${id}']`).value;
                    const currency = tbody.querySelector(`.student-currency-input[data-id='${id}']`).value;
                    fetch(`/api/admin/students/${id}`, {
                        method: 'PATCH',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({progress, points, currency})
                    })
                    .then(res => res.json())
                    .then(data => { btn.textContent = 'Saved!'; setTimeout(()=>btn.textContent='Save', 1200); })
                    .catch(()=>{ btn.textContent = 'Error'; setTimeout(()=>btn.textContent='Save', 1200); });
                };
            });
        });
}
// --- Challenges CRUD ---
function loadChallenges() {
    fetch('/api/admin/challenges')
        .then(res => res.json())
        .then(challenges => {
            const list = document.getElementById('challenges-list');
            list.innerHTML = '';
            challenges.forEach(ch => {
                const div = document.createElement('div');
                div.innerHTML = `
                    <strong>${ch.title}</strong> (Points: ${ch.points})
                    <button class="edit-challenge-btn" data-id="${ch.id}">Edit</button>
                    <button class="delete-challenge-btn" data-id="${ch.id}">Delete</button>
                `;
                list.appendChild(div);
            });
            list.querySelectorAll('.edit-challenge-btn').forEach(btn => {
                btn.onclick = function() {
                    const id = btn.dataset.id;
                    const title = prompt('New title:');
                    const points = prompt('New points:');
                    fetch(`/api/admin/challenges/${id}`, {
                        method: 'PATCH',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({title, points: Number(points)})
                    }).then(loadChallenges);
                };
            });
            list.querySelectorAll('.delete-challenge-btn').forEach(btn => {
                btn.onclick = function() {
                    if (confirm('Delete this challenge?')) {
                        fetch(`/api/admin/challenges/${btn.dataset.id}`, {method: 'DELETE'}).then(loadChallenges);
                    }
                };
            });
        });
}
document.querySelector('#admin-content .admin-add-btn').onclick = function() {
    const title = prompt('Challenge title:');
    const points = prompt('Points:');
    fetch('/api/admin/challenges', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({title, points: Number(points)})
    }).then(loadChallenges);
};
// --- Quizzes CRUD ---
function loadQuizzes() {
    fetch('/api/admin/quizzes')
        .then(res => res.json())
        .then(quizzes => {
            const list = document.getElementById('quizzes-list');
            list.innerHTML = '';
            quizzes.forEach(qz => {
                const div = document.createElement('div');
                div.innerHTML = `
                    <strong>${qz.question}</strong> (Points: ${qz.points})
                    <button class="edit-quiz-btn" data-id="${qz.id}">Edit</button>
                    <button class="delete-quiz-btn" data-id="${qz.id}">Delete</button>
                `;
                list.appendChild(div);
            });
            list.querySelectorAll('.edit-quiz-btn').forEach(btn => {
                btn.onclick = function() {
                    const id = btn.dataset.id;
                    const question = prompt('New question:');
                    const points = prompt('New points:');
                    fetch(`/api/admin/quizzes/${id}`, {
                        method: 'PATCH',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({question, points: Number(points)})
                    }).then(loadQuizzes);
                };
            });
            list.querySelectorAll('.delete-quiz-btn').forEach(btn => {
                btn.onclick = function() {
                    if (confirm('Delete this quiz?')) {
                        fetch(`/api/admin/quizzes/${btn.dataset.id}`, {method: 'DELETE'}).then(loadQuizzes);
                    }
                };
            });
        });
}
document.getElementById('add-quiz-btn').onclick = function() {
    const question = prompt('Quiz question:');
    const points = prompt('Points:');
    fetch('/api/admin/quizzes', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({question, points: Number(points)})
    }).then(loadQuizzes);
};
// --- Store CRUD ---
function loadStore() {
    fetch('/api/admin/store')
        .then(res => res.json())
        .then(items => {
            const list = document.getElementById('store-list');
            list.innerHTML = '';
            items.forEach(item => {
                const div = document.createElement('div');
                div.className = 'store-item-card';
                div.innerHTML = `
                    <div class="store-item-image">${item.img || '🛒'}</div>
                    <div class="store-item-title">${item.name}</div>
                    <div class="store-item-desc">${item.desc || ''}</div>
                    <div class="store-item-price"><span class="material-symbols-outlined coin-icon">token</span> ${item.price}</div>
                    <div class="admin-controls">
                        <button class="edit-store-btn" data-id="${item.id}">Edit</button>
                        <button class="delete-store-btn" data-id="${item.id}">Delete</button>
                    </div>
                `;
                list.appendChild(div);
            });
            list.querySelectorAll('.edit-store-btn').forEach(btn => {
                btn.onclick = function() {
                    const id = btn.dataset.id;
                    const name = prompt('Item name:');
                    const price = prompt('Price:');
                    const desc = prompt('Description:');
                    const img = prompt('Emoji/Icon:');
                    fetch(`/api/admin/store/${id}`, {
                        method: 'PATCH',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({name, price: Number(price), desc, img})
                    }).then(loadStore);
                };
            });
            list.querySelectorAll('.delete-store-btn').forEach(btn => {
                btn.onclick = function() {
                    if (confirm('Delete this item?')) {
                        fetch(`/api/admin/store/${btn.dataset.id}`, {method: 'DELETE'}).then(loadStore);
                    }
                };
            });
        });
}
document.getElementById('add-store-btn').onclick = function() {
    const name = prompt('Item name:');
    const price = prompt('Price:');
    const desc = prompt('Description:');
    const img = prompt('Emoji/Icon:');
    fetch('/api/admin/store', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name, price: Number(price), desc, img})
    }).then(loadStore);
};
// --- Initial Loads ---
document.addEventListener('DOMContentLoaded', function() {
    loadStudents();
    loadChallenges();
    loadQuizzes();
    loadStore();
});
    // --- Admin Content Editing Logic (JS placeholder) ---
    document.querySelectorAll('.admin-section .admin-edit-placeholder').forEach(function(el) {
        el.onclick = function() {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = el.textContent;
            el.replaceWith(input);
            input.focus();
            input.onblur = function() {
                // Save logic here (call API)
                el.textContent = input.value;
                input.replaceWith(el);
            };
        };
    });
    // TODO: Add logic for editing challenges, quizzes, and store items
});

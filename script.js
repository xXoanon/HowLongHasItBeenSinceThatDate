function getTimeDifference(date1, date2) {
    let isFuture = date1 < date2;
    let start = isFuture ? date1 : date2;
    let end = isFuture ? date2 : date1;

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();
    let hours = end.getHours() - start.getHours();
    let minutes = end.getMinutes() - start.getMinutes();
    let seconds = end.getSeconds() - start.getSeconds();

    if (seconds < 0) {
        seconds += 60;
        minutes--;
    }
    if (minutes < 0) {
        minutes += 60;
        hours--;
    }
    if (hours < 0) {
        hours += 24;
        days--;
    }
    if (days < 0) {
        const prevMonthDate = new Date(end.getFullYear(), end.getMonth(), 0);
        days += prevMonthDate.getDate();
        months--;
    }
    if (months < 0) {
        months += 12;
        years--;
    }
    
    return { years, months, days, hours, minutes, seconds, isFuture };
}

let trackers = JSON.parse(localStorage.getItem('trackers')) || [];
let currentSort = localStorage.getItem('sortPref') || 'newest';
let currentTheme = localStorage.getItem('themePref');
if (!['light', 'dark', 'black'].includes(currentTheme)) {
    currentTheme = 'light';
}
const themes = ['light', 'dark', 'black'];
let editingIndex = null;

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    let metaColor = '#fcfcfc';
    if (theme === 'black') {
        metaColor = '#000000';
    } else if (theme === 'dark') {
        metaColor = '#161618';
    }
    
    document.querySelector('meta[name="theme-color"]').setAttribute('content', metaColor);
}

applyTheme(currentTheme);

document.getElementById('theme-btn').addEventListener('click', () => {
    let currentIndex = themes.indexOf(currentTheme);
    currentIndex = (currentIndex + 1) % themes.length;
    currentTheme = themes[currentIndex];
    localStorage.setItem('themePref', currentTheme);
    applyTheme(currentTheme);
});

document.getElementById('sort-trackers').value = currentSort;

function saveTrackers() {
    localStorage.setItem('trackers', JSON.stringify(trackers));
}

function getSortedTrackers() {
    return [...trackers].sort((a, b) => {
        if (currentSort === 'newest') {
            return new Date(b.date) - new Date(a.date);
        } else if (currentSort === 'oldest') {
            return new Date(a.date) - new Date(b.date);
        } else if (currentSort === 'alphabetical') {
            return a.label.localeCompare(b.label);
        }
        return 0;
    });
}

function renderTrackers() {
    const container = document.getElementById('trackers');
    container.innerHTML = '';
    const sortedTrackers = getSortedTrackers();

    sortedTrackers.forEach((tracker) => {
        const now = new Date();
        const target = new Date(tracker.date);
        const { years, months, days, hours, minutes, seconds, isFuture } = getTimeDifference(now, target);
        
        const trackerDiv = document.createElement('div');
        trackerDiv.className = 'tracker';
        
        const parts = [
            { v: years, l: 'year' },
            { v: months, l: 'month' },
            { v: days, l: 'day' },
            { v: hours, l: 'hour' },
            { v: minutes, l: 'min' },
            { v: seconds, l: 'sec' }
        ];

        const timeParts = parts
            .filter(p => p.v > 0 || ['day', 'hour', 'min', 'sec'].includes(p.l))
            .map(p => `<span class="time-val">${p.v}</span> ${p.l}${p.v !== 1 ? 's' : ''}`);

        const originalIndex = trackers.indexOf(tracker);

        if (editingIndex === originalIndex) {
            trackerDiv.innerHTML = `
                <div class="tracker-header">
                    <input type="text" class="edit-label" id="edit-label-${originalIndex}" value="${tracker.label}">
                    <div class="tracker-actions">
                        <button class="action-btn" onclick="saveEdit(${originalIndex})" title="Save changes">Save</button>
                        <button class="action-btn" onclick="cancelEdit()" title="Cancel edit">Cancel</button>
                    </div>
                </div>
                <input type="date" class="edit-date" id="edit-date-${originalIndex}" value="${tracker.date}">
            `;
        } else {
            trackerDiv.innerHTML = `
                <div class="tracker-header">
                    <h2>${tracker.label}</h2>
                    <div class="tracker-actions">
                        <button class="action-btn" onclick="startEdit(${originalIndex})" title="Edit tracker">Edit</button>
                        <button class="action-btn delete-btn" onclick="deleteTracker(${originalIndex})" title="Remove tracker">Delete</button>
                    </div>
                </div>
                <div class="result-prefix">${isFuture ? 'Time until' : 'Time since'}</div>
                <div class="result">${timeParts.join(', ')}</div>
                <div class="date-info">${isFuture ? 'Target' : 'Started'}: ${tracker.date}</div>
            `;
        }
        
        container.appendChild(trackerDiv);
    });
}

function startEdit(index) {
    editingIndex = index;
    renderTrackers();
}

function cancelEdit() {
    editingIndex = null;
    renderTrackers();
}

function saveEdit(index) {
    const newLabel = document.getElementById(`edit-label-${index}`).value;
    const newDate = document.getElementById(`edit-date-${index}`).value;
    
    if (newLabel && newDate) {
        trackers[index].label = newLabel;
        trackers[index].date = newDate;
        saveTrackers();
        editingIndex = null;
        renderTrackers();
    }
}

function deleteTracker(index) {
    trackers.splice(index, 1);
    saveTrackers();
    renderTrackers();
}

document.getElementById('sort-trackers').addEventListener('change', (e) => {
    currentSort = e.target.value;
    localStorage.setItem('sortPref', currentSort);
    renderTrackers();
});

document.getElementById('new-btn').addEventListener('click', () => {
    document.getElementById('add-modal').showModal();
});

document.getElementById('cancel-btn').addEventListener('click', () => {
    document.getElementById('add-modal').close();
    document.getElementById('label').value = '';
    document.getElementById('start-date').value = '';
});

document.getElementById('add-tracker-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const labelInput = document.getElementById('label');
    const dateInput = document.getElementById('start-date');

    trackers.push({
        label: labelInput.value,
        date: dateInput.value
    });

    saveTrackers();
    renderTrackers();

    labelInput.value = '';
    dateInput.value = '';
    document.getElementById('add-modal').close();
});

setInterval(() => {
    if (editingIndex === null) {
        renderTrackers();
    }
}, 1000);

renderTrackers();

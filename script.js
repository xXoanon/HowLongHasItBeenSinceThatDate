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
        
        let timeParts = [];
        if (years > 0) timeParts.push(`<span class="time-val">${years}</span> year${years > 1 ? 's' : ''}`);
        if (months > 0) timeParts.push(`<span class="time-val">${months}</span> month${months > 1 ? 's' : ''}`);
        timeParts.push(`<span class="time-val">${days}</span> day${days !== 1 ? 's' : ''}`);
        timeParts.push(`<span class="time-val">${hours}</span> hour${hours !== 1 ? 's' : ''}`);
        timeParts.push(`<span class="time-val">${minutes}</span> min${minutes !== 1 ? 's' : ''}`);
        timeParts.push(`<span class="time-val">${seconds}</span> sec${seconds !== 1 ? 's' : ''}`);

        let resultText = timeParts.join(', ');
        if (isFuture) {
            resultText = `Time until: <br>${resultText}`;
        } else {
            resultText = `It has been: <br>${resultText}`;
        }

        const originalIndex = trackers.indexOf(tracker);

        trackerDiv.innerHTML = `
            <div class="tracker-header">
                <h2>${tracker.label}</h2>
                <button class="delete-btn" onclick="deleteTracker(${originalIndex})" title="Remove tracker">Delete</button>
            </div>
            <p class="result">${resultText}</p>
            <p class="date-info">${isFuture ? 'Target' : 'Started'}: ${tracker.date}</p>
        `;
        container.appendChild(trackerDiv);
    });
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
});

// Real-time update every second
setInterval(renderTrackers, 1000);

// Initial render
renderTrackers();

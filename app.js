// A Dull Moment - Main Application

(function() {
    'use strict';

    // =====================
    // Constants & State
    // =====================
    const STORAGE_KEY = 'adullmoment_image';
    let overlayTimeout = null;

    // =====================
    // DOM Elements
    // =====================
    const displayMode = document.getElementById('display-mode');
    const selectionMode = document.getElementById('selection-mode');
    const displayImage = document.getElementById('display-image');
    const overlay = document.getElementById('overlay');
    const previewContainer = document.getElementById('preview-container');
    const previewImage = document.getElementById('preview-image');
    const actionButtons = document.getElementById('action-buttons');
    const calendarModal = document.getElementById('calendar-modal');

    // Buttons
    const btnClose = document.getElementById('btn-close');
    const btnChangeImage = document.getElementById('btn-change-image');
    const btnCalendar = document.getElementById('btn-calendar');
    const fileInput = document.getElementById('file-input');
    const btnOk = document.getElementById('btn-ok');
    const btnCancel = document.getElementById('btn-cancel');
    const btnAddReminder = document.getElementById('btn-add-reminder');
    const btnCloseModal = document.getElementById('btn-close-modal');

    // Form inputs
    const reminderTime = document.getElementById('reminder-time');
    const reminderRecurrence = document.getElementById('reminder-recurrence');
    const reminderStartDate = document.getElementById('reminder-start-date');
    const calendarType = document.getElementById('calendar-type');

    // =====================
    // Initialization
    // =====================
    function init() {
        registerServiceWorker();
        setupEventListeners();
        loadSavedImage();
        setDefaultReminderValues();
    }

    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js')
                .catch((error) => {
                    console.warn('Service worker registration failed:', error);
                });
        }
    }

    function setupEventListeners() {
        // Display mode interactions
        displayMode.addEventListener('click', handleDisplayClick);
        btnClose.addEventListener('click', handleClose);
        btnChangeImage.addEventListener('click', showSelectionMode);
        btnCalendar.addEventListener('click', showCalendarModal);

        // Selection mode interactions
        fileInput.addEventListener('change', handleFileSelect);
        btnOk.addEventListener('click', saveImage);
        btnCancel.addEventListener('click', handleCancel);

        // Calendar modal interactions
        btnAddReminder.addEventListener('click', addReminder);
        btnCloseModal.addEventListener('click', hideCalendarModal);
        calendarModal.addEventListener('click', (e) => {
            if (e.target === calendarModal) {
                hideCalendarModal();
            }
        });

        // Prevent overlay buttons from triggering display click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                hideOverlay();
            }
        });
    }

    // =====================
    // Image Storage
    // =====================
    function loadSavedImage() {
        const savedImage = localStorage.getItem(STORAGE_KEY);

        if (savedImage) {
            displayImage.src = savedImage;
            showDisplayMode();
        } else {
            showSelectionMode();
        }
    }

    function saveImageToStorage(dataUrl) {
        try {
            localStorage.setItem(STORAGE_KEY, dataUrl);
            return true;
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                alert('Image is too large to store. Please choose a smaller image.');
            } else {
                alert('Failed to save image. Please try again.');
            }
            return false;
        }
    }

    // =====================
    // Mode Switching
    // =====================
    function showDisplayMode() {
        selectionMode.classList.add('hidden');
        displayMode.classList.remove('hidden');
        hideOverlay();
    }

    function showSelectionMode() {
        hideOverlay();
        displayMode.classList.add('hidden');
        selectionMode.classList.remove('hidden');
        resetSelectionForm();
    }

    function resetSelectionForm() {
        fileInput.value = '';
        previewContainer.classList.add('hidden');
        previewImage.src = '';
        actionButtons.classList.add('hidden');
    }

    // =====================
    // Overlay Controls
    // =====================
    function handleDisplayClick(e) {
        // Don't toggle overlay if clicking on overlay elements
        if (e.target.closest('#overlay')) {
            return;
        }

        if (overlay.classList.contains('hidden')) {
            showOverlay();
        } else {
            hideOverlay();
        }
    }

    function showOverlay() {
        overlay.classList.remove('hidden');

        // Auto-hide overlay after 5 seconds of inactivity
        clearTimeout(overlayTimeout);
        overlayTimeout = setTimeout(hideOverlay, 5000);
    }

    function hideOverlay() {
        overlay.classList.add('hidden');
        clearTimeout(overlayTimeout);
    }

    // =====================
    // Button Handlers
    // =====================
    function handleClose(e) {
        e.stopPropagation();
        // For PWAs, we can try to close the window
        // This will work in standalone mode but not in browser tabs
        if (window.matchMedia('(display-mode: standalone)').matches ||
            window.matchMedia('(display-mode: fullscreen)').matches) {
            window.close();
        } else {
            // In browser mode, just hide the overlay and show a message
            hideOverlay();
        }
    }

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            previewImage.src = event.target.result;
            previewContainer.classList.remove('hidden');
            actionButtons.classList.remove('hidden');
        };
        reader.onerror = () => {
            alert('Failed to read the file. Please try again.');
        };
        reader.readAsDataURL(file);
    }

    function saveImage() {
        const imageData = previewImage.src;
        if (!imageData) return;

        if (saveImageToStorage(imageData)) {
            displayImage.src = imageData;
            showDisplayMode();
        }
    }

    function handleCancel() {
        // If there's an existing saved image, show display mode
        // Otherwise stay in selection mode with form reset
        const savedImage = localStorage.getItem(STORAGE_KEY);
        if (savedImage) {
            showDisplayMode();
        } else {
            resetSelectionForm();
        }
    }

    // =====================
    // Calendar Functions
    // =====================
    function setDefaultReminderValues() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Set default start date to tomorrow
        reminderStartDate.value = formatDate(tomorrow);

        // Set default time to 9:00 AM
        reminderTime.value = '09:00';
    }

    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function showCalendarModal(e) {
        e.stopPropagation();
        hideOverlay();
        calendarModal.classList.remove('hidden');
    }

    function hideCalendarModal() {
        calendarModal.classList.add('hidden');
    }

    function recurrenceToRRule(recurrence) {
        switch (recurrence) {
            case 'weekdays':
                return 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR';
            case 'weekly':
                return 'FREQ=WEEKLY';
            case 'daily':
            default:
                return 'FREQ=DAILY';
        }
    }

    function addReminder() {
        const date = reminderStartDate.value;
        const time = reminderTime.value;
        const recurrence = reminderRecurrence.value;
        const type = calendarType.value;

        if (!date || !time) {
            alert('Please select a start date and time.');
            return;
        }

        const dateTime = new Date(`${date}T${time}`);
        const endDateTime = new Date(dateTime.getTime() + 15 * 60000); // 15 min duration
        const rrule = recurrenceToRRule(recurrence);

        const title = 'A Dull Moment';
        const description = 'Take a moment to pause and reflect. Open A Dull Moment to view your chosen image: https://joesephpaulsmith.github.io/adullmoment/';

        switch (type) {
            case 'google': {
                const url = createGoogleCalendarUrl(title, description, dateTime, endDateTime, rrule);
                window.open(url, '_blank');
                break;
            }
            case 'ical':
            case 'outlook':
                downloadICalFile(title, description, dateTime, endDateTime, rrule);
                break;
        }

        hideCalendarModal();
    }

    function createGoogleCalendarUrl(title, description, start, end, rrule) {
        const formatGoogleDate = (date) => {
            return date.toISOString().replace(/-|:|\.\d{3}/g, '');
        };

        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: title,
            details: description,
            dates: `${formatGoogleDate(start)}/${formatGoogleDate(end)}`,
            recur: `RRULE:${rrule}`
        });

        return `https://calendar.google.com/calendar/render?${params.toString()}`;
    }

    function downloadICalFile(title, description, start, end, rrule) {
        const formatICalDate = (date) => {
            return date.toISOString().replace(/-|:|\.\d{3}/g, '').slice(0, -1);
        };

        const icalContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//A Dull Moment//EN',
            'BEGIN:VEVENT',
            `DTSTART:${formatICalDate(start)}`,
            `DTEND:${formatICalDate(end)}`,
            `RRULE:${rrule}`,
            `SUMMARY:${title}`,
            `DESCRIPTION:${description}`,
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');

        const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'a-dull-moment-reminder.ics';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // =====================
    // Start the app
    // =====================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

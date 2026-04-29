function loadSettings() {
    const theme = localStorage.getItem('appTheme') || 'dark';
    const notifications = localStorage.getItem('appNotifications') || 'off';
    const refreshRate = localStorage.getItem('appRefreshRate') || '0';

    document.getElementById('themeSelect').value = theme;
    document.getElementById('notificationSelect').value = notifications;
    document.getElementById('refreshSelect').value = refreshRate;
}

function saveSettings() {
    const theme = document.getElementById('themeSelect').value;
    const notifications = document.getElementById('notificationSelect').value;
    const refreshRate = document.getElementById('refreshSelect').value;

    localStorage.setItem('appTheme', theme);
    localStorage.setItem('appNotifications', notifications);
    localStorage.setItem('appRefreshRate', refreshRate);

    // Apply theme changes if needed
    if (theme === 'light') {
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
    }

    if (notifications === 'on') {
        if (Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    }

    if (window.startGlobalPolling) {
        window.startGlobalPolling();
    }

    alert('Settings saved successfully!');
}

loadSettings();

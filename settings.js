const themeButtons = document.querySelectorAll('.theme-swatch');
const profileName = document.getElementById('profileName');
const logoutBtn = document.getElementById('logoutBtn');

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('bloomTheme', theme);
    updateActive(theme);
}
function updateActive(theme) {
    themeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });
}
themeButtons.forEach(btn => {
    btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
});
updateActive(localStorage.getItem('bloomTheme') || 'pink');

profileName.textContent = localStorage.getItem('bloomUsername') || 'BloomTask1';
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('bloomLoggedIn');
    window.location.href = 'login.html';
});
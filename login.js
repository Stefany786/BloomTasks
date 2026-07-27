const form = document.getElementById('loginForm');
const errorMsg = document.getElementById('loginError');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (username === 'BloomTask1' && password === 'WELCOME') {
        localStorage.setItem('bloomLoggedIn', 'true');
        localStorage.setItem('bloomUsername', username);
        window.location.href = 'index.html';
    } else {
        errorMsg.textContent = 'Incorrect username or password.';
    }
});
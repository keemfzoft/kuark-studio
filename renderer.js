window.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('ping');
    btn.addEventListener('click', () => {
        console.log('Ping from renderer!');
    });
});
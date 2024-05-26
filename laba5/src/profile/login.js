import axios from 'axios';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('#loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(loginForm);
            const user = {
                user_login: formData.get('user_login'),
                user_password: formData.get('user_password')
            };

            try {
                const response = await axios.post('http://localhost:3000/login', user);
                console.log('User logged in:', response.data);
                localStorage.setItem('token', response.data.token);
                // Redirect to profile page after successful login
                window.location.href = '/profile.html';
            } catch (error) {
                console.error('Error logging in:', error.response.data);
                alert('Error logging in: ' + error.response.data);
            }
        });
    }
});

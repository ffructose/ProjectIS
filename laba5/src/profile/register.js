import axios from 'axios';

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.querySelector('#registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(registerForm);
            const user = {
                user_login: formData.get('user_login'),
                user_password: formData.get('user_password'),
                user_mail: formData.get('user_mail'),
                user_phone: formData.get('user_phone')
            };

            try {
                const response = await axios.post('http://localhost:3000/register', user);
                console.log('User registered:', response.data);
                // Redirect to login or profile page after successful registration
                window.location.href = '/login.html';
            } catch (error) {
                console.error('Error registering user:', error.response.data);
                alert('Error registering user: ' + error.response.data);
            }
        });
    }
});

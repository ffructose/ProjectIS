import axios from 'axios';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/user', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const user = response.data;

        // Update profile info with fetched data
        document.querySelector('.user-name').textContent = user.user_login;
        document.querySelector('.user-mail').textContent = user.user_mail;
        document.querySelector('.user-num').textContent = user.user_phone;
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
});


console.log('.user-name')
console.log('.user-mail')
console.log('.user-num')

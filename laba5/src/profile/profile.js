import axios from 'axios';

document.addEventListener('DOMContentLoaded', async () => {
    const profileContent = document.querySelector('.profile-content');
    const profileLoginRegister = document.querySelector('.profile-login-register');
    const editForm = document.querySelector('#editProfileForm');
    const token = localStorage.getItem('token');

    if (!token) {
        if (profileLoginRegister) profileLoginRegister.classList.remove('hidden');
        if (profileContent) profileContent.classList.add('hidden');
    } else {
        try {
            const response = await axios.get('http://localhost:3000/user', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const user = response.data;
            console.log('User data:', user);

            const userNameElement = document.querySelector('.user-name');
            const userMailElement = document.querySelector('.user-mail');
            const userNumElement = document.querySelector('.user-num');
            const editUserMailElement = document.querySelector('#edit_user_mail');
            const editUserPhoneElement = document.querySelector('#edit_user_phone');

            if (userNameElement) userNameElement.textContent = user.user_login;
            if (userMailElement) userMailElement.textContent = user.user_mail;
            if (userNumElement) userNumElement.textContent = user.user_phone;

            if (editUserMailElement) editUserMailElement.value = user.user_mail;
            if (editUserPhoneElement) editUserPhoneElement.value = user.user_phone;

            if (profileContent) profileContent.classList.remove('hidden');
            if (profileLoginRegister) profileLoginRegister.classList.add('hidden');
        } catch (error) {
            console.error('Error fetching user data:', error);
            if (profileLoginRegister) profileLoginRegister.classList.remove('hidden');
            if (profileContent) profileContent.classList.add('hidden');
        }
    }

    const loginButton = document.querySelector('.login-button');
    if (loginButton) {
        loginButton.addEventListener('click', () => {
            window.location.href = '/login.html';
        });
    }

    const registerButton = document.querySelector('.register-button');
    if (registerButton) {
        registerButton.addEventListener('click', () => {
            window.location.href = '/register.html';
        });
    }

    const logoutButton = document.querySelector('.delete-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            if (profileLoginRegister) profileLoginRegister.classList.remove('hidden');
            if (profileContent) profileContent.classList.add('hidden');
        });
    }

    const editButton = document.querySelector('.edit-button');
    if (editButton) {
        editButton.addEventListener('click', () => {
            console.log('Edit button clicked');

            // Показати поля введення
            const userMailElement = document.querySelector('.user-mail');
            const userNumElement = document.querySelector('.user-num');
            const editUserMailElement = document.querySelector('#edit_user_mail');
            const editUserPhoneElement = document.querySelector('#edit_user_phone');

            if (userMailElement) userMailElement.classList.add('hidden');
            if (userNumElement) userNumElement.classList.add('hidden');
            if (editUserMailElement) editUserMailElement.classList.remove('hidden');
            if (editUserPhoneElement) editUserPhoneElement.classList.remove('hidden');

            // Показати форму збереження та приховати кнопку редагування
            if (editForm) editForm.classList.remove('hidden');
            if (editButton) editButton.classList.add('hidden');
        });
    }

    const cancelEditButton = document.querySelector('.cancel-edit-button');
    if (cancelEditButton) {
        cancelEditButton.addEventListener('click', () => {
            console.log('Cancel edit button clicked');

            // Приховати поля введення
            const userMailElement = document.querySelector('.user-mail');
            const userNumElement = document.querySelector('.user-num');
            const editUserMailElement = document.querySelector('#edit_user_mail');
            const editUserPhoneElement = document.querySelector('#edit_user_phone');

            if (userMailElement) userMailElement.classList.remove('hidden');
            if (userNumElement) userNumElement.classList.remove('hidden');
            if (editUserMailElement) editUserMailElement.classList.add('hidden');
            if (editUserPhoneElement) editUserPhoneElement.classList.add('hidden');

            // Показати кнопку редагування та приховати форму збереження
            if (editForm) editForm.classList.add('hidden');
            if (editButton) editButton.classList.remove('hidden');
        });
    }

    const editProfileForm = document.querySelector('#editProfileForm');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const updatedUser = {
                user_mail: document.querySelector('#edit_user_mail').value,
                user_phone: document.querySelector('#edit_user_phone').value
            };
            console.log('Form submitted with data:', updatedUser);

            try {
                const response = await axios.put('http://localhost:3000/user', updatedUser, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log('User updated:', response.data);
                window.location.reload(); // Перезавантажити сторінку для відображення оновлених даних
            } catch (error) {
                console.error('Error updating user:', error.response.data);
                alert('Error updating user: ' + error.response.data);
            }
        });
    }
});

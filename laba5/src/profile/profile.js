import axios from 'axios';

document.addEventListener('DOMContentLoaded', async () => {
    const profileContent = document.querySelector('.profile-content');
    const profileLoginRegister = document.querySelector('.profile-login-register');
    const editForm = document.querySelector('#editProfileForm');
    const token = localStorage.getItem('token');

    if (!token) {
        profileLoginRegister.classList.remove('hidden');
        profileContent.classList.add('hidden');
    } else {
        try {
            const response = await axios.get('http://localhost:3000/user', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const user = response.data;
            console.log('User data:', user);

            document.querySelector('.user-name').textContent = user.user_login;
            document.querySelector('.user-mail').textContent = user.user_mail;
            document.querySelector('.user-num').textContent = user.user_phone;

            document.querySelector('#edit_user_mail').value = user.user_mail;
            document.querySelector('#edit_user_phone').value = user.user_phone;

            profileContent.classList.remove('hidden');
            profileLoginRegister.classList.add('hidden');
        } catch (error) {
            console.error('Error fetching user data:', error);
            profileLoginRegister.classList.remove('hidden');
            profileContent.classList.add('hidden');
        }
    }

    document.querySelector('.login-button').addEventListener('click', () => {
        window.location.href = '/login.html';
    });

    document.querySelector('.register-button').addEventListener('click', () => {
        window.location.href = '/register.html';
    });

    const logoutButton = document.querySelector('.delete-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            profileLoginRegister.classList.remove('hidden');
            profileContent.classList.add('hidden');
        });
    }

    const editButton = document.querySelector('.edit-button');
    if (editButton) {
        editButton.addEventListener('click', () => {
            console.log('Edit button clicked');

            // Показати поля введення
            document.querySelector('.user-mail').classList.add('hidden');
            document.querySelector('.user-num').classList.add('hidden');
            document.querySelector('#edit_user_mail').classList.remove('hidden');
            document.querySelector('#edit_user_phone').classList.remove('hidden');

            // Показати форму збереження та приховати кнопку редагування
            editForm.classList.remove('hidden');
            editButton.classList.add('hidden');
        });
    }

    const cancelEditButton = document.querySelector('.cancel-edit-button');
    if (cancelEditButton) {
        cancelEditButton.addEventListener('click', () => {
            console.log('Cancel edit button clicked');

            // Приховати поля введення
            document.querySelector('.user-mail').classList.remove('hidden');
            document.querySelector('.user-num').classList.remove('hidden');
            document.querySelector('#edit_user_mail').classList.add('hidden');
            document.querySelector('#edit_user_phone').classList.add('hidden');

            // Показати кнопку редагування та приховати форму збереження
            editForm.classList.add('hidden');
            editButton.classList.remove('hidden');
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

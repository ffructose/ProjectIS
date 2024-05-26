import axios from 'axios';

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token && document.querySelector('.liked_products')) {
        alert("You must be logged in to view your liked items.");
        window.location.href = '/login.html'; // Redirect to login page if not logged in
        return;
    }

    try {
        const response = await axios.get('http://localhost:3000/liked', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const likedItems = response.data;
        console.log('Liked items:', likedItems); // Log the liked items to ensure they are correct

        const productsContainer = document.querySelector(".liked_products");

        productsContainer.innerHTML = ''; // Clear the products container before adding items

        likedItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('product-card');
            itemElement.dataset.goodId = item.good_id;

            const productName = item.good_name;
            const productImg = `http://localhost:3000/photos/${item.photo_path}`;
            const heartIcon = require('../photo/redheartIcon.png'); // Show red heart for liked items

            itemElement.innerHTML = `
                <h3>${productName}</h3>
                <img src="${productImg}" alt="${productName}" />
                <p class="price">₴${item.good_price}</p>
                <a href="#" class="favorite">
                    <img src="${heartIcon}" alt="Favorite Icon" />
                </a>
                <a href="#" class="cart">
                    <img src="${require('../photo/cartIcon.png')}" alt="Cart Icon" />
                </a>
            `;

            productsContainer.appendChild(itemElement);
        });

        attachEventListeners(likedItems);

    } catch (error) {
    }
});

function attachEventListeners(likedItems) {
    document.querySelectorAll('.favorite').forEach(favoriteIcon => {
        favoriteIcon.addEventListener('click', (event) => toggleLike(event, likedItems));
    });
    document.querySelectorAll('.cart').forEach(cartIcon => {
        cartIcon.addEventListener('click', addToCart);
    });
}

function toggleLike(event, likedItems) {
    event.preventDefault();
    const productCard = event.target.closest('.product-card');
    if (!productCard) return;

    const goodId = parseInt(productCard.dataset.goodId);
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You need to log in to like/unlike products.');
        return;
    }

    const isLiked = likedItems.some(item => item.good_id === goodId);
    const url = isLiked ? 'http://localhost:3000/unlike' : 'http://localhost:3000/like';
    axios.post(url, { good_id: goodId }, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => {
            console.log(isLiked ? 'Product unliked:' : 'Product liked:', response.data);
            if (isLiked) {
                event.target.src = require('../photo/heartIcon.png');
                likedItems = likedItems.filter(item => item.good_id !== goodId);
                productCard.remove();
            } else {
                event.target.src = require('../photo/redheartIcon.png');
                likedItems.push({ good_id: goodId });
            }
        })
        .catch(error => {
            console.error(isLiked ? 'Error unliking product:' : 'Error liking product:', error);
            alert(isLiked ? 'Error unliking product' : 'Error liking product');
        });
}

function addToCart(event) {
    event.preventDefault();
    const productCard = event.target.closest('.product-card');
    if (!productCard) return;

    const goodId = productCard.dataset.goodId;
    const productName = productCard.querySelector('h3').textContent;
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You need to log in to add products to the cart.');
        return;
    }

    axios.post('http://localhost:3000/add-to-cart', { good_id: goodId }, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => {
            console.log('Product added to cart:', response.data);
            showNotification(productName);
        })
        .catch(error => {
            console.error('Error adding product to cart:', error);
            alert('Error adding product to cart');
        });
}

function showNotification(productName) {
    const notification = document.getElementById('notification');
    notification.querySelector('.notification-text').textContent = `${productName} added to your cart`;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

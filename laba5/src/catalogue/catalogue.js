import axios from 'axios';

let currentIndex = 0;
const productsPerPage = 9;
let goods = [];
let allGoods = [];
let likedItems = [];

document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await axios.get('http://localhost:3000/liked', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            likedItems = response.data.map(item => item.good_id);
        } catch (error) {
            console.error('Error fetching liked items:', error);
        }
    }

    axios.get('http://localhost:3000/data')
        .then(response => {
            allGoods = response.data; // Save the original product list
            loadProducts(response.data);
        })
        .catch(error => {
            console.error('There was an error fetching the data!', error);
        });

    const loadMoreButton = document.querySelector(".loadmore-button");
    if (loadMoreButton) {
        loadMoreButton.addEventListener("click", loadMoreProducts);
    } else {
        console.error('Load More button not found');
    }

    const searchInput = document.querySelector('.search-class');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
});

function createProductCard(product) {
    if (!product.good_name || !product.good_price) {
        console.error('Product data is missing name or price:', product);
        return '';
    }

    const productName = product.good_name;
    const productImg = `http://localhost:3000/photos/${product.photo_path}`;
    const isLiked = likedItems.includes(product.good_id);
    const heartIcon = isLiked ? require('../photo/redheartIcon.png') : require('../photo/heartIcon.png');

    return `
        <div class="product-card" data-good-id="${product.good_id}">
            <h3>${productName}</h3>
            <img src="${productImg}" alt="${productName}" />
            <p class="price">₴${product.good_price}</p>
            <a href="#" class="favorite">
                <img src="${heartIcon}" alt="Favorite Icon" />
            </a>
            <a href="#" class="cart">
                <img src="${require('../photo/cartIcon.png')}" alt="Cart Icon" />
            </a>
        </div>
    `;
}

function loadMoreProducts() {
    const productsContainer = document.querySelector(".products");
    if (!productsContainer) {
        console.error("Products container not found");
        return;
    }

    for (let i = currentIndex; i < currentIndex + productsPerPage && i < goods.length; i++) {
        const productCardHTML = createProductCard(goods[i]);
        if (productCardHTML) {
            productsContainer.innerHTML += productCardHTML;
        }
    }
    currentIndex += productsPerPage;

    const loadMoreButton = document.querySelector(".loadmore-button");
    if (loadMoreButton && currentIndex >= goods.length) {
        loadMoreButton.style.display = "none";
    }

    attachEventListeners();
}

function attachEventListeners() {
    document.querySelectorAll('.cart').forEach(cartIcon => {
        cartIcon.addEventListener('click', addToCart);
    });

    document.querySelectorAll('.favorite').forEach(favoriteIcon => {
        favoriteIcon.addEventListener('click', toggleLike);
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

function toggleLike(event) {
    event.preventDefault();
    const productCard = event.target.closest('.product-card');
    if (!productCard) return;

    const goodId = parseInt(productCard.dataset.goodId);
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You need to log in to like/unlike products.');
        return;
    }

    const isLiked = likedItems.includes(goodId);
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
            likedItems = likedItems.filter(id => id !== goodId);
        } else {
            event.target.src = require('../photo/redheartIcon.png');
            likedItems.push(goodId);
        }
    })
    .catch(error => {
        console.error(isLiked ? 'Error unliking product:' : 'Error liking product:', error);
        alert(isLiked ? 'Error unliking product' : 'Error liking product');
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

function loadProducts(fetchedGoods) {
    goods = fetchedGoods;
    loadMoreProducts();
}

function handleSearch(event) {
    const searchQuery = event.target.value.toLowerCase();
    const filteredGoods = allGoods.filter(product => product.good_name.toLowerCase().includes(searchQuery));
    
    currentIndex = 0; // Reset the current index
    document.querySelector('.products').innerHTML = ''; // Clear existing products
    goods = filteredGoods; // Set goods to filtered results
    loadMoreProducts(); // Load the filtered results
}

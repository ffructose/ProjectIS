import axios from 'axios';

let currentIndex = 0;
const productsPerPage = 6;
let goods = []; // Array to store fetched products

function createProductCard(product) {
    if (!product.good_name || !product.good_price) {
        console.error('Product data is missing name or price:', product);
        return ''; // Return an empty string if data is missing
    }

    const productName = product.good_name;
    const productImg = `http://localhost:3000/photos/${product.photo_path}`; // Using the photo path from the database
    return `
        <div class="product-card" data-good-id="${product.good_id}">
            <h3>${productName}</h3>
            <img src="${productImg}" alt="${productName}" />
            <p class="price">₴${product.good_price}</p>
            <a href="#" class="favorite">
                <img src="${require('../photo/heartIcon.png')}" alt="Favorite Icon" />
            </a>
            <a href="#" class="cart">
                <img src="${require('../photo/cartIcon.png')}" alt="Cart Icon" />
            </a>
        </div>
    `;
}

function loadMoreProducts() {
    const productsContainer = document.querySelector(".products");
    if (!productsContainer) return;

    for (let i = currentIndex; i < currentIndex + productsPerPage && i < goods.length; i++) {
        const productCardHTML = createProductCard(goods[i]);
        if (productCardHTML) {
            productsContainer.innerHTML += productCardHTML;
        }
    }
    currentIndex += productsPerPage;

    // Hide the button if there are no more products to load
    const loadMoreButton = document.querySelector(".loadmore-button");
    if (loadMoreButton && currentIndex >= goods.length) {
        loadMoreButton.style.display = "none";
    }

    // Attach event listeners for adding to cart
    const cartIcons = document.querySelectorAll('.cart');
    if (cartIcons) {
        cartIcons.forEach(cartIcon => {
            cartIcon.addEventListener('click', addToCart);
        });
    }
}

function addToCart(event) {
    event.preventDefault(); // Prevent the default link behavior
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
        showNotification(productName); // Show notification instead of alert
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
    }, 3000); // Hide the notification after 3 seconds
}

function loadProducts(fetchedGoods) {
    goods = fetchedGoods; // Store the fetched products in the goods array
    loadMoreProducts(); // Load the initial set of products
}

document.addEventListener("DOMContentLoaded", function() {
    const loadMoreButton = document.querySelector(".loadmore-button");
    if (loadMoreButton) {
        loadMoreButton.addEventListener("click", loadMoreProducts);
    }

    // Fetch data and pass it to loadProducts function
    axios.get('http://localhost:3000/data')
        .then(response => {
            console.log('Fetched data:', response.data); // Log the fetched data
            // Pass the fetched data to loadProducts function
            loadProducts(response.data);
        })
        .catch(error => {
            console.error('There was an error fetching the data!', error);
        });
});

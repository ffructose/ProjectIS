let currentIndex = 0;
const productsPerPage = 6;
let goods = []; // Array to store fetched products
import axios from 'axios';

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
    for (let i = currentIndex; i < currentIndex + productsPerPage && i < goods.length; i++) {
        const productCardHTML = createProductCard(goods[i]);
        if (productCardHTML) {
            productsContainer.innerHTML += productCardHTML;
        }
    }
    currentIndex += productsPerPage;

    // Hide the button if there are no more products to load
    if (currentIndex >= goods.length) {
        document.querySelector(".loadmore-button").style.display = "none";
    }

    // Attach event listeners for adding to cart
    document.querySelectorAll('.cart').forEach(cartIcon => {
        cartIcon.addEventListener('click', addToCart);
    });
}

async function addToCart(event) {
    event.preventDefault(); // Prevent the default link behavior
    const productCard = event.target.closest('.product-card');
    const goodId = productCard.dataset.goodId;

    const token = localStorage.getItem('token');
    if (!token) {
        alert("You must be logged in to add items to the cart.");
        return;
    }

    try {
        const response = await axios.post('http://localhost:3000/add-to-cart', { good_id: goodId }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'  // Ensure the content type is JSON
            }
        });

        if (response.status === 201) {
            alert('Product added to cart');
        } else {
            alert('Error adding product to cart');
        }
    } catch (error) {
        console.error('Error adding product to cart:', error);
        alert('Error adding product to cart');
    }
}


function loadProducts(fetchedGoods) {
    goods = fetchedGoods; // Store the fetched products in the goods array
    loadMoreProducts(); // Load the initial set of products
}

document.addEventListener("DOMContentLoaded", function() {
    document.querySelector(".loadmore-button").addEventListener("click", loadMoreProducts);
});


// Function to fetch data and pass it to catalogue.js
document.addEventListener('DOMContentLoaded', () => {
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
let currentIndex = 0;
const productsPerPage = 9;
let goods = []; // Array to store fetched products


function createProductCard(product) {
    if (!product.good_name || !product.good_price) {
        console.error('Product data is missing name or price:', product);
        return ''; // Return an empty string if data is missing
    }

    const productName = product.good_name;
    const productImg = `http://localhost:3000/photos/${product.photo_path}`; // Using the photo path from the database
    return `
        <div class="product-card">
            <h3>${productName}</h3>
            <img src="${productImg}" alt="${productName}" />
            <p class="price">₴${product.good_price}</p>
            <div class="favorite">
                 <img src="${require('../photo/heartIcon.png')}" alt="Favorite Icon" />
            </div>
            <div class="cart">
                <img src="${require('../photo/cartIcon.png')}" alt="Cart Icon" />
            </div>
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
}

export function loadProducts(fetchedGoods) {
    goods = fetchedGoods; // Store the fetched products in the goods array
    loadMoreProducts(); // Load the initial set of products
}

document.addEventListener("DOMContentLoaded", function() {
    document.querySelector(".loadmore-button").addEventListener("click", loadMoreProducts);
});

let goods = [];
goods[0] = {
    name: "macaron",
    price: 500.00
};
goods[1] = {
    name: "tiramisu",
    price: 500.00
};
goods[2] = {
    name: "panacota",
    price: 500.00
};
goods[3] = {
    name: "croissant",
    price: 500.00
};
goods[4] = {
    name: "brownie",
    price: 500.00
};
goods[5] = {
    name: "napoleon",
    price: 500.00
};
goods[6] = {
    name: "zaher",
    price: 500.00
};
goods[7] = {
    name: "medovyk",
    price: 500.00
};
goods[8] = {
    name: "babka",
    price: 500.00
};
goods[9] = {
    name: "korzynka",
    price: 500.00
};
goods[10] = {
    name: "cupcake",
    price: 500.00
};
goods[11] = {
    name: "cupcake",
    price: 500.00
};
goods[12] = {
    name: "cupcake",
    price: 500.00
};
goods[13] = {
    name: "cupcake",
    price: 500.00
};
goods[14] = {
    name: "cupcake",
    price: 500.00
};
goods[15] = {
    name: "cupcake",
    price: 500.00
};
goods[16] = {
    name: "cupcake",
    price: 500.00
};
goods[17] = {
    name: "cupcake",
    price: 500.00
};
goods[18] = {
    name: "cupcake",
    price: 500.00
};
goods[19] = {
    name: "cupcake",
    price: 500.00
};
goods[20] = {
    name: "cupcake",
    price: 500.00
};

let currentIndex = 0;
const productsPerPage = 9;


function createProductCard(product) {
    const productName = product.name.charAt(0).toUpperCase() + product.name.slice(1);
    // const productImg = require(`../photo/${product.name}.png`);
    const productImg = require(`../photo/cupcake.png`);
    return `
        <div class="product-card">
            <h3>${productName}</h3>
            <img src="${productImg}" alt="${productName}" />
            <p class="price">₴${product.price.toFixed(2)}</p>
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
        productsContainer.innerHTML += createProductCard(goods[i]);
    }
    currentIndex += productsPerPage;

    // Приховати кнопку, якщо більше немає продуктів для завантаження
    if (currentIndex >= goods.length) {
        document.querySelector(".loadmore-button").style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", function() {
    loadMoreProducts();
    document.querySelector(".loadmore-button").addEventListener("click", loadMoreProducts);
});
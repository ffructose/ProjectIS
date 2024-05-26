import axios from 'axios';

let currentIndex = 0;
const productsPerPage = 6;
let goods = [];
let allGoods = [];
let likedItems = [];
let selectedTypes = [];
let currentSortType = '';
let searchQuery = '';

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

    try {
        const typesResponse = await axios.get('http://localhost:3000/types');
        selectedTypes = typesResponse.data.map(type => type.type_id); // Initially select all types
        loadFilterOptions(typesResponse.data);
    } catch (error) {
        console.error('Error fetching product types:', error);
    }

    axios.get('http://localhost:3000/data')
        .then(response => {
            allGoods = response.data; // Save the original product list
            goods = allGoods;
            loadProducts();
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

    const filterButton = document.getElementById('filter-button');
    const filterMenu = document.querySelector('.filter-menu');
    if (filterButton && filterMenu) {
        filterButton.addEventListener('click', () => {
            filterMenu.classList.toggle('hidden');
            sortMenu.classList.add('hidden');
        });
    }

    const sortButton = document.getElementById('sort-button');
    const sortMenu = document.querySelector('.sort-menu');
    if (sortButton && sortMenu) {
        sortButton.addEventListener('click', () => {
            sortMenu.classList.toggle('hidden');
            filterMenu.classList.add('hidden');
        });

        sortMenu.querySelectorAll('li').forEach(item => {
            item.addEventListener('click', (event) => {
                const sortType = event.target.dataset.sort;
                handleSort(sortType);
                sortMenu.classList.add('hidden');
            });
        });
    }
});

function loadFilterOptions(types) {
    const filterContainer = document.querySelector('.filter-container');
    if (!filterContainer) return;

    types.forEach((type, index) => {
        const filterElement = document.createElement('div');
        filterElement.className = 'filter';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `filter-${index}`;
        checkbox.dataset.typeId = type.type_id;
        checkbox.checked = true; // Initially check all checkboxes

        const label = document.createElement('label');
        label.textContent = type.type_name;
        label.htmlFor = `filter-${index}`;

        filterElement.appendChild(label);
        filterElement.appendChild(checkbox);

        checkbox.addEventListener('change', function () {
            if (checkbox.checked) {
                selectedTypes.push(parseInt(checkbox.dataset.typeId));
            } else {
                selectedTypes = selectedTypes.filter(id => id !== parseInt(checkbox.dataset.typeId));
            }
            filterProducts();
        });

        filterContainer.appendChild(filterElement);
    });
}

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
    if (loadMoreButton) {
        if (currentIndex >= goods.length) {
            loadMoreButton.style.display = "none";
        } else {
            loadMoreButton.style.display = "block";
        }
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

function loadProducts() {
    const productsContainer = document.querySelector(".products");
    productsContainer.innerHTML = ''; // Clear existing products
    currentIndex = 0; // Reset the current index
    loadMoreProducts();
}

function handleSearch(event) {
    searchQuery = event.target.value.toLowerCase();
    filterProducts(); // Apply filter and sort after search
}

function handleSort(sortType) {
    currentSortType = sortType; // Save the current sort type

    switch (sortType) {
        case 'price-asc':
            goods.sort((a, b) => a.good_price - b.good_price);
            break;
        case 'price-desc':
            goods.sort((a, b) => b.good_price - a.good_price);
            break;
        case 'name-asc':
            goods.sort((a, b) => a.good_name.localeCompare(b.good_name));
            break;
        case 'name-desc':
            goods.sort((a, b) => b.good_name.localeCompare(a.good_name));
            break;
    }

    loadProducts(); // Load the sorted results
}

function filterProducts() {
    if (selectedTypes.length === 0) {
        goods = [];
    } else {
        goods = allGoods.filter(product => selectedTypes.includes(product.type_id) && product.good_name.toLowerCase().includes(searchQuery));
    }

    if (currentSortType) {
        handleSort(currentSortType); // Apply the current sort type after filtering
    } else {
        loadProducts(); // Load the filtered results
    }
}

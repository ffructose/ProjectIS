import axios from 'axios';

document.addEventListener('DOMContentLoaded', async () => {
    // Ensure the script runs only on the cart page
    if (!document.querySelector('.cart-list')) return;

    const token = localStorage.getItem('token');
    if (!token) {
        loadCartFromLocalStorage();
    } else {
        loadCartFromServer(token);
    }
});

function loadCartFromLocalStorage() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartList = document.querySelector('.cart-list');
    cartList.innerHTML = ''; // Clear the cart list before adding items

    cart.forEach(item => {
        const itemElement = createCartItemElement(item);
        cartList.appendChild(itemElement);
    });

    // Add event listeners for quantity changes and remove buttons
    document.querySelectorAll('.item-amount').forEach(input => {
        input.addEventListener('change', updateCartItemLocalStorage);
        input.addEventListener('change', updateItemPrice); // Update item price when quantity changes
    });
    document.querySelectorAll('.remove-item button').forEach(button => {
        button.addEventListener('click', removeCartItemLocalStorage);
    });

    // Update total price initially
    updateTotalPrice();
}

async function loadCartFromServer(token) {
    try {
        const response = await axios.get('http://localhost:3000/cart', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const cartItems = response.data;
        console.log('Cart items:', cartItems); // Log the cart items to ensure they are correct

        const cartList = document.querySelector('.cart-list');
        cartList.innerHTML = ''; // Clear the cart list before adding items

        cartItems.forEach(item => {
            const itemElement = createCartItemElement(item);
            cartList.appendChild(itemElement);
        });

        // Add event listeners for quantity changes and remove buttons
        document.querySelectorAll('.item-amount').forEach(input => {
            input.addEventListener('change', updateCartItemServer);
            input.addEventListener('change', updateItemPrice); // Update item price when quantity changes
        });
        document.querySelectorAll('.remove-item button').forEach(button => {
            button.addEventListener('click', removeCartItemServer);
        });

        // Update total price initially
        updateTotalPrice();

    } catch (error) {
        console.error('Error fetching cart items:', error);
        alert('Error fetching cart items');
    }
}

function createCartItemElement(item) {
    const itemElement = document.createElement('div');
    itemElement.classList.add('cart-item');
    itemElement.dataset.goodId = item.good_id;
    itemElement.dataset.goodPrice = item.good_price; // Store good price for easy access

    itemElement.innerHTML = `
        <span class="item-name">${item.good_name}</span>
        <div class="item-image">
            <img src="http://localhost:3000/photos/${item.photo_path}" alt="${item.good_name}" />
        </div>
        <input type="number" value="${item.order_item_quantity || item.quantity}" min="1" class="item-amount" data-good-id="${item.good_id}" />
        <span class="item-price">₴${(item.good_price * (item.order_item_quantity || item.quantity)).toFixed(2)}</span>
        <div class="remove-item">
            <button data-good-id="${item.good_id}">x</button>
        </div>
    `;
    return itemElement;
}

function updateCartItemLocalStorage(event) {
    const goodId = event.target.dataset.goodId;
    const newQuantity = parseInt(event.target.value, 10);

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.map(item => {
        if (item.good_id === goodId) {
            item.quantity = newQuantity;
        }
        return item;
    });

    localStorage.setItem('cart', JSON.stringify(cart));
    updateTotalPrice(); // Update total price when a cart item is updated
}

async function updateCartItemServer(event) {
    const goodId = event.target.dataset.goodId;
    const newQuantity = event.target.value;

    const token = localStorage.getItem('token');
    try {
        const response = await axios.put('http://localhost:3000/cart', {
            good_id: goodId,
            quantity: newQuantity
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Cart item updated:', response.data);
        updateTotalPrice(); // Update total price when a cart item is updated
    } catch (error) {
        console.error('Error updating cart item:', error);
        alert('Error updating cart item');
    }
}

function removeCartItemLocalStorage(event) {
    const goodId = event.target.dataset.goodId;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.good_id !== goodId);

    localStorage.setItem('cart', JSON.stringify(cart));
    event.target.closest('.cart-item').remove(); // Remove item from the DOM
    updateTotalPrice(); // Update total price when a cart item is removed
}

async function removeCartItemServer(event) {
    const goodId = event.target.dataset.goodId;

    const token = localStorage.getItem('token');
    try {
        const response = await axios.delete('http://localhost:3000/cart', {
            data: { good_id: goodId },
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Cart item removed:', response.data);
        event.target.closest('.cart-item').remove(); // Remove item from the DOM
        updateTotalPrice(); // Update total price when a cart item is removed
    } catch (error) {
        console.error('Error removing cart item:', error);
        alert('Error removing cart item');
    }
}

// Function to update the item price based on the quantity
function updateItemPrice(event) {
    const itemElement = event.target.closest('.cart-item');
    const goodPrice = parseFloat(itemElement.dataset.goodPrice);
    const quantity = parseInt(event.target.value, 10);
    const itemPriceElement = itemElement.querySelector('.item-price');
    itemPriceElement.textContent = `₴${(goodPrice * quantity).toFixed(2)}`;

    updateTotalPrice(); // Update total price when item price is updated
}

// Function to calculate and update the total price
function updateTotalPrice() {
    let totalPrice = 0;
    document.querySelectorAll('.cart-item').forEach(itemElement => {
        const goodPrice = parseFloat(itemElement.dataset.goodPrice);
        const quantity = parseInt(itemElement.querySelector('.item-amount').value, 10);
        totalPrice += goodPrice * quantity;
    });
    document.querySelector('.result-price').textContent = `₴${totalPrice.toFixed(2)}`;
}

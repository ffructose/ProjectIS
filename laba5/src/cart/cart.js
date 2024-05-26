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

    const proceedToCheckoutButton = document.querySelector('.cart-button');
    if (proceedToCheckoutButton) {
        proceedToCheckoutButton.addEventListener('click', proceedToCheckout);
    }

    const closeButton = document.querySelector('.close-button');
    if (closeButton) {
        closeButton.addEventListener('click', closeOrderBox);
    }

    const submitOrderButton = document.querySelector('.order-submit-button');
    if (submitOrderButton) {
        submitOrderButton.addEventListener('click', submitOrder);
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

    toggleProceedToCheckoutButton(cart.length > 0);

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

        toggleProceedToCheckoutButton(cartItems.length > 0);

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

    toggleProceedToCheckoutButton(cart.length > 0);
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

        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        toggleProceedToCheckoutButton(cart.length > 0);
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

async function proceedToCheckout() {
    const orderBox = document.querySelector('.order-box');
    const orderItemList = document.querySelector('.order-item-list');
    const totalPriceElement = document.querySelector('.full-price');
    let totalOrderPrice = 0;

    orderItemList.innerHTML = ''; // Clear the current order list

    document.querySelectorAll('.cart-item').forEach(itemElement => {
        const goodName = itemElement.querySelector('.item-name').textContent;
        const quantity = parseInt(itemElement.querySelector('.item-amount').value, 10);
        const itemPrice = parseFloat(itemElement.dataset.goodPrice) * quantity;

        const orderItemElement = document.createElement('div');
        orderItemElement.classList.add('order-item');

        orderItemElement.innerHTML = `
            <span class="name">${goodName}</span>
            <span class="amount">${quantity}</span>
            <span class="price">₴${itemPrice.toFixed(2)}</span>
        `;

        orderItemList.appendChild(orderItemElement);
        totalOrderPrice += itemPrice;
    });

    totalPriceElement.textContent = `₴${totalOrderPrice.toFixed(2)}`;

    const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await axios.get('http://localhost:3000/user', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const user = response.data;
            document.querySelector('.user-info-box input[name="name"]').value = user.user_login || '';
            document.querySelector('.user-info-box input[name="phone"]').value = user.user_phone || '';
            document.querySelector('.user-info-box input[name="mail"]').value = user.user_mail || '';
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    } else {
        // Clear the fields if the user is not logged in
        document.querySelector('.user-info-box input[name="name"]').value = '';
        document.querySelector('.user-info-box input[name="phone"]').value = '';
        document.querySelector('.user-info-box input[name="mail"]').value = '';
    }

    document.body.classList.add('inactive');
    orderBox.classList.add('show');
}

function closeOrderBox() {
    const orderBox = document.querySelector('.order-box');
    document.body.classList.remove('inactive');
    orderBox.classList.remove('show');
}

function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

function validatePhone(phone) {
    const phonePattern = /^\+?\d{10,15}$/; // Basic validation for phone numbers, adjust as needed
    return phonePattern.test(phone);
}

function validateForm() {
    const name = document.querySelector('.user-info-box input[name="name"]').value.trim();
    const phone = document.querySelector('.user-info-box input[name="phone"]').value.trim();
    const email = document.querySelector('.user-info-box input[name="mail"]').value.trim();
    const street = document.querySelector('.delivery-info-box input[name="street"]').value.trim();
    const houseNumber = document.querySelector('.delivery-info-box input[name="house-number"]').value.trim();
    const flatNumber = document.querySelector('.delivery-info-box input[name="flat-number"]').value.trim();
    const postalCode = document.querySelector('.delivery-info-box input[name="postal-code"]').value.trim();

    if (!name || !phone || !email || !street || !houseNumber || !flatNumber || !postalCode) {
        alert('All fields are required.');
        return false;
    }

    if (!validateEmail(email)) {
        alert('Please enter a valid email address.');
        return false;
    }

    if (!validatePhone(phone)) {
        alert('Please enter a valid phone number.');
        return false;
    }

    return true;
}

async function submitOrder(event) {
    event.preventDefault();

    if (!validateForm()) {
        return;
    }

    const token = localStorage.getItem('token');
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];

    const orderData = {
        user_login: document.querySelector('.user-info-box input[name="name"]').value.trim(),
        user_phone: document.querySelector('.user-info-box input[name="phone"]').value.trim(),
        user_mail: document.querySelector('.user-info-box input[name="mail"]').value.trim(),
        cartItems,
        isGuest: !token
    };

    try {
        const response = await axios.post('http://localhost:3000/submit-order', orderData, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        console.log('Order submitted:', response.data);

        // Close the order box
        closeOrderBox();

        // Show notification
        showNotification('Your order is being processed.');

        // Clear cart in local storage
        localStorage.removeItem('cart');

        // Clear cart items from the DOM
        const cartList = document.querySelector('.cart-list');
        cartList.innerHTML = '';
        updateTotalPrice();

        // Disable Proceed to Checkout button
        toggleProceedToCheckoutButton(false);
    } catch (error) {
        console.error('Error submitting order:', error);
        alert('Error submitting order');
    }
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.querySelector('.notification-text').textContent = message;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function toggleProceedToCheckoutButton(enable) {
    const proceedToCheckoutButton = document.querySelector('.cart-button');
    proceedToCheckoutButton.disabled = !enable;
}

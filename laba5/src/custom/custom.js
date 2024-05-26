import axios from 'axios';

// sizes list
let sizes = [];
// tastes list
let tastes = [];
// decors list
let decors = [];

let basePrice = 0.00;
let selectedSizePrice = 0;
let selectedTastesPrice = 0;
let selectedDecorsPrice = 0;
let isSizeSelected = false;
let isTasteSelected = false;
let isDecorSelected = false;

function updateTotalPrice() {
    const totalPrice = basePrice + (selectedTastesPrice * selectedSizePrice * 0.5 + selectedDecorsPrice * selectedSizePrice * 0.5) + selectedSizePrice * 35.3;
    const totalPriceElement = document.getElementById('totalPrice');
    if (totalPriceElement) {
        totalPriceElement.textContent = totalPrice.toFixed(2);
    }
    updateSubmitButtonState();
}

function updateSubmitButtonState() {
    const submitButton = document.querySelector('.custom-button.myButton');
    if (submitButton) {
        if (isSizeSelected && isTasteSelected && isDecorSelected) {
            submitButton.classList.remove('disabled');
            submitButton.disabled = false;
        } else {
            submitButton.classList.add('disabled');
            submitButton.disabled = true;
        }
    }
}

function populateSizes() {
    const sizeContainer = document.getElementById('sizeContainer');
    if (!sizeContainer) return;

    sizes.forEach((size, index) => {
        const sizeElement = document.createElement('div');
        sizeElement.className = 'size';
        sizeElement.textContent = size.size_name;
        sizeElement.dataset.price = size.size_price;
        sizeElement.addEventListener('click', function () {
            if (sizeElement.classList.contains('selected')) {
                sizeElement.classList.remove('selected');
                selectedSizePrice = 0;
                isSizeSelected = false;
            } else {
                document.querySelectorAll('.size').forEach(el => el.classList.remove('selected'));
                sizeElement.classList.add('selected');
                selectedSizePrice = parseFloat(size.size_price);
                isSizeSelected = true;
            }
            updateTotalPrice();
        });
        sizeContainer.appendChild(sizeElement);
    });
}

function populateTastes() {
    const tasteContainer = document.getElementById('tasteContainer');
    if (!tasteContainer) return;

    tastes.forEach((taste, index) => {
        const tasteElement = document.createElement('div');
        tasteElement.className = 'taste';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.dataset.price = taste.taste_price;
        checkbox.id = `taste-${index}`;

        const label = document.createElement('label');
        label.textContent = taste.taste_name;
        label.htmlFor = `taste-${index}`;

        tasteElement.appendChild(label);
        tasteElement.appendChild(checkbox);

        checkbox.addEventListener('change', function () {
            if (checkbox.checked) {
                selectedTastesPrice += parseFloat(checkbox.dataset.price);
                isTasteSelected = true;
            } else {
                selectedTastesPrice -= parseFloat(checkbox.dataset.price);
                isTasteSelected = document.querySelectorAll('#tasteContainer input:checked').length > 0;
            }
            updateTotalPrice();
        });

        tasteContainer.appendChild(tasteElement);
    });
}

function populateDecors() {
    const decorContainer = document.getElementById('decorContainer');
    if (!decorContainer) return;

    decors.forEach((decor, index) => {
        const decorElement = document.createElement('div');
        decorElement.className = 'decor';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.dataset.price = decor.decor_price;
        checkbox.id = `decor-${index}`;

        const label = document.createElement('label');
        label.textContent = decor.decor_name;
        label.htmlFor = `decor-${index}`;

        decorElement.appendChild(label);
        decorElement.appendChild(checkbox);

        checkbox.addEventListener('change', function () {
            if (checkbox.checked) {
                selectedDecorsPrice += parseFloat(checkbox.dataset.price);
                isDecorSelected = true;
            } else {
                selectedDecorsPrice -= parseFloat(checkbox.dataset.price);
                isDecorSelected = document.querySelectorAll('#decorContainer input:checked').length > 0;
            }
            updateTotalPrice();
        });

        decorContainer.appendChild(decorElement);
    });
}

function showNotification() {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000); // Show notification for 3 seconds
    }
}

// Call functions after document is loaded
document.addEventListener('DOMContentLoaded', () => {
    populateSizes();
    populateTastes();
    populateDecors();

    const submitButton = document.querySelector('.custom-button.myButton');
    if (submitButton) {
        submitButton.addEventListener('click', showNotification);
    }

    updateSubmitButtonState(); // Initialize button state
});

function loadProductsSizes(fetchedData) {
    sizes = fetchedData;
    populateSizes();
}

function loadProductsTastes(fetchedData) {
    tastes = fetchedData;
    populateTastes();
}

function loadProductsDecors(fetchedData) {
    decors = fetchedData;
    populateDecors();
}

console.log(sizes);
console.log(decors);
console.log(tastes);

// Fetch sizes
document.addEventListener('DOMContentLoaded', () => {
    axios.get('http://localhost:3000/sizes')
        .then(response => {
            console.log('Fetched data:', response.data);
            loadProductsSizes(response.data);
        })
        .catch(error => {
            console.error('There was an error fetching the data!', error);
        });
});

// Fetch tastes
document.addEventListener('DOMContentLoaded', () => {
    axios.get('http://localhost:3000/tastes')
        .then(response => {
            console.log('Fetched data:', response.data);
            loadProductsTastes(response.data);
        })
        .catch(error => {
            console.error('There was an error fetching the data!', error);
        });
});

// Fetch decors
document.addEventListener('DOMContentLoaded', () => {
    axios.get('http://localhost:3000/decors')
        .then(response => {
            console.log('Fetched data:', response.data);
            loadProductsDecors(response.data);
        })
        .catch(error => {
            console.error('There was an error fetching the data!', error);
        });
});

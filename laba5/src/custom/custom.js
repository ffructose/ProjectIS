console.log("custom.js loaded");
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
    const totalPrice = basePrice + (selectedTastesPrice*selectedSizePrice*0.5 + selectedDecorsPrice*selectedSizePrice*0.5) + selectedSizePrice * 35.3;
    document.getElementById('totalPrice').textContent = totalPrice.toFixed(2);
    updateSubmitButtonState();
}

function updateSubmitButtonState() {
    const submitButton = document.querySelector('.custom-button.myButton');
    if (isSizeSelected && isTasteSelected && isDecorSelected) {
        submitButton.classList.remove('disabled');
        submitButton.disabled = false;
    } else {
        submitButton.classList.add('disabled');
        submitButton.disabled = true;
    }
}

function populateSizes() {
    const sizeContainer = document.getElementById('sizeContainer');

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
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000); // Повідомлення буде показано протягом 3 секунд
}

// Виклик функцій після завантаження документа
document.addEventListener('DOMContentLoaded', () => {
    populateSizes();
    populateTastes();
    populateDecors();

    document.querySelector('.custom-button.myButton').addEventListener('click', showNotification);
    updateSubmitButtonState(); // Ініціалізація стану кнопки
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
// Function to fetch data 
document.addEventListener('DOMContentLoaded', () => {
    axios.get('http://localhost:3000/sizes')
        .then(response => {
            console.log('Fetched data:', response.data); // Log the fetched data
            // Pass the fetched data to loadProducts function
            loadProductsSizes(response.data);
        })
        .catch(error => {
            console.error('There was an error fetching the data!', error);
        });
});

// Function to fetch data 
document.addEventListener('DOMContentLoaded', () => {
    axios.get('http://localhost:3000/tastes')
        .then(response => {
            console.log('Fetched data:', response.data); // Log the fetched data
            // Pass the fetched data to loadProducts function
            loadProductsTastes(response.data);
        })
        .catch(error => {
            console.error('There was an error fetching the data!', error);
        });
});
// Function to fetch data 
document.addEventListener('DOMContentLoaded', () => {
    axios.get('http://localhost:3000/decors')
        .then(response => {
            console.log('Fetched data:', response.data); // Log the fetched data
            // Pass the fetched data to loadProducts function
            loadProductsDecors(response.data);
        })
        .catch(error => {
            console.error('There was an error fetching the data!', error);
        });
});

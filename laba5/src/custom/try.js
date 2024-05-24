console.log("try.js loaded");

// sizes list
let sizes = [];
sizes[0] = {
    name: "500 g",
    price: 500.00
};
sizes[1] = {
    name: "800 g",
    price: 800.00
};
sizes[2] = {
    name: "1 kg",
    price: 1000.00
};
sizes[3] = {
    name: "1.5 kg",
    price: 1500.00
};
sizes[4] = {
    name: "2 kg",
    price: 2000.00
};
sizes[5] = {
    name: "2.5 kg",
    price: 2500.00
};
sizes[6] = {
    name: "3 kg",
    price: 3000.00
};

// tastes list
let tastes = [];
tastes[0] = {
    name: "coconut",
    price: 80.90
};
tastes[1] = {
    name: "mangoe",
    price: 100.90
};
tastes[2] = {
    name: "pineapple",
    price: 120.90
};
tastes[3] = {
    name: "blueberry",
    price: 150.90
};
tastes[4] = {
    name: "peach",
    price: 150.90
};
tastes[5] = {
    name: "chocolate",
    price: 150.90
};
tastes[6] = {
    name: "cherry",
    price: 150.90
};

// decors list
let decors = [];
decors[0] = {
    name: "flowers",
    price: 80.90
};
decors[1] = {
    name: "fruits",
    price: 100.90
};
decors[2] = {
    name: "chocoballs",
    price: 120.90
};
decors[3] = {
    name: "cream plain",
    price: 150.90
};
decors[4] = {
    name: "cream words",
    price: 150.90
};

let basePrice = 0.00;
let selectedSizePrice = 0;
let selectedTastesPrice = 0;
let selectedDecorsPrice = 0;
let isSizeSelected = false;
let isTasteSelected = false;
let isDecorSelected = false;

function updateTotalPrice() {
    const totalPrice = basePrice + (selectedTastesPrice + selectedDecorsPrice) + selectedSizePrice * 1.3;
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
        sizeElement.textContent = size.name;
        sizeElement.dataset.price = size.price;
        sizeElement.addEventListener('click', function () {
            if (sizeElement.classList.contains('selected')) {
                sizeElement.classList.remove('selected');
                selectedSizePrice = 0;
                isSizeSelected = false;
            } else {
                document.querySelectorAll('.size').forEach(el => el.classList.remove('selected'));
                sizeElement.classList.add('selected');
                selectedSizePrice = parseFloat(size.price);
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
        checkbox.dataset.price = taste.price;
        checkbox.id = `taste-${index}`;

        const label = document.createElement('label');
        label.textContent = taste.name;
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
        checkbox.dataset.price = decor.price;
        checkbox.id = `decor-${index}`;

        const label = document.createElement('label');
        label.textContent = decor.name;
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

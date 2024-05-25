//---------------SCSS---------------//
import './scss/reset.scss'
import './scss/main.scss'
import './scss/header.scss'
import './scss/footer.scss'
import './scss/font.scss'
import './scss/template_content.scss'
import './scss/catalogue_content.scss'
import './scss/custom_content.scss'
import './scss/aboutus_content.scss'
import './scss/liked_content.scss'
import './scss/profile_content.scss'
import './scss/cart_content.scss'

//---------------JAVASCRIPT---------------//
import './custom/custom.js';  
import './catalogue/catalogue.js';  
import './profile/profile.js'; 

import { loadProducts } from './catalogue/catalogue';

// Import Axios
import axios from 'axios';

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
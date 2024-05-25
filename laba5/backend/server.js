const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs'); // Using bcryptjs
const jwt = require('jsonwebtoken');
const app = express();
const port = 3000;

const SECRET_KEY = '31072023'; // Your secret key

app.use(cors());
app.use(bodyParser.json());

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'ffructose',
    password: '21062004',
    database: 'yumico'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err.message);
        return;
    }
    console.log('Connected to MySQL Database');
});

// Serve static files from the "src/photo_for_db" directory
app.use('/photos', express.static(path.join(__dirname, '../src/photo_for_db')));

// Get goods data
app.get('/data', (req, res) => {
    const query = `
        SELECT good.good_id, good.good_name, good.good_price, good.good_type, photo.photo_path
        FROM good
        LEFT JOIN photo ON good.photo_id = photo.photo_id
    `;
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err.message);
            res.status(500).send('Server error');
            return;
        }
        res.json(results);
    });
});

// User registration
app.post('/register', async (req, res) => {
    const { user_login, user_password, user_mail, user_phone } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(user_password, 10);
        console.log('Hashed password during registration:', hashedPassword); // Log the hashed password

        const query = 'INSERT INTO user (user_login, user_password, user_mail, user_phone) VALUES (?, ?, ?, ?)';
        connection.query(query, [user_login, hashedPassword, user_mail, user_phone], (err, results) => {
            if (err) {
                console.error('Error registering user:', err.message);
                res.status(500).send('Server error: ' + err.message);
                return;
            }
            res.status(201).send('User registered');
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Server error: ' + error.message);
    }
});

// User login
app.post('/login', (req, res) => {
    const { user_login, user_password } = req.body;

    const query = 'SELECT * FROM user WHERE user_login = ?';
    connection.query(query, [user_login], async (err, results) => {
        if (err) {
            console.error('Error fetching user:', err.message);
            res.status(500).send('Server error: ' + err.message);
            return;
        }

        if (results.length === 0) {
            console.error('Invalid username or password: User not found');
            res.status(400).send('Invalid username or password');
            return;
        }

        const user = results[0];
        console.log('User found:', user); // Log the user found in the database

        try {
            console.log('Password entered:', user_password); // Log the entered password
            console.log('Hashed password from DB:', user.user_password); // Log the hashed password from DB

            const isValidPassword = await bcrypt.compare(user_password, user.user_password);
            console.log('Password comparison result:', isValidPassword); // Log the result of password comparison

            if (!isValidPassword) {
                console.error('Invalid username or password: Incorrect password');
                res.status(400).send('Invalid username or password');
                return;
            }

            const token = jwt.sign({ userId: user.user_id }, SECRET_KEY, { expiresIn: '1h' });
            res.json({ token });
        } catch (error) {
            console.error('Error comparing passwords:', error.message);
            res.status(500).send('Server error: ' + error.message);
        }
    });
});

// Middleware to authenticate user
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) {
        return res.sendStatus(401);
    }
    
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
};

// Example of a protected route
app.get('/protected', authenticateToken, (req, res) => {
    res.send('This is a protected route');
});


// Fetch logged-in user information
app.get('/user', authenticateToken, (req, res) => {
    const userId = req.user.userId;

    const query = 'SELECT user_login, user_mail, user_phone FROM user WHERE user_id = ?';
    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching user:', err.message);
            res.status(500).send('Server error: ' + err.message);
            return;
        }

        if (results.length === 0) {
            res.status(404).send('User not found');
            return;
        }

        const user = results[0];
        res.json(user);
    });
});




app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3000;

const SECRET_KEY = '31072023';

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

app.use('/photos', express.static(path.join(__dirname, '../src/photo_for_db')));

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

app.get('/sizes', (req, res) => {
    const query = `
        SELECT size.size_id, size.size_name, size.size_price FROM size
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
app.get('/decors', (req, res) => {
    const query = `
        SELECT decor.decor_id, decor.decor_name, decor.decor_price FROM decor
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
app.get('/tastes', (req, res) => {
    const query = `
        SELECT taste.taste_id, taste.taste_name, taste.taste_price FROM taste
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

app.post('/register', async (req, res) => {
    const { user_login, user_password, user_mail, user_phone } = req.body;
    console.log('Registration request received:', req.body);
    try {
        const hashedPassword = await bcrypt.hash(user_password, 10);
        console.log('Hashed password during registration:', hashedPassword);

        const query = 'INSERT INTO user (user_login, user_password, user_mail, user_phone) VALUES (?, ?, ?, ?)';
        connection.query(query, [user_login, hashedPassword, user_mail, user_phone], (err, results) => {
            if (err) {
                console.error('Error registering user:', err.message);
                res.status(500).send('Server error: ' + err.message);
                return;
            }
            console.log('User registered successfully:', results);
            res.status(201).send('User registered');
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Server error: ' + error.message);
    }
});

app.post('/login', (req, res) => {
    const { user_login, user_password } = req.body;
    console.log('Login request received:', req.body);

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
        console.log('User found:', user);

        try {
            console.log('Password entered:', user_password);
            console.log('Hashed password from DB:', user.user_password);

            const isValidPassword = await bcrypt.compare(user_password, user.user_password);
            console.log('Password comparison result:', isValidPassword);

            if (!isValidPassword) {
                console.error('Invalid username or password: Incorrect password');
                res.status(400).send('Invalid username or password');
                return;
            }

            const token = jwt.sign({ userId: user.user_id }, SECRET_KEY, { expiresIn: '1h' });
            console.log('Token generated:', token);
            res.json({ token });
        } catch (error) {
            console.error('Error comparing passwords:', error.message);
            res.status(500).send('Server error: ' + error.message);
        }
    });
});

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

app.put('/user', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const { user_mail, user_phone } = req.body;

    const query = 'UPDATE user SET user_mail = ?, user_phone = ? WHERE user_id = ?';
    connection.query(query, [user_mail, user_phone, userId], (err, results) => {
        if (err) {
            console.error('Error updating user:', err.message);
            res.status(500).send('Server error: ' + err.message);
            return;
        }

        console.log('User updated successfully:', results);
        res.status(200).send('User updated');
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

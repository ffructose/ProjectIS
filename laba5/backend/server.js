const express = require('express'); // фреймворк для створення веб-додатків.
const cors = require('cors'); //механізм доступу до ресурсів з різних доменів.
const mysql = require('mysql'); //підключення до бази даних MySQL.
const path = require('path'); // для роботи з шляхами файлів.
const bodyParser = require('body-parser'); //парсер JSON для аналізу вхідних даних запитів.
const bcrypt = require('bcryptjs'); //бібліотека для хешування паролів.
const jwt = require('jsonwebtoken'); //для генерації та перевірки JWT-токенів.
const app = express(); //об'єкт  Express.
const port = 3000; 

const SECRET_KEY = '31072023'; //секретний ключ для генерації JWT-токенів.

app.use(cors()); // дозволяє крос-доменні запити.
app.use(bodyParser.json());//дозволяє аналізувати JSON в тілі запитів.

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'ffructose',
    password: '21062004',
    database: 'yumico'
});

// встановлює підключення до бази даних та виводить повідомлення про успішне підключення або помилку.
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
        SELECT good.good_id, good.good_name, good.good_price, good.type_id, photo.photo_path
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
    const query = `SELECT size.size_id, size.size_name, size.size_price FROM size`;
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
    const query = `SELECT decor.decor_id, decor.decor_name, decor.decor_price FROM decor`;
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
    const query = `SELECT taste.taste_id, taste.taste_name, taste.taste_price FROM taste`;
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

// Add to cart
app.post('/add-to-cart', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const { good_id } = req.body;

    const orderQuery = 'SELECT * FROM orders WHERE user_id = ? AND order_status = "inCart"';
    connection.query(orderQuery, [userId], (err, orderResults) => {
        if (err) {
            console.error('Error fetching order:', err.message);
            res.status(500).send('Server error: ' + err.message);
            return;
        }

        let orderId;
        if (orderResults.length === 0) {
            const createOrderQuery = 'INSERT INTO orders (user_id, order_status) VALUES (?, "inCart")';
            connection.query(createOrderQuery, [userId], (err, createOrderResults) => {
                if (err) {
                    console.error('Error creating order:', err.message);
                    res.status(500).send('Server error: ' + err.message);
                    return;
                }
                orderId = createOrderResults.insertId;
                addOrderItem(orderId, good_id, res);
            });
        } else {
            orderId = orderResults[0].order_id;
            addOrderItem(orderId, good_id, res);
        }
    });
});

const addOrderItem = (orderId, goodId, res) => {
    const checkItemQuery = 'SELECT * FROM order_items WHERE order_id = ? AND good_id = ?';
    connection.query(checkItemQuery, [orderId, goodId], (err, results) => {
        if (err) {
            console.error('Error checking order item:', err.message);
            res.status(500).send('Server error');
            return;
        }

        if (results.length > 0) {
            // Item already exists in cart, update quantity
            const updateItemQuery = 'UPDATE order_items SET order_item_quantity = order_item_quantity + 1 WHERE order_id = ? AND good_id = ?';
            connection.query(updateItemQuery, [orderId, goodId], (err, updateResults) => {
                if (err) {
                    console.error('Error updating order item:', err.message);
                    res.status(500).send('Server error');
                    return;
                }
                res.status(200).send('Product quantity updated');
            });
        } else {
            // Item does not exist in cart, insert new item
            const insertItemQuery = 'INSERT INTO order_items (order_id, good_id, order_item_quantity) VALUES (?, ?, 1)';
            connection.query(insertItemQuery, [orderId, goodId], (err, insertResults) => {
                if (err) {
                    console.error('Error adding order item:', err.message);
                    res.status(500).send('Server error');
                    return;
                }
                res.status(201).send('Product added to cart');
            });
        }
    });
};

app.get('/cart', authenticateToken, (req, res) => {
    const userId = req.user.userId;

    const query = `
        SELECT good.good_id, good.good_name, good.good_price, type.type_name, photo.photo_path, order_items.order_item_quantity
        FROM orders
        INNER JOIN order_items ON orders.order_id = order_items.order_id
        INNER JOIN good ON order_items.good_id = good.good_id
        LEFT JOIN photo ON good.photo_id = photo.photo_id
        LEFT JOIN type ON good.type_id = type.type_id
        WHERE orders.user_id = ? AND orders.order_status = "inCart"
    `;
    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching cart items:', err.message);
            res.status(500).send('Server error');
            return;
        }
        res.json(results);
    });
});

// Update cart item quantity
app.put('/cart', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const { good_id, quantity } = req.body;

    const query = `
        UPDATE order_items 
        INNER JOIN orders ON order_items.order_id = orders.order_id 
        SET order_item_quantity = ? 
        WHERE orders.user_id = ? AND order_items.good_id = ? AND orders.order_status = "inCart"
    `;
    connection.query(query, [quantity, userId, good_id], (err, results) => {
        if (err) {
            console.error('Error updating cart item:', err.message);
            res.status(500).send('Server error');
            return;
        }
        res.status(200).send('Cart item updated');
    });
});

// Remove cart item
app.delete('/cart', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const { good_id } = req.body;

    const query = `
        DELETE order_items 
        FROM order_items 
        INNER JOIN orders ON order_items.order_id = orders.order_id 
        WHERE orders.user_id = ? AND order_items.good_id = ? AND orders.order_status = "inCart"
    `;
    connection.query(query, [userId, good_id], (err, results) => {
        if (err) {
            console.error('Error removing cart item:', err.message);
            res.status(500).send('Server error');
            return;
        }
        res.status(200).send('Cart item removed');
    });
});

// Like a product
app.post('/like', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const { good_id } = req.body;

    const query = 'INSERT IGNORE INTO user_likes (user_id, good_id) VALUES (?, ?)';
    connection.query(query, [userId, good_id], (err, results) => {
        if (err) {
            console.error('Error liking product:', err.message);
            res.status(500).send('Server error: ' + err.message);
            return;
        }
        res.status(201).send('Product liked');
    });
});

// Unlike a product
app.post('/unlike', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const { good_id } = req.body;

    const query = 'DELETE FROM user_likes WHERE user_id = ? AND good_id = ?';
    connection.query(query, [userId, good_id], (err, results) => {
        if (err) {
            console.error('Error unliking product:', err.message);
            res.status(500).send('Server error: ' + err.message);
            return;
        }
        res.status(200).send('Product unliked');
    });
});

// Get liked products
app.get('/liked', authenticateToken, (req, res) => {
    const userId = req.user.userId;

    const query = `
        SELECT good.good_id, good.good_name, good.good_price, type.type_name, photo.photo_path
        FROM user_likes
        INNER JOIN good ON user_likes.good_id = good.good_id
        LEFT JOIN photo ON good.photo_id = photo.photo_id
        LEFT JOIN type ON good.type_id = type.type_id
        WHERE user_likes.user_id = ?
    `;
    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching liked items:', err.message);
            res.status(500).send('Server error');
            return;
        }
        res.json(results);
    });
});

app.get('/types', (req, res) => {
    const query = 'SELECT type_id, type_name FROM type';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching product types:', err.message);
            res.status(500).send('Server error');
            return;
        }
        res.json(results);
    });
});

app.get('/product/:id', (req, res) => {
    const goodId = req.params.id;
    const query = `
        SELECT good.good_id, good.good_name, good.good_price, good.photo_id, photo.photo_path
        FROM good
        LEFT JOIN photo ON good.photo_id = photo.photo_id
        WHERE good.good_id = ?
    `;
    connection.query(query, [goodId], (err, results) => {
        if (err) {
            console.error('Error fetching product:', err.message);
            res.status(500).send('Server error');
            return;
        }
        if (results.length === 0) {
            res.status(404).send('Product not found');
            return;
        }
        res.json(results[0]);
    });
});

app.post('/submit-order', (req, res) => {
    const token = req.headers['authorization'] ? req.headers['authorization'].split(' ')[1] : null;
    if (token) {
        jwt.verify(token, SECRET_KEY, (err, user) => {
            if (err) {
                return res.status(403).send('Invalid token');
            }
            const userId = user.userId;
            processLoggedInOrder(userId, res);
        });
    } else {
        const { user_login, user_phone, user_mail, cartItems } = req.body;
        processGuestOrder(user_login, user_phone, user_mail, cartItems, res);
    }
});

function processLoggedInOrder(userId, res) {
    const updateOrderQuery = 'UPDATE orders SET order_status = "beingProcessed" WHERE user_id = ? AND order_status = "inCart"';
    connection.query(updateOrderQuery, [userId], (err, results) => {
        if (err) {
            console.error('Error updating order status:', err.message);
            res.status(500).send('Server error: ' + err.message);
            return;
        }

        const deleteOrderItemsQuery = 'DELETE FROM order_items WHERE order_id IN (SELECT order_id FROM orders WHERE user_id = ? AND order_status = "beingProcessed")';
        connection.query(deleteOrderItemsQuery, [userId], (err, results) => {
            if (err) {
                console.error('Error clearing cart items:', err.message);
                res.status(500).send('Server error: ' + err.message);
                return;
            }

            res.status(200).send('Order submitted and cart cleared');
        });
    });
}

function processGuestOrder(user_login, user_phone, user_mail, cartItems, res) {
    const createOrderQuery = 'INSERT INTO orders (user_id, order_status) VALUES (NULL, "beingProcessed")';
    connection.query(createOrderQuery, [], (err, results) => {
        if (err) {
            console.error('Error creating order:', err.message);
            res.status(500).send('Server error: ' + err.message);
            return;
        }
        const orderId = results.insertId;
        for (const item of cartItems) {
            const insertItemQuery = 'INSERT INTO order_items (order_id, good_id, order_item_quantity) VALUES (?, ?, ?)';
            connection.query(insertItemQuery, [orderId, item.good_id, item.quantity], (err, insertResults) => {
                if (err) {
                    console.error('Error adding order item:', err.message);
                    res.status(500).send('Server error: ' + err.message);
                    return;
                }
            });
        }
        res.status(200).send('Order submitted and cart cleared');
    });
}

//Запускає сервер на вказаному порту (3000).
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

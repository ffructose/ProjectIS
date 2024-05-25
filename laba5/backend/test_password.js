const bcrypt = require('bcryptjs');

const password = '0000'; // The password to hash and compare

// Step 1: Hash the password
bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
        console.error('Error hashing password:', err);
        return;
    }
    console.log('Hashed password:', hashedPassword);

    // Step 2: Compare the password with the hashed password
    bcrypt.compare(password, hashedPassword, (compareErr, isMatch) => {
        if (compareErr) {
            console.error('Error comparing passwords:', compareErr);
            return;
        }
        console.log('Password comparison result:', isMatch); // This should be true
    });
});

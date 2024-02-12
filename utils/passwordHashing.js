const bcrypt = require('bcryptjs');

exports.hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10); // Generate a random salt
    const hashedPassword = await bcrypt.hash(password, salt); // Hash the password with the salt
    return hashedPassword;
};

exports.verifyPassword = async (password, hashedPassword) => {
    const match = await bcrypt.compare(password, hashedPassword); // Compare the plain password with the hashed one
    return match; // Return true if they match, false otherwise
};

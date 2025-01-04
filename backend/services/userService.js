const userModel = require('../models/User');

module.exports.createUser = async ({
    username, password
}) => {
    if (!username || !password) {
        throw new Error('All fields are required');
    }
    const user = userModel.create({
        username,
        password
    })

    return user;
}
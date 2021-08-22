const express = require('express');
const router = express.Router();

// 500 is for internal server error
const getAllUsers = (req, res) => {
    res.status(500).json({
        status: 'err',
        message: 'This route has not been created',
    });
};

const getUser = (req, res) => {
    res.status(500).json({
        status: 'err',
        message: 'This route has not been created',
    });
};

const createUser = (req, res) => {
    res.status(500).json({
        status: 'err',
        message: 'This route has not been created',
    });
};

const updateUser = (req, res) => {
    res.status(500).json({
        status: 'err',
        message: 'This route has not been created',
    });
};

const deleteUser = (req, res) => {
    res.status(500).json({
        status: 'err',
        message: 'This route has not been created',
    });
};

// USERS
router.route('/').get(getAllUsers).post(createUser);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;

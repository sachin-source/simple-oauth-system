const express = require('express');
const { authenticate } = require('../services/comman');
const router = express.Router();

const userRoutes = require("./user.router");

// mount user routes at /users
router.use('/user', userRoutes);

router.get('/*', (req, res) =>
    res.send('OK')
);
module.exports = router;
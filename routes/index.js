const express = require('express');
const router = express.Router();

// Handle GET request for index page.
router.get('/', (req, res, next) => {
    res.render('index', {
        title: 'Test',
        greeting: 'user'
    });
});

module.exports = router;
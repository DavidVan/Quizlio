const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();

const secrets = require('../secrets')

const twilio = require('twilio');
const client = new twilio(secrets.accountSid, secrets.authToken);

// Handle GET request for index page.
router.get('/', (req, res, next) => {
    res.render('index', {
        title: 'Test',
        greeting: 'user'
    });
});

module.exports = router;
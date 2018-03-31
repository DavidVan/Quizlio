const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();

const vr = require('../voiceresponse')

// Handle GET request for index page.
router.post('/', (req, res, next) => {
    console.log(vr.toString());
});

module.exports = router;
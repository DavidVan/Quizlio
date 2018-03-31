const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();

const client = require('../twilio_client');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const response = new VoiceResponse();

router.get('/', (req, res) => {
    res.render('index', {
        title: 'Test',
        greeting: 'user'
    });     
});

router.post('/', (req, res, next) => {
	var details = req.app.get('details');

    response.gather({
        input: 'speech',
        action: '/completed'
    }).say('Hello ' + details.Name + 'Welcome to Quizlio, Thank you for using our product and good luck on your exams!');
    res.send(response.toString())
});

module.exports = router;
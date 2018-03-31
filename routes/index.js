const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();

const client = require('../twilio_client');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const response = new VoiceResponse();

router.get('/', (req, res) => {
    client.calls
      .create({
        url: 'http://82f51894.ngrok.io',
        to: '+15625081464',
        from: '+15623624420',
      })
      .then(call => process.stdout.write(call.sid));
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
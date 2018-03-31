const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();

const client = require('../twilio_client');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const response = new VoiceResponse();

router.get('/', (req, res, next) => {
	var details = req.app.get('details');
	console.log(details);
	let Name = details.Name;
	let Questions = details.Questions;
	let Answers = details.Answers;
	client.calls.create({
		url: 'http://4534a5e5.ngrok.io/',
		to: details.Phone,
		from: '+15622474577'
	})

    response.redirect({
        method: 'POST'
    }, '/')
    res.send(response.toString())
});


module.exports = router;
// @flow

const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const session = require('express-session');
const Twilio = require('twilio');
const secrets = require('./secrets');

const index = require('./routes/index');
const completed = require('./routes/completed');
const quiz = require('./routes/quiz');
const custom = require('./routes/custom');
const client = require('./twilio_client');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const response = new VoiceResponse();

const app = express();

app.use(bodyParser.json());
app.use('/quiz', quiz);
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');

app.get('/index2', (req, res) => {
  res.sendFile(path.join(__dirname, 'index2.html'));
});
app.use('/', index);
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

app.listen(process.env.PORT || 3000, () => console.log('Server running on port 3000'));

app.post('/details', function(req, res) {
    let num_cards = 4;
    let details = {
      Name: req.body.Name,
      Phone: req.body.Phone,
      Questions: {},
      Answers: {},
      Greeting: true,
      User: {
        num_correct: 0
      }
    };
    for (let i = 1; i <= num_cards; i++) {
      details.Questions['Q' + i] = req.body['Q' + i];
      details.Answers['A' + i] = req.body['A' + i];
    }
    app.set('details_' + details.Phone, details);
    client.calls.create({
        url: secrets.url,
        to: details.Phone,
        from: secrets.fromPhoneNumber
    }).then(call => process.stdout.write(call.sid))
    .catch(err => console.error(err));
    res.send(details);
});

app.post('/', (req, res) => {
    const details = app.get('details_' + req.body.Called);
    let twiml = new Twilio.twiml.VoiceResponse();

    if (details.Greeting) {
        twiml.say("Hello " + details.Name + ". Welcome to Quizlio!");
        details.Greeting = false;
    }

    const frontCard = Object.values(details.Questions);
    const backCard = Object.values(details.Answers);

    Ask(frontCard, backCard, req.body.SpeechResult, twiml, res, details);
});

app.post('/completed', (req, res) => {
    const details = app.get('details_' + req.body.Called);

    const frontCard = Object.values(details.Questions);
    const backCard = Object.values(details.Answers);

    let twiml = new Twilio.twiml.VoiceResponse();
    const answer = req.body.SpeechResult
      .replace(/(\r\n\t|\n|\r\t)/gm, '')
      .replace('.', '')
      .toLowerCase()
      .trim();

    if (backCard[details.User.num_correct].toLowerCase() === answer) {
        twiml.say('That is correct. The card back saids ' +
            backCard[details.User.num_correct]);

        twiml.redirect({
            method: 'POST'
        }, '/');

        details.User.num_correct++;

        res.send(twiml.toString());
    }
    else {
        incorrect(twiml, res);
    }
});

function Ask(frontCard, backCard, SpeechResult, twiml, res, details) {
    if (SpeechResult !== undefined && SpeechResult.replace('.', '').toLowerCase().trim() === 'yes') {
        twiml.say('Skipping...');
        details.User.num_correct += 1;
        twiml.redirect({
            method: 'POST'
        }, '/');
    } else if (SpeechResult !== undefined && SpeechResult.replace('.', '').toLowerCase().trim() === 'no') {
        twiml.say('Not skipping. Please try again.');
        twiml.redirect({
            method: 'POST'
        }, '/');
    } else {
        twiml.say('Card ' + (details.User.num_correct + 1));
        twiml.gather({
          input: 'speech',
          timeout: 3,
          action: '/completed'
        })
        .say({
          voice: 'women',
        },
        frontCard[details.User.num_correct]);
    }

    res.type('text/xml');
    res.send(twiml.toString());
}

function incorrect(twiml, res) {
    twiml.say('That is incorrect.');
    twiml.gather({
        input: 'speech',
        timeout: 3,
        action: '/'
    })
    .say('Do you want to skip?');

    res.send(twiml.toString());
}

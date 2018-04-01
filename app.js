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

app.use('/', index);
app.get('/index2', (req, res) => {
  res.sendFile(path.join(__dirname, 'index2.html'));
})
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

app.listen(process.env.PORT || 3000, () => console.log('Server running on port 3000'));

app.post('/details', function(req, res) {
    let num_cards = req.body.NumCards || 4;
    let details = {
        Name: req.body.Name,
        Phone: req.body.Phone,
        // Mode: req.body.Mode,
        Mode: 'question', // placeholder. use above
        // Flipped: req.body.Flipped,
        Flipped: false, // placeholder. use above
        Questions: {},
        Answers: {},
        Greeting: true,
        User: {
          num_correct: 0
        }
    };
    if (req.body.cards) {
      for (var i = 1; i <= num_cards; i++) {
        details.Questions['Q' + i] = req.body.cards[i-1].front;
        details.Answers['A' + i] = req.body.cards[i-1].back;
      }
    } else {
      for (let i = 1; i <= num_cards; i++) {
          details.Questions['Q' + i] = req.body['Q' + i];
          details.Answers['A' + i] = req.body['A' + i];
      }
    }
    app.set('details_' + details.Phone, details);
    console.log(details);
    client.calls.create({
        url: secrets.url,
        to: details.Phone,
        from: secrets.fromPhoneNumber
    }).then(call => process.stdout.write(call.sid));
    res.send(details);
});

app.post('/', (req, res) => {
    const details = app.get('details_' + req.body.Called);
    let twiml = new Twilio.twiml.VoiceResponse();
    let user = details.User;

    if (details.Greeting) {
        twiml.say({
                voice: 'woman',
            }, "Hello " + details.Name + ". Welcome to Quizlio!");
        details.Greeting = false;
    }

    const frontCard = Object.values(details.Questions);
    const backCard = Object.values(details.Answers);

    if (details.Mode === 'vocab') {
        if (details.Flipped) {
            Ask(backCard, frontCard, req.body.SpeechResult, twiml, res, user);
        }
        else {
            Ask(frontCard, backCard, req.body.SpeechResult, twiml, res, user);
        }
    }
    else { // otherwise, question mode
        Ask(frontCard, backCard, req.body.SpeechResult, twiml, res, user);
    }
});

app.post('/completed', (req, res) => {
    const details = app.get('details_' + req.body.Called);
    let user = details.User;

    const frontCard = Object.values(details.Questions); // AKA Vocab Term
    const backCard = Object.values(details.Answers); // AKA Definition

    let twiml = new Twilio.twiml.VoiceResponse();
    const answer = req.body.SpeechResult
        .replace(/(\r\n\t|\n|\r\t)/gm, '')
        .replace('.', '')
        .replace('?', '')
        .toLowerCase()
        .trim();


    if (details.Mode === 'question' && backCard[user.num_correct].toLowerCase() === answer) {
        twiml.say({
                voice: 'woman',
            }, 'That is correct. The card back saids ' + backCard[user.num_correct]);

        twiml.redirect({
            method: 'POST'
        }, '/');

        user.num_correct++;

        res.send(twiml.toString());
    }
    else if (details.Mode === 'vocab') {
        if (details.Flipped && frontCard[user.num_correct].toLowerCase().replace('.', '').replace('?', '').split(' ').includes(answer) || !details.Flipped && backCard[user.num_correct].toLowerCase() === answer) { // User guessing definition, so it should be contains/include OR User guessing word, so it should be an exact match
            let vocabAnswer =  details.Flipped ? frontCard[user.num_correct] : backCard[user.num_correct];
            twiml.say({
                    voice: 'woman',
                }, 'That is correct. The card says ' + vocabAnswer);

            twiml.redirect({
                method: 'POST'
            }, '/');
            user.num_correct++;
            res.send(twiml.toString());
        }
        else {
            incorrect(twiml, res);
        }
    }
    else {
        incorrect(twiml, res);
    }
});

function Ask(frontCard, backCard, SpeechResult, twiml, res, user) {
    if (SpeechResult !== undefined && SpeechResult.replace('.', '').toLowerCase().trim() === 'yes') {
        twiml.say({
                voice: 'woman',
            }, 'Skipping...');
        user.num_correct += 1;
        twiml.redirect({
            method: 'POST'
        }, '/');
    }
    else if (SpeechResult !== undefined && SpeechResult.replace('.', '').toLowerCase().trim() === 'no') {
        twiml.say({
                voice: 'woman',
            }, 'Not skipping. Please try again.');
        twiml.redirect({
            method: 'POST'
        }, '/');
    }
    else {
        twiml.say({
                voice: 'woman',
            }, 'Card ' + (user.num_correct + 1));
        twiml.gather({
                input: 'speech',
                timeout: 6,
                action: '/completed',
                voice: 'woman'
            })
            .say({
                    voice: 'woman',
                }, frontCard[user.num_correct]);
    }

    res.type('text/xml');
    res.send(twiml.toString());
}

function incorrect(twiml, res) {
    twiml.say({
            voice: 'woman',
        }, 'That is incorrect.');
    twiml.gather({
            input: 'speech',
            timeout: 6,
            action: '/',
            voice: 'woman'
        })
        .say({
            voice: 'woman',
        }, 'Do you want to skip?');

    res.send(twiml.toString());
}

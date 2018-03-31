// @flow
const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const Twilio = require('twilio');
const fs = require('fs');
const session = require('express-session')

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');

const set = fs.readFileSync('exampleset2', 'utf8')
  .split('\n').map(card => card.split(','));

let termTranslatedLang = false;

let user = {
  num_correct: 0,
};

app.post('/', (req, res) => {
  if (!req.session.hasUser) {
    user = {num_correct: 0};
    req.session.hasUser = 1;
  }

  let twiml = new Twilio.twiml.VoiceResponse();
  twiml.say('Card ' + (user.num_correct + 1));

  if (termTranslatedLang) {
    twiml.gather({
      input: 'speech',
      timeout: 3,
      action: '/completed',
    })
    .say({
      voice: 'women',
      language: 'ja-JP'
    },
    set[user.num_correct][0]);
  } else {
    twiml.gather({
      input: 'speech',
      timeout: 3,
      action: '/completed',
      voice: 'women',
      language: 'ja-JP'
    })
    .say({
      voice: 'women',
    },
    set[user.num_correct][1]);
  }

  res.type('text/xml');
  res.send(twiml.toString());
});

function incorrect(twiml, res) {
      twiml.say('That is incorrect. Try again.');

      twiml.redirect({
        method: 'POST'
      }, '/');

      res.send(twiml.toString());
}

app.post('/completed', (req, res) => {
	let twiml = new Twilio.twiml.VoiceResponse();
  let answer = req.body.SpeechResult;

  if (termTranslatedLang) {
    console.log(1, set[user.num_correct][1], answer)

    if (set[user.num_correct][1].toLowerCase().indexOf(answer) >= 0) {
      twiml.say('That is correct. The card back saids ' + set[user.num_correct][1]);

      twiml.redirect({
        method: 'POST'
      }, '/');

      user.num_correct++;

      res.send(twiml.toString());
    } else {
      incorrect(twiml, res);
    }
  } else {
    console.log(2, set[user.num_correct][2], answer)
    if (set[user.num_correct][2] == answer)
    {
      twiml.say("That is correct. The card back saids ");
      twiml.say({
        language: 'ja-JP',
        voice: 'women'
      }, set[user.num_correct][0]);

      twiml.redirect({
        method: 'POST'
      }, '/');

      user.num_correct++;

      res.send(twiml.toString());
    } else {
      incorrect(twiml, res);
    }
  }
});

app.listen(process.env.PORT || 3000);
console.log('Server running on port 3000');

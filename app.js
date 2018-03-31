// @flow
const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const session = require('express-session');
const Twilio = require('twilio');

const index = require('./routes/index');
const completed = require('./routes/completed');
const quiz = require('./routes/quiz');
const custom = require('./routes/custom');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');

app.use('/', index);
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));
app.use('/completed', completed);
app.use('/quiz', quiz);
app.use('/custom', custom)

app.post('/details', function(req,res){
  // TODO(phil): Fix this number to not be hard coded
  let num_cards = 4;
	let details = {
		Name: req.body.Name,
		Phone: req.body.Phone,
		Questions: [],
		Answers: [],
    // TODO(david): fix this below for parsing
    Pronounciation: [],
    language: req.body.Languange || 'en'
  };
  for (let i = 1; i <= num_cards; i++) {
    details.Questions.push(req.body['Q' + i]);
    details.Answers.push(req.body['A' + i]);
  }
  req.session.details = details;
	res.send(details);
});

let user = {
  num_correct: 0,
};
let termTranslatedLang = false;

app.post('/', (req, res) => {
  if (!req.session.hasUser) {
    user = { num_correct: 0 };
    req.session.hasUser = true;
  }

	const details = req.session.details;
	console.log('details=' + details);

  let twiml = new Twilio.twiml.VoiceResponse();

  if (!req.session.greeting) {
    twiml.say("Hello " + details.Name + ". Welcome to Quizlio!");
    req.session.greeting = true;
  }

  let SpeechResult = "";
  if (!req.body.SpeechResult) {
    SpeechResult = req.body.SpeechResult.replace('.', '').toLowerCase().trim();
  }

  if (SpeechResult === 'yes') {
      twiml.say('Skipping...');
      user.num_correct += 1;
      twiml.redirect({
        method: 'POST'
      }, '/');
  }
  else if (SpeechResult === 'no') {
      twiml.say('Not skipping. Please try again.');
      twiml.redirect({
        method: 'POST'
      }, '/');
  }
  else {
      twiml.say('Card ' + (user.num_correct + 1));

      if (termTranslatedLang) {
        twiml.gather({
          input: 'speech',
          timeout: 3,
          action: '/completed',
        })
        .say({
          voice: 'women',
          language: req.session.details.language
        },
        req.session.details.Questions[user.num_correct]);
      } else {
        twiml.gather({
          input: 'speech',
          timeout: 3,
          action: '/completed',
          voice: 'women',
          language: req.session.details.language
        })
        .say({
          voice: 'women',
        },
        req.session.details.Answers[user.num_correct]);
      }
  }

  res.type('text/xml');
  console.log('twiml.toString()=' + twiml.toString());
  res.send(twiml.toString());
});

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

app.post('/completed', (req, res) => {
	const details = req.session.details;
	let twiml = new Twilio.twiml.VoiceResponse();
  let answer = req.body.epeechResult.replace(/(\r\n\t|\n|\r\t)/gm, '').trim();

  if (termTranslatedLang) {
    console.log(1, details.Answers[user.num_correct], answer)

    if (details.Answers[user.num_correct].toLowerCase().indexOf(answer) >= 0) {
      twiml.say('That is correct. The card back saids ' + details.Answers[user.num_correct]);

      twiml.redirect({
        method: 'POST'
      }, '/');

      user.num_correct++;

      res.send(twiml.toString());
    } else {
      incorrect(twiml, res);
    }
   } else {
     if (details.Questions[user.num_correct]) {

       let Question;

       if (details.Pronounciation.length) {
         Question = details.Pronounciation[user.num_correct]
           .replace(/(\r\n\t|\n|\r\t)/gm, '').trim();
       } else {
         Question = details.Questions[user.num_correct]
           .replace(/(\r\n\t|\n|\r\t)/gm, '').trim();
       }

       console.log(2, Question, answer);

       if (Question == answer) {
         twiml.say("That is correct. The card back saids ");
         twiml.say({
           language: details.language,
           voice: 'women'
         }, Question);

         twiml.redirect({
           method: 'POST'
         }, '/');

         user.num_correct++;

         res.send(twiml.toString());
       } else {
         incorrect(twiml, res);
       }
     }
   }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running on port 3000');
});

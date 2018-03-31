const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const session = require('express-session')
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
app.listen(process.env.PORT || 3000);
console.log('Server running on port 3000');

app.post('/details', function(req,res){
	let details = {
		Name: req.body.Name,
		Phone: req.body.Phone,
		Questions:{
		Q1: req.body.Q1, 
		Q2: req.body.Q2,
		Q3: req.body.Q3,
		Q4: req.body.Q4,
		},
		Answers:{
		A1: req.body.A1,
		A2: req.body.A2,
		A3: req.body.A3,
		A4: req.body.A4,
		}						
	};
	res.send(details);
	app.set('details', details);

});

let user = {
  num_correct: 0,
};
let termTranslatedLang = false;
let usedOnce = 0;


app.post('/', (req, res) => {
	const details = app.get('details');
	console.log(details);
let frontCard = Object.values(details.Questions);
let backCard = Object.values(details.Answers);
  if (!req.session.hasUser) {
    user = {num_correct: 0};
    req.session.hasUser = 1;
  }

  let twiml = new Twilio.twiml.VoiceResponse();
  if(usedOnce == 0) {
 	 twiml.say("Hello " + details.Name + ". Welcome to Quizlio!");
 	 usedOnce++;
	}

  if (req.body.SpeechResult !== undefined) {
      console.log(req.body.SpeechResult.replace('.', ''));
  }
  if (req.body.SpeechResult !== undefined && req.body.SpeechResult.replace('.', '').toLowerCase().trim() === 'yes') {
      twiml.say('Skipping...');
      user.num_correct += 1;
      twiml.redirect({
        method: 'POST'
      }, '/');
  }
  else if (req.body.SpeechResult !== undefined && req.body.SpeechResult.replace('.', '').toLowerCase().trim() === 'no') {
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
          // language: 'ja-JP'
        },
        frontCard[user.num_correct]);
      } else {
        twiml.gather({
          input: 'speech',
          timeout: 3,
          action: '/completed',
          voice: 'women',
          // language: 'ja-JP'
        })
        .say({
          voice: 'women',
        },
        backCard[user.num_correct]);
      }
  }

  res.type('text/xml');
  console.log(twiml.toString());
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
      // twiml.redirect({
      //   method: 'POST'
      // }, '/');

      res.send(twiml.toString());
}

app.post('/completed', (req, res) => {
	var details = app.get('details');
	let frontCard = Object.values(details.Questions);
	let backCard = Object.values(details.Answers);
	let twiml = new Twilio.twiml.VoiceResponse();
  let answer = req.body.SpeechResult.replace(/(\r\n\t|\n|\r\t)/gm, '').trim();

  if (termTranslatedLang) {
    console.log(1, backCard[user.num_correct], answer)

    if (backCard[user.num_correct].toLowerCase().indexOf(answer) >= 0) {
      twiml.say('That is correct. The card back saids ' + backCard[user.num_correct]);

      twiml.redirect({
        method: 'POST'
      }, '/');

      user.num_correct++;

      res.send(twiml.toString());
    } else {
      incorrect(twiml, res);
    }
 //  } else {
 //  	if(set[user.num_correct][2] != null){
 //    pronunciation = set[user.num_correct][2].replace(/(\r\n\t|\n|\r\t)/gm, '').trim();
 //    console.log(2, pronunciation, answer)
 //    if (pronunciation == answer)
 //    {
 //      twiml.say("That is correct. The card back saids ");
 //      twiml.say({
 //        language: 'ja-JP',
 //        voice: 'women'
 //      }, set[user.num_correct][0]);

 //      twiml.redirect({
 //        method: 'POST'
 //      }, '/');

 //      user.num_correct++;

 //      res.send(twiml.toString());
 //    } else {
 //      incorrect(twiml, res);
 //    }
	// }
 //  }
}
});





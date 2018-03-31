const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');

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





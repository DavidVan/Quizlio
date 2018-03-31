const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');

const index = require('./routes/index');
const completed = require('./routes/completed');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');

app.use('/', index);
app.use('/completed', completed);
app.listen(process.env.PORT || 3000);
console.log('Server running on port 3000');
// Load Node modules
var express = require('express');
const ejs = require('ejs');
// Initialise Express
var app = express();
// Render static files
app.use(express.static('public'));
// Set the view engine to ejs
app.set('view engine', 'ejs');
// Port website will run on
app.listen(8080);

// *** GET Routes - display pages ***
// Root Route
app.get('/', function (req, res) {
    res.render('pages/index');
});
// about page
app.get('/about', function(req, res) {
  res.render('pages/hsbp');
});

app.listen(8080);
console.log('Server is listening on port 8080');

app.set('view engine', 'ejs');

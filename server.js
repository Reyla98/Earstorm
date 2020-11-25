var express = require('express');
var consolidate = require('consolidate');
var bodyParser = require('body-parser');
const port = 8080;

//Set up server
var app = express();
app.engine('html', consolidate.hogan);
app.set('views', 'static');
app.use(express.static('static'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(bodyParser.text());

//Redirect
app.get('/homepage', function(req,res){
    res.render('homepage.html');
});

app.post('/login', function(req,res){
    res.render('homepage.html');
});

app.post('/signup', function(req,res){
    res.render('homepage.html');
});

app.listen(port, function(){
    console.log('Server running on port 8080');
});
var express = require('express');
var consolidate = require('consolidate');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
const port = 8080;
let session = require('express-session');

//Set up server
var app = express();
app.use(session({secret:'earstorm123'}));
app.engine('html', consolidate.hogan);
app.set('views', 'static');
app.use(express.static('static'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(bodyParser.text());


app.get('/homepage', function(req,res){
    if(req.session.username!=null){
        res.render("homepage.html", {username:req.session.username});
    }
    else{
        res.render('homepage.html', {login:"Log in"});
    }
});

app.get('/login', function(req,res){
    res.render("login.html");
});

app.get('/account', function(req,res){
    res.render('account.html', {username:req.session.username});
});

app.post('/login', function(req,res){
    req.session.username = req.body.loginUsername;
    res.render("account.html", {username:req.session.username})
});

app.post('/signup', function(req,res){
    req.session.username = req.body.signUpUsername;
    res.render("account.html", {username:req.session.username});
});

app.get('/addPlaylist', function(req,res){
    res.render('create_playlist.html', {username:req.session.username});
});

app.post('/createPlaylist', function(req,res){
    res.redirect('/homepage');
});

app.get('/searchPlaylist', function(req,res){
    //TODO
    res.redirect('/homepage');
});

app.get('/showAll', function(req,res){
    //TODO
    res.redirect('/homepage');
});

app.get('/logout', function(req,res){
    req.session.username = null;
    res.redirect('/homepage');
});

app.listen(port, function(){
    console.log('Server running on port 8080');
});

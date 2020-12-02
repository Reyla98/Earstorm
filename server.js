var express = require('express');
var consolidate = require('consolidate');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
const port = 8080;
var session = require('express-session');
var bcrypt = require('bcrypt');
const saltRounds = 10;

//Set up server
var app = express();
app.use(session({secret:'earstorm123'}));
app.engine('html', consolidate.hogan);
app.set('views', 'static');
app.use(express.static('static'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(bodyParser.text());

MongoClient.connect('mongodb://localhost:27017/earstorm', (err, db)=>{
    if(err) throw err;
    var dbo = db.db('earstorm');

    app.get('/', function(req,res){
        res.redirect('/homepage');
    });

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
        var username = req.body.loginUsername;
        dbo.collection('users').findOne({"username": username}, function(err, result){
            if(err) throw err;
            if (result==null){
                res.render("login.html");
            }
            else{
                bcrypt.compare(req.body.loginPassword, result.password, function(err, result){
                    if(err) throw err;
                    if(result){
                        req.session.username = username;
                        res.render('account.html', {username:username});
                    }
                    else{
                        res.render('login.html');
                    }
                });
            }
        });
    });
    
    app.post('/signup', function(req,res){
        var username = req.body.signUpUsername;
        var password = req.body.signUpPassword;
        var email = req.body.emailAddress;
        dbo.collection('users').findOne({"username":username}, function(err, result){
            if(err) throw err;
            if(result!=null){
                res.render('login.html');
            }
            else{
                bcrypt.hash(password, saltRounds, function(err, result){
                    if(err)throw err;
                    var newUser = {"username": username, "password":result, "email":email};
                    dbo.collection('users').insertOne(newUser, function(err, result){
                        if (err) throw err;
                        console.log('User added successfuly');
                    });
                });
            }
            req.session.username=username;
            res.render("account.html", {"username":username});
        });
    });
    
    app.get('/addPlaylist', function(req,res){
        res.render('create_pl.html', {username:req.session.username});
    });
    
    app.post('/createPlaylist', function(req,res){
        res.redirect('/homepage');
    });
    
    app.get('/searchplaylist', function(req,res){
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
});


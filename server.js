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

MongoClient.connect('mongodb+srv://groupD:group-5678D@earstorm.twelv.mongodb.net/Earstorm?retryWrites=true&w=majority', { useUnifiedTopology: true }, (err, db)=>{
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
				res.render("login.html", {loginErrorMessage: "Unknown username"});
			}else{
				bcrypt.compare(req.body.loginPassword, result.password, function(err, result){
					if(err) throw err;
					if(result){
						req.session.username = username;
						res.render('account.html', {username:username});
					}else{
						res.render('login.html', {loginErrorMessage:"Wrong password"});
					}
				});
			}
		});
	});
	
	app.post('/signup', function(req,res){
		dbo.collection('users').findOne({"username":req.body.signUpUsername}, function(err, result){
				if(err) throw err;
				if(result!=null){
						res.render('login.html', {signupErrorMessage:"Username already taken"});
				}
				else{
						let username = req.body.signUpUsername;
						let password = req.body.signUpPassword;
						let email = req.body.emailAddress;
						bcrypt.hash(password, saltRounds, function(err, hash){
								if(err)throw err;
								var newUser = {"username": username, "password":hash, "email":email};
								dbo.collection('users').insertOne(newUser, function(err, result){
										if (err) throw err;
										console.log('User added successfully');
								});
						});
						req.session.username = username;
						res.render("account.html", {"username":username});
				}
		});
  });
	
	app.get('/addPlaylist', function(req,res){
			res.render('create_playlist.html', {username:req.session.username});
	});
	
  app.post('/createPlaylist', function(req,res){
		//let illustration = req.body.customFile
		let name = req.body.playlist_name;
		//let creator = req.session.username;
		let creation_date = new Date();
		let mod_date = new Date();
		//let genres = (req.body.playlist_genres).replace(/&/g, "").split("playlist_genres");
		let titles = (req.body.playlist_titles).replace(/ /g, "").split(",");
		if (req.session.playlist_id == null){
			let playlistInfo = {
				//illustration,
				name,
				//creator,
				creation_date,
				mod_date,
				//genres,
				titles
			};
			dbo.collection('playlists').insertOne(playlistInfo, function(err,result){
				if(err) throw err;
					console.log('Playlist added successfully');
				});
		} else {
			let playlistInfo = {
				//illustration,
				name,
				mod_date,
				//genres,
				titles
			};
			let id = req.session.playlist_id;
			dbo.collection('playlists').update({_id:id},{$set:{playlistInfo}}, function(err,result){
				if(err) throw err;
					console.log('Playlist modified successfully');
			});
			req.session.playlist_id = null;
		}
		res.redirect("/homepage");
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

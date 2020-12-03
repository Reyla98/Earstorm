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
        dbo.collection('playlists').find({}).toArray(function(err,doc){
            if(req.session.username!=null){
                let newDoc = {"playlist_list": doc, username:req.session.username}
                res.render("homepage.html",newDoc);
            }
            else{
                let newDoc = {"playlist_list": doc, login:"Log in"}
                res.render('homepage.html', newDoc);
            }
        });
	});
	
	app.get('/login', function(req,res){
			res.render("login.html");
	});
	
	app.get('/account', function(req,res){
        dbo.collection('playlists').find({creator : req.session.username}).toArray(function(err,doc){
            if(err)throw err;
            res.render("account.html", {"playlist_list" : doc, username:req.session.username});
        });
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
						res.redirect('/account');
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
    
    app.get('/modifyPlaylist', function(req,res){
        req.session.id = null;
        res.render('create_playlist.html', {username:req.session.username});
    });
	
  app.post('/createPlaylist', function(req,res){
		let illustration = req.body.customFile;
        let title = req.body.playlist_name;
        let description = req.body.playlist_descr || "No description";
		let creator = req.session.username;
		let creation_date = getFullDate();
		let mod_date = getFullDate();
        let genres = req.body.playlist_genres;
        let otherGenres = (req.body.playlist_add_genre).replace(/ /g, "").split(",");
        for(i in otherGenres){
            genres.push(otherGenres[i]);
        }
		let titles = (req.body.playlist_titles).replace(/ /g, "").split(",");
		if (req.session.playlist_id == null){
			let playlistInfo = {
				picture : null,
                title : title,
                description : description,
				creator : creator,
				creation_date : creation_date,
				modification_date : mod_date,
				genres :genres,
				titles : titles
			};
			dbo.collection('playlists').insertOne(playlistInfo, function(err,result){
				if(err) throw err;
					console.log('Playlist added successfully');
				});
        } else {
			let playlistInfo = {
				picture : null,
                title : title,
                description : description || "No description",
				modification_date : mod_date,
				genres :genres,
				titles : titles
			};
			let id = req.session.playlist_id;
			dbo.collection('playlists').updateOne({_id:id},{$set:{playlistInfo}}, function(err,result){
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

function getFullDate(){
    let date = new Date();
    let d = date.getDate() + "/" + (Number(date.getMonth())+1).toString() +"/" + date.getFullYear();
    return d;
  }

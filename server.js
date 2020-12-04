const express = require('express');
const consolidate = require('consolidate');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const port = 8080;
const session = require('express-session');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const mongoose = require('mongoose');
const imgModel = require('./model');

//Set up server
const app = express();
app.use(session({secret:'earstorm123'}));
app.engine('html', consolidate.hogan);
app.set('views', 'static');
app.use(express.static('static'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(bodyParser.text());


MongoClient.connect('mongodb+srv://groupD:group-5678D@earstorm.twelv.mongodb.net/Earstorm?retryWrites=true&w=majority',
                 {useUnifiedTopology: true, useNewUrlParser: true},
                 (err, db) => {
    if (err) throw err;
    var dbo = db.db('earstorm');
	
	app.get('/', function(req, res) {
		res.redirect('/homepage');
	});
	
	app.get('/homepage', function(req, res) {
        dbo.collection('playlists').find({}).toArray(function(err, doc) {
            if (err) throw err;
            if (req.session.username != null) {
                let newDoc = {"playlist_list": doc, username:req.session.username, title:doc.title}
                res.render("homepage.html", newDoc);
            } else {
                let newDoc = {"playlist_list": doc, login:"Log in", title:doc.title}
                res.render('homepage.html', newDoc);
            }
        });
	});
	
	app.get('/login', function(req, res) {
			res.render("login.html");
	});
	
	app.get('/account', function(req, res) {
        dbo.collection('playlists').find({creator:req.session.username}).toArray(function(err, doc) {
            if (err) throw err;
            res.render("account.html", {"playlist_list": doc, username: req.session.username});
        });
	});

	app.post('/login', function(req, res) {
		var username = req.body.loginUsername;
		dbo.collection('users').findOne({"username": username}, function(err, result) {
			if (err) throw err;
			if (result == null){
				res.render("login.html", {loginErrorMessage:"Unknown username"});
			} else {
				bcrypt.compare(req.body.loginPassword, result.password, function(err, result) {
					if (err) throw err;
					if (result) {
						req.session.username = username;
						res.redirect('/account');
					}
                    else {
						res.render('login.html', {loginErrorMessage:"Wrong password"});
					}
				});
			}
		});
	});
	
	app.post('/signup', function(req, res) {
		dbo.collection('users').findOne({"username": req.body.signUpUsername}, function(err, result) {
				if(err) throw err;
				if(result!=null){
						res.render('login.html', {signupErrorMessage:"Username already taken"});
				} else {
						let username = req.body.signUpUsername;
						let password = req.body.signUpPassword;
						let email = req.body.emailAddress;
						bcrypt.hash(password, saltRounds, function(err, hash){
								if(err)throw err;
								var newUser = {"username": username, "password":hash, "email":email};
								dbo.collection('users').insertOne(newUser, function(err, result) {
										if (err) throw err;
										console.log('User added successfully');
								});
						});
						req.session.username = username;
						res.render("account.html", {"username":username});
				}
		});
    });
	
	app.get('/addPlaylist', function(req, res) {
			res.render('create_playlist.html', {username:req.session.username});
    });
    
    app.get('/modifyPlaylist', function(req, res) {
        // faire en sorte qu'on sache de quelle playlist il s'agit
        req.session.id = null;
        res.render('create_playlist.html', {username:req.session.username});
    });
	
    app.post('/createPlaylist', function(req, res) {
		let illustration = req.body.customFile;
        let title = req.body.playlist_name;
        let description = req.body.playlist_descr || "No description";
		let creator = req.session.username;
		let creation_date = getFullDate();
		let modification_date = getFullDate();

        if (Array.isArray(req.body.playlist_genres)) {
            var genres = req.body.playlist_genres; //jsp pq mais ça marche pas avec let
        } else {
            var genres = [];                       //idem
            genres.push(req.body.playlist_genres);
        }

        let otherGenres = (req.body.playlist_add_genre).replace(/ /g, "").split(",");
        for (i in otherGenres) {
            genres.push(otherGenres[i]);
        }

        let img_object = {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'image/png'
        }

        imgModel.create(img_object, (err, item) => {
            if (err) throw err;
            res.redirect('/addPlaylist');
        });

		let urls = (req.body.playlist_titles).replace(/ /g, "").split(",");

		if (req.session.playlist_id == null) {
            let songs = [];
            for (let url of urls) {
                songs.push({'url': url, 'date': getFullDate()})
            }
			let playlistInfo = {
				picture: null,
                title: title,
                description: description,
				creator: creator,
				creation_date: creation_date,
				modification_date: modification_date,
				genres: genres,
				songs: songs
			};
			dbo.collection('playlists').insertOne(playlistInfo, function(err,result) {
				if(err) throw err;
					console.log('Playlist added successfully');
				});
        } else {
            let songs = req.session.songs;
            let url_already_in = {};
            for (let song of songs) {
                url_already_in.push(song.url);
            }
            for (let url of urls) {
                if (! url_already_in.includes(url)) {
                    songs.push({url: url, date: getFullDate()})
                }
            }
			let playlistInfo = {
				picture: null,
                title: title,
                description: description || "No description",
				modification_date: mod_date,
				genres: genres,
				songs: songs
			};
			let id = req.session.playlist_id;
			dbo.collection('playlists').updateOne({_id:id}, {$set:{playlistInfo}}, function(err, result) {
				if (err) throw err;
					console.log('Playlist modified successfully');
			});
			req.session.playlist_id = null;
		}
		res.redirect("/account");
	});

    app.get('/playlist_content', function(req, res) {
        let query_title = req.query.title;
        dbo.collection('playlists').findOne({title:query_title}, function(err, doc) {
            if (err) throw err;
            if (req.session.username != null) {
                res.render("playlist_content.html", {"song_list": doc.songs,
                                             username: req.session.username,
                                             title: doc.title,
                                             genres: doc.genres,
                                             description: doc.description,
                                             creator: doc.creator
                                         });
            } else {
                res.render('playlist_content.html', {"song_list": doc.songs,
                                                     login:"Log in",
                                                     title: doc.title,
                                                     genres: doc.genres,
                                                     description: doc.description,
                                                     creator: doc.creator});
            }
        })
    });
	
	app.get('/searchplaylist', function(req, res) {
		//TODO
		res.redirect('/homepage');
	});
	
	app.get('/showAll', function(req, res) {
		//TODO
		res.redirect('/homepage');
	});
	
	app.get('/logout', function(req, res) {
		req.session.username = null;
		res.redirect('/homepage');
	});
	
	app.listen(port, function() {
		console.log('Server running on port 8080');
	});
	
});

function getFullDate() {
    let date = new Date();
    let d = date.getDate() + "/" + (Number(date.getMonth())+1).toString() +"/" + date.getFullYear();
    return d;
  }

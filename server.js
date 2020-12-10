const express = require('express');
const consolidate = require('consolidate');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const https = require('https');
const fs = require('fs');
const port = 8080;
const session = require('express-session');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const getVideoId = require('get-video-id');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

//Set up server
const app = express();
app.use(session({secret:'earstorm123', resave: true, saveUninitialized: false}));
/*
J'ai ajouté les options resave & saveUninitialized pour retirer le 'deprecation warning' au lancement du serveur...
Mais je ne suis pas certaine pour les valeurs, je me suis basée sur ce que j'ai lu ici: 
https://stackoverflow.com/questions/40381401/when-to-use-saveuninitialized-and-resave-in-express-session
https://github.com/expressjs/session#options
*/
app.engine('html', consolidate.hogan);
app.set('views', 'static');
app.use(express.static('static'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(bodyParser.text());


MongoClient.connect('mongodb+srv://groupD:group-5678D@earstorm.twelv.mongodb.net/Earstorm?retryWrites=true&w=majority', { useUnifiedTopology: true }, (err, db) => {
		if (err) throw err;
		var dbo = db.db('earstorm');

		app.get('/', function(req, res) {
			res.render('welcome_page.html');
		});

		app.get('/homepage', function(req, res) {
			req.session.sorting = null;
			req.session.search = null;
			dbo.collection('playlists').find({}).toArray(function(err, doc) {
				if (err) throw err;
				for (let playlist of doc) {
					playlist.modification_date = getFullDate(playlist.modification_date);
					playlist.creation_date = getFullDate(playlist.creation_date);
				}
				if (req.session.username != null) {
					let newDoc = {"playlist_list": doc, username:req.session.username, title:doc.title,
												 pl_title:"Title", pl_descr:"Description", pl_creator:"Creator", pl_created:"Created on", pl_modified:"Last modified on"}
					res.render("homepage.html", newDoc);
				} else {
					let newDoc = {"playlist_list": doc, login:"Log in", title:doc.title,
												 pl_title:"Title", pl_descr:"Description", pl_creator:"Creator", pl_created:"Created on", pl_modified:"Last modified on"}
					res.render('homepage.html', newDoc);
				}
			});
		});
			
		app.get('/sort_titles', function(req, res) {
			if (req.session.search == null){
				if (req.session.sorting != "titles1"){
					dbo.collection('playlists').find({}).sort({"title":1}).toArray(function(err, doc) {
						if (err) throw err;
						req.session.sorting = "titles1"
						for (let playlist of doc) {
							playlist.modification_date = getFullDate(playlist.modification_date);
							playlist.creation_date = getFullDate(playlist.creation_date);
						}
						if (req.session.username != null) {
							let newDoc = {"playlist_list": doc, username:req.session.username, title:doc.title,
														 pl_title:"Title ˄", pl_descr:"Description", pl_creator:"Creator", pl_created:"Created on", pl_modified:"Last modified on"}
							res.render("homepage.html", newDoc);
						} else {
								let newDoc = {"playlist_list": doc, login:"Log in", title:doc.title,
															 pl_title:"Title ˄", pl_descr:"Description", pl_creator:"Creator", pl_created:"Created on", pl_modified:"Last modified on"}
								res.render('homepage.html', newDoc);
						}
					});
				} else {
					dbo.collection('playlists').find({}).sort({"title":-1}).toArray(function(err, doc) {
						if (err) throw err;
						req.session.sorting = "titles-1"
						for (let playlist of doc) {
							playlist.modification_date = getFullDate(playlist.modification_date);
							playlist.creation_date = getFullDate(playlist.creation_date);
						}
						if (req.session.username != null) {
							let newDoc = {"playlist_list": doc, username:req.session.username, title:doc.title,
														 pl_title:"Title ˅", pl_descr:"Description", pl_creator:"Creator", pl_created:"Created on", pl_modified:"Last modified on"}
							res.render("homepage.html", newDoc);
						} else {
								let newDoc = {"playlist_list": doc, login:"Log in", title:doc.title,
															 pl_title:"Title ˅", pl_descr:"Description", pl_creator:"Creator", pl_created:"Created on", pl_modified:"Last modified on"}
								res.render('homepage.html', newDoc);
						}
					});
				}
			} else {
			//sort search results
			//TO DO
			}
		});
			
		app.get('/sort_description', function(req, res) {
			if (req.session.search == null){
				if (req.session.sorting != "description1"){
					dbo.collection('playlists').find({}).sort({"description":1}).toArray(function(err, doc) {
						if (err) throw err;
						req.session.sorting = "description1"
						for (let playlist of doc) {
							playlist.modification_date = getFullDate(playlist.modification_date);
							playlist.creation_date = getFullDate(playlist.creation_date);
						}
						if (req.session.username != null) {
							let newDoc = {"playlist_list": doc, username:req.session.username, title:doc.title,
														 pl_title:"Title", pl_descr:"Description ˄", pl_creator:"Creator", pl_created:"Created on", pl_modified:"Last modified on"}
							res.render("homepage.html", newDoc);
						} else {
							let newDoc = {"playlist_list": doc, login:"Log in", title:doc.title,
														 pl_title:"Title", pl_descr:"Description ˄", pl_creator:"Creator", pl_created:"Created on", pl_modified:"Last modified on"}
							res.render('homepage.html', newDoc);
						}
					});
				} else {
					dbo.collection('playlists').find({}).sort({"description":-1}).toArray(function(err, doc) {
						if (err) throw err;
						req.session.sorting = "description-1"
						for (let playlist of doc) {
							playlist.modification_date = getFullDate(playlist.modification_date);
							playlist.creation_date = getFullDate(playlist.creation_date);
						}
						if (req.session.username != null) {
							let newDoc = {"playlist_list": doc, username:req.session.username, title:doc.title,
														 pl_title:"Title", pl_descr:"Description ˅", pl_creator:"Creator", pl_created:"Created on", pl_modified:"Last modified on"}
							res.render("homepage.html", newDoc);
						} else {
							let newDoc = {"playlist_list": doc, login:"Log in", title:doc.title,
														 pl_title:"Title", pl_descr:"Description ˅", pl_creator:"Creator", pl_created:"Created on", pl_modified:"Last modified on"}
							res.render('homepage.html', newDoc);
						}
					});
				}
			} else { 
			//sort search results
			// TO DO
			}
		});
			
		app.get('/sort_creator', function(req, res) {
			if (req.session.search == null){
				if (req.session.sorting != "creator1"){
					dbo.collection('playlists').find({}).sort({"creator":1}).toArray(function(err, doc) {
						if (err) throw err;
						req.session.sorting = "creator1"
						for (let playlist of doc) {
							playlist.modification_date = getFullDate(playlist.modification_date);
							playlist.creation_date = getFullDate(playlist.creation_date);
						}
						if (req.session.username != null) {
							let newDoc = {"playlist_list": doc, username:req.session.username, title:doc.title,
														 pl_title:"Title", pl_descr:"Description", pl_creator:"Creator ˄", pl_created:"Created on", pl_modified:"Last modified on"}
							res.render("homepage.html", newDoc);
						} else {
							let newDoc = {"playlist_list": doc, login:"Log in", title:doc.title,
														 pl_title:"Title", pl_descr:"Description", pl_creator:"Creator ˄", pl_created:"Created on", pl_modified:"Last modified on"}
							res.render('homepage.html', newDoc);
						}
					});
				} else {
					dbo.collection('playlists').find({}).sort({"creator":-1}).toArray(function(err, doc) {
						if (err) throw err;
						req.session.sorting = "creator-1"
						for (let playlist of doc) {
							playlist.modification_date = getFullDate(playlist.modification_date);
							playlist.creation_date = getFullDate(playlist.creation_date);
						}
						if (req.session.username != null) {
							let newDoc = {"playlist_list": doc, username:req.session.username, title:doc.title,
														 pl_title:"Title", pl_descr:"Description", pl_creator:"Creator ˅", pl_created:"Created on", pl_modified:"Last modified on"}
							res.render("homepage.html", newDoc);
						} else {
							let newDoc = {"playlist_list": doc, login:"Log in", title:doc.title,
														 pl_title:"Title", pl_descr:"Description", pl_creator:"Creator ˅", pl_created:"Created on", pl_modified:"Last modified on"}
							res.render('homepage.html', newDoc);
						}
					});
				}
			} else {
				//sort search results
				//TO DO
			}
		});
		
		app.get('/sort_created', function(req, res) {
			if (req.session.search == null){
				if (req.session.sorting != "created1"){
					dbo.collection('playlists').find({}).sort({"creation_date":1}).toArray(function(err, doc) {
						if (err) throw err;
						req.session.sorting = "created1"
						for (let playlist of doc) {
							playlist.modification_date = getFullDate(playlist.modification_date);
							playlist.creation_date = getFullDate(playlist.creation_date);
						}
						if (req.session.username != null) {
							let newDoc = {"playlist_list": doc, username:req.session.username, title:doc.title,
														 pl_title:"Title", pl_descr:"Description", pl_creator:"Creator", pl_created:"Created on ˄", pl_modified:"Last modified on"}
							res.render("homepage.html", newDoc);
						} else {
							let newDoc = {"playlist_list": doc, login:"Log in", title:doc.title,
														 pl_title:"Title", pl_descr:"Description", pl_creator:"Creator", pl_created:"Created on ˄", pl_modified:"Last modified on"}
							res.render('homepage.html', newDoc);
						}
					});
				} else {
					dbo.collection('playlists').find({}).sort({"creation_date":-1}).toArray(function(err, doc) {
						if (err) throw err;
						req.session.sorting = "created-1"
						for (let playlist of doc) {
							playlist.modification_date = getFullDate(playlist.modification_date);
							playlist.creation_date = getFullDate(playlist.creation_date);
						}
						if (req.session.username != null) {
							let newDoc = {"playlist_list": doc, username:req.session.username, title:doc.title,
														 pl_title:"Title", pl_descr:"Description", pl_creator:"Creator", pl_created:"Created on ˅", pl_modified:"Last modified on"}
							res.render("homepage.html", newDoc);
						} else {
							let newDoc = {"playlist_list": doc, login:"Log in", title:doc.title,
														 pl_title:"Title", pl_descr:"Description", pl_creator:"Creator", pl_created:"Created on ˅", pl_modified:"Last modified on"}
							res.render('homepage.html', newDoc);
						}
					});
				}
			} else {
				//sort search results
				// TO DO
			}
		});
		
		app.get('/sort_modified', function(req, res) {
			if (req.session.search == null){
				if (req.session.sorting != "modified1"){
					dbo.collection('playlists').find({}).sort({"modification_date":1}).toArray(function(err, doc) {
						if (err) throw err;
						req.session.sorting = "modified1"
						for (let playlist of doc) {
							playlist.modification_date = getFullDate(playlist.modification_date);
							playlist.creation_date = getFullDate(playlist.creation_date);
						}
						if (req.session.username != null) {
							let newDoc = {"playlist_list": doc, username:req.session.username, title:doc.title,
														 pl_title:"Title", pl_descr:"Description", pl_creator:"Creator", pl_created:"Created on", pl_modified:"Last modified on ˄"}
							res.render("homepage.html", newDoc);
						} else {
							let newDoc = {"playlist_list": doc, login:"Log in", title:doc.title,
														 pl_title:"Title", pl_descr:"Description", pl_creator:"Creator", pl_created:"Created on", pl_modified:"Last modified on ˄"}
							res.render('homepage.html', newDoc);
						}
					});
				} else {
					dbo.collection('playlists').find({}).sort({"modification_date":-1}).toArray(function(err, doc) {
						if (err) throw err;
						req.session.sorting = "modified-1"
						for (let playlist of doc) {
							playlist.modification_date = getFullDate(playlist.modification_date);
							playlist.creation_date = getFullDate(playlist.creation_date);
						}
						if (req.session.username != null) {
							let newDoc = {"playlist_list": doc, username:req.session.username, title:doc.title,
														 pl_title:"Title", pl_descr:"Description", pl_creator:"Creator", pl_created:"Created on", pl_modified:"Last modified on ˅"}
							res.render("homepage.html", newDoc);
						} else {
							let newDoc = {"playlist_list": doc, login:"Log in", title:doc.title,
														 pl_title:"Title", pl_descr:"Description", pl_creator:"Creator", pl_created:"Created on", pl_modified:"Last modified on ˅"}
							res.render('homepage.html', newDoc);
						}
					});
				}
			} else {
				//sort search results
				// TO DO
			}
		});
		
		app.get('/login', function(req, res) {
			res.render("login.html");
		});

		app.get('/account', function(req, res) {
			if (req.session.username == null){
				return res.render('login.html', {disconnectedErrorMessage:"Please log in to access your account."});
			}
			dbo.collection('playlists').find({creator:req.session.username}).toArray(function(err, doc) {
				if (err) throw err;
				for (let playlist of doc) {
					playlist.modification_date = getFullDate(playlist.modification_date);
					playlist.creation_date = getFullDate(playlist.creation_date);
				}
				if (req.session.accountMessage != null){
					let message = req.session.accountMessage;
					req.session.accountMessage = null;
					res.render("account.html", {"playlist_list": doc, username: req.session.username, "accountMessage":message});
				} else {
					res.render("account.html", {"playlist_list": doc, username: req.session.username});
				}
			});
		});

		app.post('/login', function(req, res) {
			var username = req.body.loginUsername;
			dbo.collection('users').findOne({"username": username}, function(err, result) {
				if (err) throw err;
				if (result == null){
					res.render("login.html", {usernameErrorMessage:"UNKNOWN USERNAME"});
				} else {
					bcrypt.compare(req.body.loginPassword, result.password, function(err, result) {
						if (err) throw err;
						if (result) {
							req.session.username = username;
							res.redirect('/account');
						} else {
							res.render('login.html', {passwordErrorMessage:"WRONG PASSWORD"});
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
					res.render("account.html", {username:username});
				}
			});
		});

		app.get('/addPlaylist', function(req, res) {
			req.session.playlist_id = null;
			res.render('create_playlist.html', {username:req.session.username, pagetitle: "New playlist", pageheader: "Create a new playlist", saveplaylist:"Save playlist"});
		});

		app.get('/modifyPlaylist', function(req, res) {
			let id = req.query.id;
			req.session.playlist_id = id;
			dbo.collection('playlists').findOne({"_id" : ObjectId(id)}, function(err, doc) {
				if (err) throw err;
				let playlist_info = {};
				//build a string with the urls
				let urls = [];
				for (let song of doc.songs) {
					urls.push(song.url);
				}
				playlist_info['songs'] = urls.join(', ');
				//browse through genres
				let standard_genres = ['alternative', 'country', 'folk', 'house',
																'latino', 'metal', 'pop', 'punk', 'rock',
																'techno', 'other'];
				let other_genres = [];
				for (let genre of doc.genres) {
					if (standard_genres.includes(genre)) {
							playlist_info[genre] = "checked";
					} else {
							other_genres.push(genre);
					}
				}
				playlist_info['additional_genres'] = other_genres.join(', ');
				//other info
				playlist_info['username'] = req.session.username;
				playlist_info['description'] = doc.description;
				playlist_info['title'] = doc.title;
				playlist_info['pagetitle'] = 'Modify playlist"'+doc.title+'"';
				playlist_info['pageheader'] = 'Modify your playlist';
				playlist_info['saveplaylist'] = "Save changes";
				playlist_info['deleteplaylist'] = "or delete this playlist";
				
				res.render('create_playlist.html', playlist_info);
			});
		});

		app.post('/createPlaylist', function(req, res) {
			if (req.session.username == null){
				return res.render('login.html', {disconnectedErrorMessage:"Please log in to create and modify playlists."});
			}
			let illustration = req.body.customFile;
			let title = req.body.playlist_name;
			let description = req.body.playlist_descr || "No description";
			let creator = req.session.username;
			let modification_date = new Date();
			let urls = (req.body.playlist_songs).replace(/ /g, "").replace("\n", "").replace("\r", "").split(",");
			let genres = [];
			if (Array.isArray(req.body.playlist_genres)) {
					genres = req.body.playlist_genres;
			} else {
					genres.push(req.body.playlist_genres);
			}
			let other_genres = (req.body.playlist_add_genre).replace(/\n/g, "").split(",");
			for (let genre of other_genres) {
					genres.push(genre.replace(/^ +/g, "").replace(/ +$/g, ""));
				}
			for (let genre of genres){
				if (genre == ""){
					genres = arrayRemove(genres, genre);
				}
			}
			if (req.session.playlist_id == null) {
				console.log("Creating new playlist");
				let songs = [];
				for (let url of urls){
					let vid_id = get_id(url);
					let vid_title = url;
					let vid_length = null;
					if (vid_id != null){
						let API_url = "https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=" + vid_id + "&key=AIzaSyDWSwITRSdspIeaC5upd9oZ6cE0z8b-bi4";
						let API_data;
						var request = new XMLHttpRequest();
						request.open('GET', API_url, false);
						request.send(null);
						if (request.status === 200) {
							API_data = request.responseText;
						}
						vid_title = API_data.replace(/"/g, "").replace("title: ", "").replace(/\n/g, "").replace(/  +/g, "").split(',');
						vid_title = vid_title[7];
						vid_length = API_data.replace(/"/g, "").replace("duration: ", "").replace(/\n/g, "").replace(/  +/g, "").replace(/,dimension:.*/, "").split('{');
						vid_length = vid_length[11];
					}
					songs.push({'url': url, 'date': new Date(), 'vid_id': vid_id, 'vid_title': vid_title, 'vid_length': vid_length});
				}
				let playlist_info = {
					picture: null,
					title: title,
					description: description,
					creator: creator,
					creation_date: new Date(),
					modification_date: modification_date,
					genres: genres,
					songs: songs
				};
				dbo.collection('playlists').insertOne(playlist_info, function(err,result) {
					if (err) throw err;
					console.log('Playlist added successfully');
				});
				req.session.accountMessage = 'Playlist "' + title + '" successfully added to your playlists.';
			} else {
				let id = req.session.playlist_id;
				dbo.collection('playlists').findOne({_id:ObjectId(id)}, function(err, doc) {
					let songs = doc.songs;
					let urls_already_in = [];
					for (let song of songs){
						if (urls.includes(song.url)){
							urls_already_in.push(song.url);
						} else {
							songs = arrayRemove(songs, song);
						}
					}
					for (let url of urls) {
						if (! urls_already_in.includes(url)) {
							let vid_id = get_id(url);
							let vid_title = url;
							let vid_length = null;
							if (vid_id != null){
								let API_url = "https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=" + vid_id + "&key=AIzaSyDWSwITRSdspIeaC5upd9oZ6cE0z8b-bi4";
								let API_data;
								var request = new XMLHttpRequest();
								request.open('GET', API_url, false);
								request.send(null);
								if (request.status === 200) {
									API_data = request.responseText;
								}
								vid_title = API_data.replace(/"/g, "").replace("title: ", "").replace(/\n/g, "").replace(/  +/g, "").split(',');
								vid_title = vid_title[7];
								vid_length = API_data.replace(/"/g, "").replace("duration: ", "").replace(/\n/g, "").replace(/  +/g, "").replace(/,dimension:.*/, "").split('{');
								vid_length = vid_length[11];
							}
							songs.push({'url': url, 'date': new Date(), 'vid_id': vid_id, 'vid_title': vid_title, 'vid_length': vid_length});
						}
					}
					var playlist_info = {
						picture: null,
						title: title,
						description: description || "No description",
						modification_date: new Date(),
						genres: genres,
						songs: songs
					};
					dbo.collection('playlists').updateOne({_id: ObjectId(id)}, {$set:playlist_info}, function(err, result) {
						if (err) throw err;
						console.log('Playlist modified successfully');
					});
				});
				req.session.accountMessage = 'Playlist "' + title + '" successfully modified.';
				req.session.playlist_id = null;
			}
			res.redirect('/account');
		});

		app.get('/playlist_content', function(req, res) {
			let id = req.query.id;
			dbo.collection('playlists').findOne({"_id": ObjectId(id)}, function(err, doc) {
				if (err) throw err;
				for (let song of doc.songs) {
					song.date = getFullDate(song.date);
				}
				if (doc.picture == null) {
					doc.picture = 'img/logo.png';
				}
				if (req.session.username != null) {
					res.render("playlist_content.html", {"song_list": doc.songs,
																							 username: req.session.username,
																							 title: doc.title,
																							 genres: doc.genres,
																							 description: doc.description,
																							 creator: doc.creator,
																							 playlist_picture: doc.picture
																							});
				} else {
					res.render('playlist_content.html', {"song_list": doc.songs,
																							 login:"Log in",
																							 title: doc.title,
																							 genres: doc.genres,
																							 description: doc.description,
																							 creator: doc.creator,
																							 playlist_picture: doc.picture
																							});
				}
			})
		});
			
		app.get('/deletePlaylist', function(req, res) {
			let id = req.session.playlist_id;
			req.session.playlist_id = null;
			dbo.collection('playlists').deleteOne({"_id": ObjectId(id)}, function(err, res) {
				if (err) throw err;
				console.log("Playlist successfully deleted");
			});
			req.session.accountMessage = 'Playlist deleted.';
			res.redirect('/account');
		});

		app.get('/searchplaylist', function(req, res) {
			dbo.collection('playlists').aggregate([{$search:
				{"text": 
					{"query": req.query.search_words,
					 "path": ["description", "creator", "title", "genres"],
					 "fuzzy": {}
					}
				}
			}]).toArray((err, doc) => {
				if (err) throw err;
				if (doc.length == 0) {
					if (req.session.username != null) {
							res.render('homepage.html', {username: req.session.username, nomatchErrorMessage: "No match found"});
					} else {
							res.render('homepage.html', {login: "Log in", nomatchErrorMessage: "No match found"});
					}
				} else if (req.session.username != null) {
					let newDoc = {"playlist_list": doc, username: req.session.username};
					res.render('homepage.html', newDoc);
				} else {
					let newDoc = {"playlist_list": doc, login: "Log in"};
					res.render('homepage.html', newDoc);
				}
			});
		});

		app.get('/showAll', function(req, res) {
			res.redirect('/homepage');
		});

		app.get('/logout', function(req, res) {
			req.session.username = null;
			res.redirect('/homepage');
		});

		https.createServer({
			key: fs.readFileSync('./key.pem'),
			cert: fs.readFileSync('./cert.pem'),
			passphrase: 'ingi'
		}, app).listen(port, function(){
			console.log('Server running on port 8080')
		});

	});

function getFullDate(d) {
    let date = new Date(d);
    let months = ["January", "February", "March", "April", "May", "June", "July", "Augustus", "September", "October", "November", "December"]
    let fullDate = months[date.getMonth()] + " " + date.getDate() + ", "+ date.getFullYear();
    return fullDate;
  }

function get_id(url){
		let id = null;
		if (url.includes("youtube") || url.includes("youtu.be")){
			id = (getVideoId(url)).id;
		}
		return id;
  }
	
	function arrayRemove(arr, value) { 
		return arr.filter(function(ele){ 
				return ele != value; 
		});
  }
		
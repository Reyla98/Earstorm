const express = require('express');
const consolidate = require('consolidate');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const https = require('https');
const http = require('http');
const fs = require('fs');
const port = 8080;
const session = require('express-session');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const getVideoId = require('get-video-id');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var secured = false;

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
				req.session.search = doc;
				req.session.origin = "homepage.html";
				doc = getAllDates(doc);
				if (req.session.username != null) {
					let newDoc = {"playlist_list": doc, username:req.session.username,
												 pl_title:"Title", pl_descr:"Description", pl_creator:"Creator", pl_created:"Created on", pl_modified:"Last modified on"}
					res.render("homepage.html", newDoc);
				} else {
					let newDoc = {"playlist_list": doc, login:"Log in",
												 pl_title:"Title", pl_descr:"Description", pl_creator:"Creator", pl_created:"Created on", pl_modified:"Last modified on"}
					res.render("homepage.html", newDoc);
				}
			});
		});

		app.get('/sort_titles', function(req, res) {
			if (req.session.sorting != "titles1"){
				req.session.sorting = "titles1";
				req.session.search = req.session.search.sort(function (a, b) {
					return a.title - b.title;
				});
				let doc = getAllDates(req.session.search);
				if (req.session.username != null) {
					let newDoc = {"playlist_list": doc, username:req.session.username, user_creator: req.session.creator,
												 pl_title:"Title ˄", pl_descr:"Description", pl_creator:"Creator", pl_created:"Created on", pl_modified:"Last modified on"}
					res.render(req.session.origin, newDoc);
				} else {
						let newDoc = {"playlist_list": doc, login:"Log in", user_creator: req.session.creator,
													 pl_title:"Title ˄", pl_descr:"Description", pl_creator:"Creator", pl_created:"Created on", pl_modified:"Last modified on"}
						res.render(req.session.origin, newDoc);
				}
			} else {
				req.session.sorting = "titles-1";
				req.session.search = req.session.search.reverse();
				let doc = getAllDates(req.session.search);
				if (req.session.username != null) {
					let newDoc = {"playlist_list": doc, username:req.session.username, user_creator: req.session.creator,
												 pl_title:"Title ˅", pl_descr:"Description", pl_creator:"Creator", pl_created:"Created on", pl_modified:"Last modified on"}
					res.render(req.session.origin, newDoc);
				} else {
						let newDoc = {"playlist_list": doc, login:"Log in", user_creator: req.session.creator,
													 pl_title:"Title ˅", pl_descr:"Description", pl_creator:"Creator", pl_created:"Created on", pl_modified:"Last modified on"}
						res.render(req.session.origin, newDoc);
				}
			}
		});

		app.get('/sort_description', function(req, res) {
			if (req.session.sorting != "description1"){
				req.session.sorting = "description1";
				req.session.search = req.session.search.sort(function (a, b) {
					return a.description - b.description;
				});
				let doc = getAllDates(req.session.search);
				if (req.session.username != null) {
					let newDoc = {"playlist_list": doc, username:req.session.username, user_creator: req.session.creator,
												 pl_title:"Title", pl_descr:"Description ˄", pl_creator:"Creator", pl_created:"Created on", pl_modified:"Last modified on"}
					res.render(req.session.origin, newDoc);
				} else {
					let newDoc = {"playlist_list": doc, login:"Log in", user_creator: req.session.creator,
												 pl_title:"Title", pl_descr:"Description ˄", pl_creator:"Creator", pl_created:"Created on", pl_modified:"Last modified on"}
					res.render(req.session.origin, newDoc);
				}
			} else {
				req.session.sorting = "description-1";
				req.session.search = req.session.search.reverse();
				let doc = getAllDates(req.session.search);
				if (req.session.username != null) {
					let newDoc = {"playlist_list": doc, username:req.session.username, user_creator: req.session.creator,
												 pl_title:"Title", pl_descr:"Description ˅", pl_creator:"Creator", pl_created:"Created on", pl_modified:"Last modified on"}
					res.render(req.session.origin, newDoc);
				} else {
					let newDoc = {"playlist_list": doc, login:"Log in", user_creator: req.session.creator,
												 pl_title:"Title", pl_descr:"Description ˅", pl_creator:"Creator", pl_created:"Created on", pl_modified:"Last modified on"}
					res.render(req.session.origin, newDoc);
				}
			}
		});

		app.get('/sort_creator', function(req, res) {
			if (req.session.sorting != "creator1"){
				req.session.sorting = "creator1";
				req.session.search = req.session.search.sort(function (a, b) {
					return a.creator - b.creator;
				});
				let doc = getAllDates(req.session.search);
				if (req.session.username != null) {
					let newDoc = {"playlist_list": doc, username:req.session.username, user_creator: req.session.creator,
												 pl_title:"Title", pl_descr:"Description", pl_creator:"Creator ˄", pl_created:"Created on", pl_modified:"Last modified on"}
					res.render("homepage.html", newDoc);
				} else {
					let newDoc = {"playlist_list": doc, login:"Log in", user_creator: req.session.creator,
												 pl_title:"Title", pl_descr:"Description", pl_creator:"Creator ˄", pl_created:"Created on", pl_modified:"Last modified on"}
					res.render("homepage.html", newDoc);
				}
			} else {
				req.session.sorting = "creator-1";
				req.session.search = req.session.search.reverse();
				let doc = getAllDates(req.session.search);
				if (req.session.username != null) {
					let newDoc = {"playlist_list": doc, username:req.session.username,
												 pl_title:"Title", pl_descr:"Description", pl_creator:"Creator ˅", pl_created:"Created on", pl_modified:"Last modified on"}
					res.render("homepage.html", newDoc);
				} else {
					let newDoc = {"playlist_list": doc, login:"Log in",
												 pl_title:"Title", pl_descr:"Description", pl_creator:"Creator ˅", pl_created:"Created on", pl_modified:"Last modified on"}
					res.render("homepage.html", newDoc);
				}
			}
		});

		app.get('/sort_created', function(req, res) {
			if (req.session.sorting != "created1"){
				req.session.sorting = "created1"
				req.session.search = req.session.search.sort(function (a, b) {
					return a.creation_date - b.creation_date;
				});
				let doc = getAllDates(req.session.search);
				if (req.session.username != null) {
					let newDoc = {"playlist_list": doc, username:req.session.username, user_creator: req.session.creator,
												 pl_title:"Title", pl_descr:"Description", pl_creator:"Creator", pl_created:"Created on ˄", pl_modified:"Last modified on"}
					res.render(req.session.origin, newDoc);
				} else {
					let newDoc = {"playlist_list": doc, login:"Log in", user_creator: req.session.creator,
												 pl_title:"Title", pl_descr:"Description", pl_creator:"Creator", pl_created:"Created on ˄", pl_modified:"Last modified on"}
					res.render(req.session.origin, newDoc);
				}
			} else {
				req.session.sorting = "created-1"
				req.session.search = req.session.search.reverse();
				let doc = getAllDates(req.session.search);
				if (req.session.username != null) {
					let newDoc = {"playlist_list": doc, username:req.session.username, user_creator: req.session.creator,
												 pl_title:"Title", pl_descr:"Description", pl_creator:"Creator", pl_created:"Created on ˅", pl_modified:"Last modified on"}
					res.render(req.session.origin, newDoc);
				} else {
					let newDoc = {"playlist_list": doc, login:"Log in", user_creator: req.session.creator,
												 pl_title:"Title", pl_descr:"Description", pl_creator:"Creator", pl_created:"Created on ˅", pl_modified:"Last modified on"}
					res.render(req.session.origin, newDoc);
				}
			}
		});

		app.get('/sort_modified', function(req, res) {
			if (req.session.sorting != "modified1"){
				req.session.sorting = "modified1"
				req.session.search = req.session.search.sort(function (a, b) {
					return a.modification_date - b.modification_date;
				});
				let doc = getAllDates(req.session.search);
				if (req.session.username != null) {
					let newDoc = {"playlist_list": doc, username:req.session.username, user_creator: req.session.creator,
												 pl_title:"Title", pl_descr:"Description", pl_creator:"Creator", pl_created:"Created on", pl_modified:"Last modified on ˄"}
					res.render(req.session.origin, newDoc);
				} else {
					let newDoc = {"playlist_list": doc, login:"Log in", user_creator: req.session.creator,
												 pl_title:"Title", pl_descr:"Description", pl_creator:"Creator", pl_created:"Created on", pl_modified:"Last modified on ˄"}
					res.render(req.session.origin, newDoc);
				}
			} else {
				req.session.sorting = "modified-1"
				req.session.search = req.session.search.reverse();
				let doc = getAllDates(req.session.search);
				if (req.session.username != null) {
					let newDoc = {"playlist_list": doc, username:req.session.username, user_creator: req.session.creator,
												 pl_title:"Title", pl_descr:"Description", pl_creator:"Creator", pl_created:"Created on", pl_modified:"Last modified on ˅"}
					res.render(req.session.origin, newDoc);
				} else {
					let newDoc = {"playlist_list": doc, login:"Log in", user_creator: req.session.creator,
												 pl_title:"Title", pl_descr:"Description", pl_creator:"Creator", pl_created:"Created on", pl_modified:"Last modified on ˅"}
					res.render(req.session.origin, newDoc);
				}
			}
		});

		app.get('/account', function(req, res) {
			if (req.session.username == null){
				return res.render('login.html', {disconnectedErrorMessage:"Please log in to access your account."});
			}
			dbo.collection('playlists').find({creator:req.session.username}).toArray(function(err, doc) {
				if (err) throw err;
				req.session.search = doc;
				req.session.origin = "account.html";
				doc = getAllDates(doc);
				if (req.session.accountMessage != null){
					let message = req.session.accountMessage;
					req.session.accountMessage = null;
					res.render("account.html", {"playlist_list": doc, username: req.session.username, "accountMessage":message,
					                            pl_title:"Title", pl_descr:"Description", pl_created:"Created on", pl_modified:"Last modified on"});
				} else {
					res.render("account.html", {"playlist_list": doc, username: req.session.username,
					                            pl_title:"Title", pl_descr:"Description", pl_created:"Created on", pl_modified:"Last modified on"});
				}
			});
		});

		app.get('/login', function(req, res) {
			res.render("login.html");
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
				playlist_info['color'] = doc.color;
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
			let title = req.body.playlist_name;
			let description = req.body.playlist_descr || "No description";
			let creator = req.session.username;
			let modification_date = new Date();
			let color = req.body.playlist_color;
			if (getBrightness(color) < 130) {var theme = "light"} else {var theme = "dark"}
			let urls = (req.body.playlist_songs).replace(/ /g, "").replace("\n", "").replace("\r", "").split(",");
			let genres = [];
			if (Array.isArray(req.body.playlist_genres)) {
					genres = req.body.playlist_genres;
			} else {
					genres.push(req.body.playlist_genres);
			}
			let other_genres = (req.body.playlist_add_genre).replace(/\n/g, "").split(",");
			for (let genre of other_genres) {
					genre = genre.replace(/^ +/g, "").replace(/ +$/g, "");
					if (genre != ""){
						genres.push(genre);
					}
				}
			if (req.session.playlist_id == null) {
				console.log("Creating new playlist");
				let songs = [];
				for (let url of urls){
					if (url != ""){
						let vid_info = get_info(url);
						songs.push(vid_info);
					}
				}
				let playlist_info = {
					title: title,
					description: description,
					creator: creator,
					creation_date: new Date(),
					modification_date: modification_date,
					genres: genres,
					songs: songs,
					color: color,
					theme: theme
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
						if (! urls_already_in.includes(url) && url != "") {
							let vid_info = get_info(url);
							songs.push(vid_info);
						}
					}
					var playlist_info = {
						title: title,
						description: description || "No description",
						modification_date: new Date(),
						genres: genres,
						songs: songs,
						color: color,
						theme: theme
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
					res.render("playlist_content.html", {
						"song_list": doc.songs,
						 username: req.session.username,
						 title: doc.title,
						 genres: doc.genres,
						 description: doc.description,
						 creator: doc.creator,
						 playlist_color: doc.color,
						 theme: doc.theme

					});
				} else {
					res.render('playlist_content.html', {
						"song_list": doc.songs,
						 login:"Log in",
						 title: doc.title,
						 genres: doc.genres,
						 description: doc.description,
						 creator: doc.creator,
						 playlist_color: doc.color,
						 theme: doc.theme
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
			if (req.query.search_words == ""){
				if (req.session.username != null) {
						res.render('homepage.html', {username: req.session.username, noMatchErrorMessage: "No match found"});
				} else {
						res.render('homepage.html', {login: "Log in", noMatchErrorMessage: "No match found"});
				}
			} else {
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
								res.render('homepage.html', {username: req.session.username, noMatchErrorMessage: "No match found"});
						} else {
								res.render('homepage.html', {login: "Log in", noMatchErrorMessage: "No match found"});
						}
					} else {
						req.session.search = doc;
						doc = getAllDates(doc);
						if (req.session.username != null) {
							let newDoc = {"playlist_list": doc, username: req.session.username,
														pl_title:"Title", pl_descr:"Description", pl_creator:"Creator", pl_created:"Created on", pl_modified:"Last modified on"};
							res.render('homepage.html', newDoc);
						} else {
							let newDoc = {"playlist_list": doc, login: "Log in",
														pl_title:"Title", pl_descr:"Description", pl_creator:"Creator", pl_created:"Created on", pl_modified:"Last modified on"};
							res.render('homepage.html', newDoc);
						}
					}
				});
			}
		});

		app.get('/advancedSearch', function(req, res) {
			res.render('advanced_search.html');
		})

		app.post('/advancedSearch', function(req, res) {
			console.log(req.body.description);
			if (req.body.description == "") { req.body.description = " "; }
			if (req.body.title == "") { req.body.title = " "; }
			if (req.body.genre == "") { req.body.genre = " "; }
			if (req.body.creator == "") { req.body.creator = " "; }
			dbo.collection('playlists').aggregate([{$search:
				{
					"compound": {
						"should": [{
							"text": {
								"query": req.body.description,
								"path": ["description"],
								"fuzzy": {}
							}
						}, {
							"text": {
								"query": req.body.title,
								"path": ["title"],
								"fuzzy": {}
							}
						}, {
							"text": {
								"query": req.body.creator,
								"path": ["creator"],
								"fuzzy": {}
							}
						}]
					}
				}
			}]).toArray((err, doc) => {
				if (err) throw err;
				if (doc.length == 0) {
					if (req.session.username != null) {
						res.render('homepage.html', {username: req.session.username, noMatchErrorMessage: "No match found"});
					} else {
						res.render('homepage.html', {login: "Log in", noMatchErrorMessage: "No match found"});
					}
				} else {
					doc.forEach(function(item, index, array) {
						if (req.body.created_from != "" | req.body.created_until != "" | req.body.modified_from != "" | req.body.modified_until != ""){
							if (item.creation_date < new Date(req.body.created_from)){
								doc.splice(index,1);
							} else if (item.creation_date > new Date(req.body.created_until)){
								doc.splice(index,1);
							} else if (item.modification_date < new Date(req.body.modified_from)){
								doc.splice(index,1);
							} else if (item.modification_date > new Date(req.body.modified_until)){
								doc.splice(index,1);
							}
						}
					});
					req.session.search = doc;
					doc = getAllDates(doc);
					if (req.session.username != null) {
						let newDoc = {"playlist_list": doc, username: req.session.username,
													pl_title:"Title", pl_descr:"Description", pl_creator:"Creator", pl_created:"Created on", pl_modified:"Last modified on"};
						res.render('homepage.html', newDoc);
					} else {
						let newDoc = {"playlist_list": doc, login: "Log in",
						              pl_title:"Title", pl_descr:"Description", pl_creator:"Creator", pl_created:"Created on", pl_modified:"Last modified on"};
						res.render('homepage.html', newDoc);
					}
				}
			});
		});

		app.get('/user_playlists', function(req, res) {
			req.session.creator = req.query.creator;
			dbo.collection('playlists').find({creator:req.session.creator}).toArray(function(err, doc) {
				if (err) throw err;
				req.session.search = doc;
				req.session.origin = "user_playlists.html";
				doc = getAllDates(doc);
				if (req.session.username != null){
					res.render("user_playlists.html", {"playlist_list": doc, username: req.session.username,
					                                   pl_title:"Title", pl_descr:"Description", user_creator: req.session.creator, pl_created:"Created on", pl_modified:"Last modified on"});
				} else {
					res.render("user_playlists.html", {"playlist_list": doc, login: "Log in",
					                                   pl_title:"Title", pl_descr:"Description", user_creator: req.session.creator, pl_created:"Created on", pl_modified:"Last modified on"});
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
		if(secured){
		https.createServer({
			key: fs.readFileSync('./key.pem'),
			cert: fs.readFileSync('./cert.pem'),
			passphrase: 'ingi'
		}, app).listen(port, function(){
			console.log('Server running on port 8080')
		});
		}
		else{
			http.createServer({
			}, app).listen(port, function(){
				console.log('Server running on port 8080')
			});
		}

	});

function getFullDate(d) {
    let date = new Date(d);
    let months = ["January", "February", "March", "April", "May", "June", "July", "Augustus", "September", "October", "November", "December"]
    let fullDate = months[date.getMonth()] + " " + date.getDate() + ", "+ date.getFullYear();
    return fullDate;
}

function getAllDates(doc){
	for (let playlist of doc) {
		playlist.modification_date = getFullDate(playlist.modification_date);
		playlist.creation_date = getFullDate(playlist.creation_date);
	}
	return doc;
}

function get_info(url){
	let vid_id;
	let source;
	let embedded_video;
	let vid_title = url;
	let vid_length;
	let play_title = "Play";
	if (url.includes("youtube") | url.includes("youtu.be") | url.includes("vimeo")){
		const info = getVideoId(url);
		vid_id = info.id;
		source = info.service;
		if (source == "youtube"){
			embedded_video = "https://www.youtube.com/embed/"+vid_id+"?autoplay=1";
			let API_url = "https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=" + vid_id + "&key=AIzaSyDWSwITRSdspIeaC5upd9oZ6cE0z8b-bi4";
			var request = new XMLHttpRequest();
			request.open('GET', API_url, false);
			request.send(null);
			if (request.status === 200) {
				let data = JSON.parse(request.responseText);
				vid_title = data.items[0].snippet.title;
				vid_length = data.items[0].contentDetails.duration;
			} else {console.log('Error: could not complete http request. ERROR CODE: ',request.status);}
		}
		else if (source == "vimeo"){
			embedded_video = "https://player.vimeo.com/video/"+vid_id+"?autoplay=1";
			let API_url = "https://vimeo.com/api/oembed.json?url=https%3A//vimeo.com/"+vid_id;
			var request = new XMLHttpRequest();
			request.open('GET', API_url, false);
			request.send(null);
			if (request.status === 200) {
				let data = JSON.parse(request.responseText);
				vid_title = data.title;
				vid_length = data.duration;
			} else {console.log('Error: could not complete http request. ERROR CODE: ',request.status);}
		}
	}
	else if (url.includes("dailymotion") | url.includes("dai.ly")){
		source = "dailymotion";
		if (url.includes("dailymotion")){
			vid_id = url.replace(/.*video[/]/, "").replace(/[_?$#/].*/, "");
		} else {
			vid_id = url.replace(/.*dai.ly[/]/, "");
		}
		embedded_video = "https://www.dailymotion.com/embed/video/"+vid_id+"?autoplay=1";
		let API_url = "https://api.dailymotion.com/video/"+vid_id+"?fields=title,duration";
		var request = new XMLHttpRequest();
		request.open('GET', API_url, false);
		request.send(null);
		if (request.status === 200) {
			let data = JSON.parse(request.responseText);
			console.log(data);
			vid_title = data.title;
			vid_length = data.duration;
		} else {console.log('Error: could not complete http request. ERROR CODE: ',request.status);}
	}
	else if (url.includes("soundcloud")){
		source = "soundcloud";
		embedded_video = "https://w.soundcloud.com/player/?url="+url+"&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true";
	}
	if (embedded_video == null){play_title = "Listen to this song by clicking on the link provided in the title section";}
	let vid_info = {"url":url, "date":new Date(), "vid_id":vid_id, "vid_title":vid_title, "vid_length":vid_length, "source":source, "embedded_video":embedded_video, "play_title":play_title};
	return vid_info;
}

function arrayRemove(arr, value) {
	return arr.filter(function(ele){
			return ele != value;
	});
}

function hexToDec(hex) {
	// source: https://www.expertsphp.com/how-to-convert-hexadecimal-to-decimal-using-javascript/
	var result = 0, digitValue;
	for (var i = 0; i < hex.length; i++) {
		digitValue = '0123456789abcdefgh'.indexOf(hex[i]);
		result = result * 16 + digitValue;
	}
	return result;
}

function getBrightness(hex_color) {
	let red = hexToDec(hex_color.slice(1,3));
	let green = hexToDec(hex_color.slice(3, 5));
	let blue = hexToDec(hex_color.slice(5, 7));
	//brightness formula found here: https://www.nbdtech.com/Blog/archive/2008/04/27/Calculating-the-Perceived-Brightness-of-a-Color.aspx
	let brightness = Math.sqrt(0.241 * red**2 + 0.691 * green**2 + 0.068 * blue**2)
	return brightness
}

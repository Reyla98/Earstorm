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

//Set up server
const app = express();
app.use(session({secret:'earstorm123'}));
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
        dbo.collection('playlists').find({}).toArray(function(err, doc) {
            if (err) throw err;
            for (let playlist of doc) {
                playlist.modification_date = getFullDate(playlist.modification_date);
                playlist.creation_date = getFullDate(playlist.creation_date);
            }
            if (req.session.username != null) {
                console.log()
                let newDoc = {"playlist_list": doc, username:req.session.username, title:doc.title}
                res.render("homepage.html", newDoc);
            } else {
                console.log(doc);
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
            for (let playlist of doc) {
                playlist.modification_date = getFullDate(playlist.modification_date);
                playlist.creation_date = getFullDate(playlist.creation_date);
            }
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

            res.render('create_playlist.html', playlist_info);
        })
    });

    app.post('/createPlaylist', function(req, res) {
        let illustration = req.body.customFile;
        let title = req.body.playlist_name;
        let description = req.body.playlist_descr || "No description";
        let creator = req.session.username;
        let modification_date = new Date();

        if (Array.isArray(req.body.playlist_genres)) {
            var genres = req.body.playlist_genres;
        } else {
            var genres = [];
            genres.push(req.body.playlist_genres);
        }
        let other_genres = (req.body.playlist_add_genre).replace(/ /g, "").split(",");
        for (i in other_genres) {
            genres.push(other_genres[i]);
        }

        let urls = (req.body.playlist_songs).replace(/ /g, "").split(",");

        if (req.session.playlist_id == null) {
            console.log("Creating new playlist");
            let songs = [];
            for (let url of urls) {
                songs.push({'url': url, 'date': new Date(), 'vid_id': get_id(url)});
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
                }
            );
        } else {
            let id = req.session.playlist_id;
            dbo.collection('playlists').findOne({_id:ObjectId(id)}, function(err, doc) {
                var songs = doc.songs;
                let urls_already_in = [];
                for (let song of songs) {
                    urls_already_in.push(song.url);
                }
                for (let url of urls) {
                    if (! urls_already_in.includes(url)) {
                        let vid_id = get_id(url);
                        songs.push({'url': url, 'date': new Date(), 'vid_id': vid_id});
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
            })
            req.session.playlist_id = null;
        }
        res.redirect("/account");
    });

    app.get('/playlist_content', function(req, res) {
        let id = req.query.id;
        dbo.collection('playlists').findOne({"_id": ObjectId(id)}, function(err, doc) {
            if (err) throw err;
            for (let song of doc.songs) {
                song.date = getFullDate(song.date);
            }
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
        if (url.includes("youtube")){
            id = url.split("=");
            id = id[1];
            if (id.includes("&")){
                id = id.split("&");
                id = id[0];
            }
        } else if (url.includes("youtu.be")){
            id = url.split("/");
            id = id[(id.length)-1];
        }
        return id;
    }

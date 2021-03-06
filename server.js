//Modules
const express = require('express');
const consolidate = require('consolidate');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const https = require('https');
const http = require('http');
const fs = require('fs');
const session = require('express-session');
const bcrypt = require('bcrypt');
const getVideoId = require('get-video-id');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

//Variables
const port = 8080;
const saltRounds = 10; //variable pour bcrypt

//Set up server
const app = express();
app.use(session({secret: 'earstorm123', resave: true, saveUninitialized: false}));
app.engine('html', consolidate.hogan);
app.set('views', 'static');
app.use(express.static('static'));
app.use(express.static('modules'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(bodyParser.text());


MongoClient.connect('mongodb+srv://groupD:group-5678D@earstorm.twelv.mongodb.net/Earstorm?retryWrites=true&w=majority', { useUnifiedTopology: true }, (err, db) => {
    if (err) throw err;
    if (process.argv.includes('empty')) {
        var dbo = db.db('earstorm-empty');
    } else {
        var dbo = db.db('earstorm');
    }
    /* CLEAN DB > un-comment these lines and connect to server to remove users and playlists created in test.
    dbo.collection('users').removeMany({email:'testEmail@test.com'});
    dbo.collection('playlists').removeMany({title:'Playlist for JTest'});
    */

		var table_headers = {header_title:'Title',
                        header_description:'Description',
                        header_creator:'Creator',
                        header_created:'Created on',
                        header_modified:'Last modified on'};

    app.get('/', function(req, res) {
        res.render('welcome_page.html');
    });

    app.get('/homepage', function(req, res) {
        req.session.sorting = null;
        dbo.collection('playlists').find({}).toArray(function(err, doc) {
            if (err) throw err;
            req.session.search = doc;
            req.session.show_all = doc;
            req.session.origin = 'homepage.html';
            let new_doc = JSON.parse(JSON.stringify(table_headers));
            new_doc['playlist_list'] = getAllDates(doc);
            if (req.session.username != null) {
                new_doc['username'] = req.session.username;
            } else {
                new_doc['login'] = 'Log in';
            }
            res.render('homepage.html', new_doc);
        });
    });

    app.get('/sort_titles', function(req, res) {
        let new_doc = JSON.parse(JSON.stringify(table_headers));
        new_doc['user_creator'] = req.session.creator;
        if (req.session.sorting != 'titles1') {
            if (req.session.sorting == 'titles-1') {
                req.session.search = req.session.search.reverse();
            } else {
                req.session.search = req.session.search.sort(function (a, b) {return a.title.localeCompare(b.title);});
            }
            new_doc['playlist_list'] = getAllDates(req.session.search);
            new_doc['header_title'] = 'Title ˄';
            req.session.sorting = 'titles1';
        } else {
            new_doc['playlist_list'] = getAllDates(req.session.search.reverse());
            new_doc['header_title'] = 'Title ˅';
            req.session.sorting = 'titles-1';
        }
        if (req.session.username != null) {
            new_doc['username'] = req.session.username;
        } else {
            new_doc['login'] = 'Log in';
        }
        res.render(req.session.origin, new_doc);
    });

    app.get('/sort_description', function(req, res) {
        let new_doc = JSON.parse(JSON.stringify(table_headers));
        new_doc['user_creator'] = req.session.creator;
        if (req.session.sorting != 'description1') {
            if (req.session.sorting == 'description-1') {
                req.session.search = req.session.search.reverse();
            } else {
                req.session.search = req.session.search.sort(function (a, b) {return a.description.localeCompare(b.description);});
            }
            new_doc['playlist_list'] = getAllDates(req.session.search);
            new_doc['header_description'] = 'Description ˄';
            req.session.sorting = 'description1';
        } else {
            new_doc['playlist_list'] = getAllDates(req.session.search.reverse());
            new_doc['header_description'] = 'Description ˅';
            req.session.sorting = 'description-1';
        }
        if (req.session.username != null) {
            new_doc['username'] = req.session.username;
        } else {
            new_doc['login'] = 'Log in';
        }
        res.render(req.session.origin, new_doc);
    });

    app.get('/sort_creator', function(req, res) {
        let new_doc = JSON.parse(JSON.stringify(table_headers));
        if (req.session.sorting != 'creator1') {
            if (req.session.sorting == 'creator-1') {
                req.session.search = req.session.search.reverse();
            } else {
                req.session.search = req.session.search.sort(function (a, b) {return a.creator.localeCompare(b.creator);});
            }
            new_doc['playlist_list'] = getAllDates(req.session.search);
            new_doc['header_creator'] = 'Creator ˄';
            req.session.sorting = 'creator1';
        } else {
            new_doc['playlist_list'] = getAllDates(req.session.search.reverse());
            new_doc['header_creator'] = 'Creator ˅';
            req.session.sorting = 'creator-1';
        }
        if (req.session.username != null) {
            new_doc['username'] = req.session.username;
        } else {
            new_doc['login'] = 'Log in';
        }
        res.render('homepage.html', new_doc);
    });

    app.get('/sort_created', function(req, res) {
        let new_doc = JSON.parse(JSON.stringify(table_headers));
        new_doc['user_creator'] = req.session.creator;
        if (req.session.sorting != 'created1') {
            if (req.session.sorting == 'created-1') {
                req.session.search = req.session.search.reverse();
            } else {
                req.session.search = req.session.search.sort(function (a, b) {return new Date(a.creation_date) - new Date(b.creation_date);});
            }
            new_doc['playlist_list'] = getAllDates(req.session.search);
            new_doc['header_created'] = 'Created on ˄';
            req.session.sorting = 'created1';
        } else {
            new_doc['playlist_list'] = getAllDates(req.session.search.reverse());
            new_doc['header_created'] = 'Created on ˅';
            req.session.sorting = 'created-1';
        }
        if (req.session.username != null) {
            new_doc['username'] = req.session.username;
        } else {
            new_doc['login'] = 'Log in';
        }
        res.render(req.session.origin, new_doc);
    });

    app.get('/sort_modified', function(req, res) {
        let new_doc = JSON.parse(JSON.stringify(table_headers));
        new_doc['user_creator'] = req.session.creator;
        if (req.session.sorting != 'modified1') {
            if (req.session.sorting == 'modified-1') {
                req.session.search = req.session.search.reverse();
            } else {
                req.session.search = req.session.search.sort(function (a, b) {return new Date(a.modification_date) - new Date(b.modification_date);});
            }
            new_doc['playlist_list'] = getAllDates(req.session.search);
            new_doc['header_modified'] = 'Last modified on ˄';
            req.session.sorting = 'modified1';
        } else {
            new_doc['playlist_list'] = getAllDates(req.session.search.reverse());
            new_doc['header_modified'] = 'Last modified on ˅';
            req.session.sorting = 'modified-1';
        }
        if (req.session.username != null) {
            new_doc['username'] = req.session.username;
        } else {
            new_doc['login'] = 'Log in';
        }
        res.render(req.session.origin, new_doc);
    });

    app.get('/sort_song_titles', function(req, res) {
        let playlist = req.session.playlist;
        let songs = playlist.songs;
        let new_doc = {header_added: 'Added on',
                      title: playlist.title,
                      genres: playlist.genres.join(' / '),
                      description: playlist.description,
                      creator: playlist.creator,
                      playlist_color: playlist.color,
                      theme: playlist.theme};
        if (req.session.sorting != 'songtitles1') {
            new_doc['header_songtitle'] = 'Title ˄';
            req.session.sorting = 'songtitles1';
            songs = songs.sort((a, b)=>{return a.vid_title.localeCompare(b.vid_title);});
        } else {
            new_doc['header_songtitle'] = 'Title ˅';
            req.session.sorting = 'songtitles-1';
            songs = songs.sort((a, b)=>{return b.vid_title.localeCompare(a.vid_title);});
        }
        for (let song of songs) {
            song.date = getFullDate(song.date);
        }
        new_doc['song_list'] = songs;
        if (req.session.username != null) {
            new_doc['username'] = req.session.username;
        } else {
            new_doc['login'] = 'Log in';
        }
        res.render('playlist_content.html', new_doc);
    });

    app.get('/sort_added', function(req, res) {
        let playlist = req.session.playlist;
        let songs = playlist.songs;
        let new_doc = {header_song_title: 'Title',
                      title: playlist.title,
                      genres: playlist.genres.join(' / '),
                      description: playlist.description,
                      creator: playlist.creator,
                      playlist_color: playlist.color,
                      theme: playlist.theme};
        if (req.session.sorting == 'song_added-1') {
            new_doc['header_added'] = 'Added on ˄';
            req.session.sorting = 'song_added1';
            songs = songs.sort(function (a, b) {return new Date(a.date) - new Date(b.date);});
        } else {
            new_doc['header_added'] = 'Added on ˅';
            req.session.sorting = 'song_added-1';
            songs = songs.sort(function (a, b) {return new Date(b.date) - new Date(a.date);});
        }
        for (let song of songs) {
            song.date = getFullDate(song.date);
        }
        new_doc['song_list'] = songs;
        if (req.session.username != null) {
            new_doc['username'] = req.session.username;
        } else {
            new_doc['login'] = 'Log in';
        }
        res.render('playlist_content.html', new_doc);
    });

    app.get('/account', function(req, res) {
        if (req.session.username == null) {
            return res.render('login.html', {disconnectedErrorMessage: 'Please log in to access your account.'});
        }
        dbo.collection('playlists').find({creator: req.session.username}).toArray(function(err, doc) {
            if (err) throw err;
            req.session.search = doc;
            req.session.origin = 'account.html';
            doc = getAllDates(doc);
						let new_doc = JSON.parse(JSON.stringify(table_headers));
            new_doc['playlist_list'] = getAllDates(doc);
            new_doc['username'] = req.session.username;
            if (req.session.accountMessage != null) {
                new_doc['accountMessage'] = req.session.accountMessage;
                req.session.accountMessage = null;
            }
            res.render('account.html', new_doc);
        });
    });

    app.get('/login', function(req, res) {
        res.render('login.html');
    });

    app.post('/login', function(req, res) {
        var username = req.body.loginUsername;
        dbo.collection('users').findOne({username: username}, function(err, result) {
            if (err) throw err;
            if (result == null) {
                res.render('login.html', {usernameErrorMessage: 'UNKNOWN USERNAME'});
            } else {
                bcrypt.compare(req.body.loginPassword, result.password, function(err, result) {
                    if (err) throw err;
                    if (result) {
                        req.session.username = username;
                        res.redirect('/account');
                    } else {
                        res.render('login.html', {passwordErrorMessage: 'WRONG PASSWORD'});
                    }
                });
            }
        });
    });

    app.post('/signup', function(req, res) {
        dbo.collection('users').findOne({username: req.body.signUpUsername}, function(err, result) {
            if (err) throw err;
            if (result!=null) {
                res.render('login.html', {signupErrorMessage: 'Username already taken'});
            } else {
                let username = req.body.signUpUsername;
                let password = req.body.signUpPassword;
                let email = req.body.emailAddress;
                bcrypt.hash(password, saltRounds, function(err, hash) {
                    if (err) throw err;
                    var newUser = {username: username, password: hash, email: email};
                    dbo.collection('users').insertOne(newUser, function(err, result) {
                        if (err) throw err;
                        console.log('User added successfully');
                    });
                });
                req.session.username = username;
                res.render('account.html', {username: username});
            }
        });
    });

    app.get('/add_playlist', function(req, res) {
        if (req.session.username == null) {
            return res.render('login.html', {disconnectedErrorMessage: 'Please log in to create a playlist.'});
        }
        req.session.playlist_id = null;
        res.render('create_playlist.html', {username: req.session.username,
                                            pagetitle: 'New playlist',
                                            pageheader: 'Create a new playlist',
                                            saveplaylist: 'Save playlist'});
    });

    app.get('/modify_playlist', function(req, res) {
        if (req.session.username == null) {
            return res.render('login.html', {disconnectedErrorMessage: 'Please log in to modify your playlists.'});
        }
        let id = req.query.id;
        req.session.playlist_id = id;
        dbo.collection('playlists').findOne({_id: ObjectId(id)}, function(err, doc) {
            if (err) throw err;
            let pagetitle = 'Modify playlist "' + doc.title + '"'
            let playlist_info = {username: req.session.username,
								 title: doc.title,
								 description: doc.description,
								 color: doc.color,
								 pagetitle: pagetitle,
								 pageheader: 'Modify your playlist',
								 saveplaylist: 'Save changes',
								 deleteplaylist: 'or delete this playlist'};
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
                        playlist_info[genre] = 'checked';
                } else {
                        other_genres.push(genre);
                }
            }
            playlist_info['additional_genres'] = other_genres.join(', ');
            res.render('create_playlist.html', playlist_info);
        });
    });

    app.post('/create_playlist', function(req, res) {
        if (req.session.username == null) {
            return res.render('login.html', {disconnectedErrorMessage: 'Please log in to create and modify playlists.'});
        }
        let title = req.body.playlist_name;
        let description = req.body.playlist_descr || 'No description';
        let creator = req.session.username;
        let modification_date = new Date();
        let color = req.body.playlist_color;
        if (getBrightness(color) < 130) {var theme = 'light'} else {var theme = 'dark'}
        let urls = (req.body.playlist_songs).replace(/ /g, '').replace('\n', '').replace('\r', '').split(',');
        let genres = [];
        if (Array.isArray(req.body.playlist_genres)) {
                genres = req.body.playlist_genres;
        } else {
                genres.push(req.body.playlist_genres);
        }
        let other_genres = (req.body.playlist_add_genre).replace(/\n/g, '').split(',');
        for (let genre of other_genres) {
            genre = genre.replace(/^ +/g, '').replace(/ +$/g, '');
            if (genre != '') {
                genres.push(genre);
            }
        }
        if (req.session.playlist_id == null) {
            console.log('Creating new playlist');
            let songs = [];
            let song_titles = [];
            for (let url of urls) {
                if (url != '') {
                    let vid_info = getVideoInfo(url);
                    songs.push(vid_info);
                    song_titles.push(vid_info.vid_title);
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
                song_titles: song_titles,
                color: color,
                theme: theme
            };
            dbo.collection('playlists').insertOne(playlist_info, function(err,result) {
                if (err) throw err;
                console.log('Playlist added successfully');
            });
            req.session.accountMessage = 'Playlist "' + title + '" successfully added to your playlists.';
        } else {
            console.log('Modifying playlist');
            let id = req.session.playlist_id;
            dbo.collection('playlists').findOne({_id: ObjectId(id)}, function(err, doc) {
                let songs = doc.songs;
                let urls_already_in = [];
                for (let song of songs) {
                    if (urls.includes(song.url)) {
                        urls_already_in.push(song.url);
                    } else {
                        songs = arrayRemove(songs, song);
                    }
                }
                for (let url of urls) {
                    if (! urls_already_in.includes(url) && url != '') {
                        let vid_info = getVideoInfo(url);
                        songs.push(vid_info);
                    }
                }
                let song_titles = [];
                for (let song of songs) {
                    song_titles.push(song.vid_title);
                }
                var playlist_info = {
                    title: title,
                    description: description,
                    modification_date: new Date(),
                    genres: genres,
                    songs: songs,
                    song_titles: song_titles,
                    color: color,
                    theme: theme
                };
                dbo.collection('playlists').updateOne({_id: ObjectId(id)}, {$set: playlist_info}, function(err, result) {
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
        req.session.sorting = null;
        dbo.collection('playlists').findOne({_id: ObjectId(id)}, function(err, doc) {
            if (err) throw err;
            req.session.playlist = doc;
            for (let song of doc.songs) {
                song.date = getFullDate(song.date);
            }
            let new_doc = {header_song_title: 'Title',
                          header_added: 'Added on',
                          song_list: doc.songs,
                          title: doc.title,
                          genres: doc.genres.join(' / '),
                          description: doc.description,
                          creator: doc.creator,
                          playlist_color: doc.color,
                          theme: doc.theme};
            if (req.session.username != null) {
                new_doc['username'] = req.session.username;
            } else {
                new_doc['login'] = 'Log in';
            }
            res.render('playlist_content.html', new_doc);
        })
    });

    app.get('/delete_playlist', function(req, res) {
        let id = req.session.playlist_id;
        req.session.playlist_id = null;
        dbo.collection('playlists').deleteOne({_id: ObjectId(id)}, function(err, res) {
            if (err) throw err;
            console.log('Playlist successfully deleted');
        });
        req.session.accountMessage = 'Playlist deleted.';
        res.redirect('/account');
    });

    app.get('/search_playlist', function(req, res) {
        if (req.query.search_words == '') {
            if (req.session.username != null) {
                    res.render('homepage.html', {
						username: req.session.username,
						noMatchErrorMessage: 'No match found'
					});
            } else {
                    res.render('homepage.html', {
						login: 'Log in',
						noMatchErrorMessage: 'No match found'
					});
            }
        } else {
            dbo.collection('playlists').aggregate([{$search:
                {'text':
                    {'query': req.query.search_words,
                     'path': ['description', 'creator', 'title', 'genres', 'song_titles'],
                     'fuzzy': {}
                    }
                }
            }]).toArray((err, doc) => {
                if (err) throw err;
                req.session.search = doc;
                req.session.show_all = doc;
                if (doc.length == 0) {
                    if (req.session.username != null) {
                            res.render('homepage.html', {
								username: req.session.username,
								noMatchErrorMessage: 'No match found'
							});
                    } else {
                            res.render('homepage.html', {
								login: 'Log in',
								noMatchErrorMessage: 'No match found'
							});
                    }
                } else {
                    let new_doc = JSON.parse(JSON.stringify(table_headers));
                    new_doc['playlist_list'] = getAllDates(doc);
                    if (req.session.username != null) {
                        new_doc['username'] = req.session.username;
                    } else {
                        new_doc['login'] = 'Log in';
                    }
                    res.render('homepage.html', new_doc);
                }
            });
        }
    });

    app.get('/advanced_search', function(req, res) {
        res.render('advanced_search.html');
    })

    app.post('/advanced_search', function(req, res) {
        // if the search is made only on dates, all documents are retrieved and filtered according to the date
        if (
            req.body.description == ''
            && req.body.playlist_title == ''
            && req.body.song_titles == ''
            && req.body.genres == ''
            && req.body.creator == ''
        ) {

            dbo.collection('playlists').find({}).toArray(function(err, doc) {
                if (err) throw err;
                for (let playlist of doc) {
                    if ((req.body.created_after != '' && new Date(playlist.creation_date) < new Date(req.body.created_after))
                    || (req.body.created_before != '' && new Date(playlist.creation_date) > new Date(req.body.created_before))
                    || (req.body.modified_after != '' && new Date(playlist.modification_date) < new Date(req.body.modified_after))
                    || (req.body.modified_before != '' && new Date(playlist.modification_date) > new Date(req.body.modified_before))) {
                        doc = arrayRemove(doc, playlist);
                    }
                }
                req.session.search = doc;
                req.session.show_all = doc;
                if (doc.length == 0) {
                    req.session.search = doc;
                    req.session.show_all = doc;
                    if (req.session.username != null) {
                        res.render('homepage.html', {
                            username: req.session.username,
                            noMatchErrorMessage: 'No match found'
                        });
                    } else {
                        res.render('homepage.html', {
                            login: 'Log in',
                            noMatchErrorMessage: 'No match found'
                        });
                    }
                } else {
                    let new_doc = JSON.parse(JSON.stringify(table_headers));
                    new_doc['playlist_list'] = getAllDates(doc);;
                    if (req.session.username != null) {
                        new_doc['username'] = req.session.username;
                    } else {
                        new_doc['login'] = 'Log in';
                    }
                    res.render('homepage.html', new_doc);
                }
            });
        // if the search is not only made on the date, match is made on other elements and dates are filtered afterwards
        } else {
            if (req.body.description == '') { req.body.description = ' '; }
            if (req.body.playlist_title == '') { req.body.playlist_title = ' '; }
            if (req.body.song_titles == '') {req.body.song_titles = ' '; }
            if (req.body.genres == '') { req.body.genres = ' '; }
            if (req.body.creator == '') { req.body.creator = ' '; }
            dbo.collection('playlists').aggregate([{$search:
                {
                    'compound': {
                        'should': [{
                            'text': {
                                'query': req.body.description,
                                'path': ['description'],
                                'fuzzy': {}
                            }
                        }, {
                            'text': {
                                'query': req.body.playlist_title,
                                'path': ['title'],
                                'fuzzy': {}
                            }
                        }, {
                            'text': {
                                'query': req.body.song_titles,
                                'path': ['song_titles'],
                                'fuzzy': {}
                            }
                        }, {
                            'text': {
                                'query': req.body.genres,
                                'path': ['genres'],
                                'fuzzy': {}
                            }
                        }, {
                            'text': {
                                'query': req.body.creator,
                                'path': ['creator'],
                                'fuzzy': {}
                            }
                        }]
                    }
                }
            }]).toArray((err, doc) => {
                if (err) throw err;
                if (doc.length == 0) {
                    req.session.search = doc;
                    req.session.show_all = doc;
                    if (req.session.username != null) {
                        res.render('homepage.html', {
							username: req.session.username,
							noMatchErrorMessage: 'No match found'
						});
                    } else {
                        res.render('homepage.html', {
							login: 'Log in',
							noMatchErrorMessage: 'No match found'
						});
                    }
                } else {
                    for(let playlist of doc) {
                        if ((req.body.created_after != '' && new Date(playlist.creation_date) < new Date(req.body.created_after))
                        || (req.body.created_before != '' && new Date(playlist.creation_date) > new Date(req.body.created_before))
                        || (req.body.modified_after != '' && new Date(playlist.modification_date) < new Date(req.body.modified_after))
                        || (req.body.modified_before != '' && new Date(playlist.modification_date) > new Date(req.body.modified_before))) {
                            doc = arrayRemove(doc, playlist);
                        }
                    }
                    req.session.search = doc;
                    req.session.show_all = doc;
                    let new_doc = JSON.parse(JSON.stringify(table_headers));
                    new_doc['playlist_list'] = getAllDates(doc);
                    if (req.session.username != null) {
                        new_doc['username'] = req.session.username;
                    } else {
                        new_doc['login'] = 'Log in';
                    }
                    res.render('homepage.html', new_doc);
                }
            });
        }
    });

    app.get('/user_playlists', function(req, res) {
        req.session.creator = req.query.creator;
        dbo.collection('playlists').find({creator: req.session.creator}).toArray(function(err, doc) {
            if (err) throw err;
            req.session.search = doc;
            req.session.origin = 'user_playlists.html';
            let new_doc = JSON.parse(JSON.stringify(table_headers));
            new_doc['playlist_list'] = getAllDates(doc);
            new_doc['user_creator'] = req.session.creator;
            if (req.session.username != null) {
                new_doc['username'] = req.session.username;
            } else {
                new_doc['login'] = 'Log in';
            }
            res.render('user_playlists.html', new_doc);
        });
    });

    app.post('/select_genres', function(req, res) {
        let new_doc = JSON.parse(JSON.stringify(table_headers));
        req.session.search = req.session.show_all;
        let selected_genres = [];
        if (Array.isArray(req.body.playlist_genres)) {
            selected_genres = req.body.playlist_genres;
        } else {
            selected_genres.push(req.body.playlist_genres);
        }
        for (let genre of selected_genres) {
            new_doc[genre] = 'checked';
        }
        req.session.search = filterGenres(req.session.search, selected_genres);
        new_doc['playlist_list'] = req.session.search;
        if (req.session.username != null) {
            new_doc['username'] = req.session.username;
        } else {
            new_doc['login'] = 'Log in';
        }
        res.render('homepage.html', new_doc);
    });

    app.get('/show_all', function(req, res) {
        req.session.search = req.session.show_all;
        let new_doc = JSON.parse(JSON.stringify(table_headers));
        new_doc['playlist_list'] = req.session.show_all;
        if (req.session.username != null) {
            new_doc['username'] = req.session.username;
        } else {
            new_doc['login'] = 'Log in';
        }
        res.render('homepage.html', new_doc);
    });

    app.get('/logout', function(req, res) {
        req.session.username = null;
        res.redirect('/homepage');
    });

    if (process.argv.includes('http')) {
        http.createServer({
        }, app).listen(port, function() {
            console.log('Server running on port 8080')
        });
    } else {
        https.createServer({
            key: fs.readFileSync('./key.pem'),
            cert: fs.readFileSync('./cert.pem'),
            passphrase: 'ingi'
        }, app).listen(port, function() {
            console.log('Server running on port 8080')
        });
    }
});

function getFullDate(d) {
    let date = new Date(d);
    let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'Augustus', 'September', 'October', 'November', 'December']
    let fullDate = months[date.getMonth()] + ' ' + date.getDate() + ', '+ date.getFullYear();
    return fullDate;
}

function getAllDates(doc) {
    for (let playlist of doc) {
        playlist.modification_date = getFullDate(playlist.modification_date);
        playlist.creation_date = getFullDate(playlist.creation_date);
    }
    return doc;
}

function getVideoInfo(url) {
    let vid_id;
    let source;
    let embedded_video;
    let vid_title = url;
    let vid_length;
    let play_button = 'Play';
    if (url.includes('youtube') | url.includes('youtu.be') | url.includes('vimeo')) {
        const info = getVideoId(url);
        vid_id = info.id;
        source = info.service;
        if (source == 'youtube') {
            embedded_video = 'https://www.youtube.com/embed/' + vid_id + '?autoplay=1';
            let API_url = 'https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=' + vid_id + '&key=AIzaSyDWSwITRSdspIeaC5upd9oZ6cE0z8b-bi4';
            vid_title = getVideoTitle(API_url, source);
        } else if (source == 'vimeo') {
            embedded_video = 'https://player.vimeo.com/video/' + vid_id + '?autoplay=1';
            let API_url = 'https://vimeo.com/api/oembed.json?url=https%3A//vimeo.com/' + vid_id;
            vid_title = getVideoTitle(API_url, source);
        }
    } else if (url.includes('dailymotion') | url.includes('dai.ly')) {
        source = 'dailymotion';
        if (url.includes('dailymotion')) {
            vid_id = url.replace(/.*video[/]/, '').replace(/[_?$#/].*/, '');
        } else {
            vid_id = url.replace(/.*dai.ly[/]/, '');
        }
        embedded_video = 'https://www.dailymotion.com/embed/video/' + vid_id + '?autoplay=1';
        let API_url = 'https://api.dailymotion.com/video/' + vid_id + '?fields=title,duration';
        vid_title = getVideoTitle(API_url, source);
    } else if (url.includes('soundcloud')) {
        source = 'soundcloud';
        embedded_video = 'https://w.soundcloud.com/player/?url=' + url + '&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true';
    }
    if (embedded_video == null) {play_button = 'Listen to this song by clicking on the link provided in the title section';}
    let vid_info = {url: url,
                    date: new Date(),
                    vid_id: vid_id,
                    vid_title: vid_title,
                    source: source,
                    embedded_video: embedded_video,
                    play_button: play_button};
    return vid_info;
}

function getVideoTitle(API_url, source) {
    let request = new XMLHttpRequest();
    let vid_title;
    request.open('GET', API_url, false);
    request.send(null);
    if (request.status === 200) {
        let data = JSON.parse(request.responseText);
        if (source == 'youtube') {
            vid_title = data.items[0].snippet.title;
        } else {
            vid_title = data.title;
        }
    } else {
        console.log('Error: could not complete http request. ERROR CODE: ',request.status);
    }
    return vid_title;
}

function filterGenres(playlist_list, selected_genres) {
    let all_genres = ['alternative','country','folk','house','latino','metal','pop','punk','rock','techno', 'other'];
    for (let playlist of playlist_list) {
        let corresponding_genres = 0;
        for (let genre of playlist.genres) {
            if (all_genres.includes(genre) && selected_genres.includes(genre)) {
                corresponding_genres = 1;
                break
            } else if (selected_genres.includes('other') && ! all_genres.includes(genre)) {
                corresponding_genres = 1;
                break;
            }
        }
        if (corresponding_genres == 0) {
            playlist_list = arrayRemove(playlist_list, playlist);
        }
    }
    return playlist_list;
}

function arrayRemove(arr, value) {
    return arr.filter(function(ele) {
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

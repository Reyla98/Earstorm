var express = require('express');
var consolidate = require('consolidate');
var bodyParser = require('body-parser');
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

//Database 
var MongoClient = require('mongodb').MongoClient;
var uri = "mongodb+srv://groupD:group-5678D@earstorm.twelv.mongodb.net/Earstorm?retryWrites=true&w=majority";
var client = new MongoClient(uri, { useNewUrlParser: true });
var dbName = "earstorm"

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

app.post('/signup', function(req,res){ //protect password with encryption
	let user = req.body.signUpUsername;
	let pwd = req.body.signUpPassword;
	let mail = req.body.emailAddress;
	req.session.username = req.body.signUpUsername;
	let userInfo = {
		user,
		pwd,
		mail
	}
	newUser(userInfo).catch(console.dir);
  res.render("account.html", {username:req.session.username});
});

app.get('/addPlaylist', function(req,res){
    res.render('create_pl.html', {username:req.session.username});
});

// use double slash to test without some particular field(s) (do it before variable declaration + in playlistInfo)
app.post('/createPlaylist', function(req,res){
	let illustration = req.body.customFile
	let name = req.body.playlist_name;
	let creator = req.session.username;
	let creation_date = new Date();
	let mod_date = new Date();
	let genres = (req.body.playlist_genres).replace(/&/g, '').split("playlist_genres");
	let titles = (req.body.playlist_titles)..replace(/ /g, '')split(",");
	let playlistInfo = {
		illustration,
		name,
		creator,
		creation_date,
		mod_date,
		genres,
		titles
  }
	add(playlistInfo).catch(console.dir);
	res.redirect("/homepage");
});

app.post('/modifyPlaylist', function(req,res){
	//récupérer le "_id" de l'élément de la collection "playlists"
	//can't modify creation_date & creator
	let illustration = req.body.customFile
	let name = req.body.playlist_name;
	let mod_date = new Date();
	let genres = (req.body.playlist_genres).replace(/&/g, '').split("playlist_genres");
	let titles = (req.body.playlist_titles).replace(/ /g, '').split(",");
	let playlistInfo = {
		illustration,
		name,
		mod_date,
		genres,
		titles
  }
	mod(id, playlistInfo).catch(console.dir);
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

async function add(playlistInfo) {
	try {
		await client.connect();
		console.log("Connected correctly to server");
		const db = client.db(dbName);
		const col = db.collection("playlists");
		const p = await col.insertOne(playlistInfo);
		console.log("New playlist created");
			
	} catch (err) {
		console.log(err.stack);
		
	} finally {
		await client.close();
	}
}

//à tester quand on saura comment renvoyer l'id depuis le lien pour modifier la playlist
async function mod(id, playlistInfo) {
	try {
		await client.connect();
		console.log("Connected correctly to server");
		const db = client.db(dbName);
		const col = db.collection("playlists");
		const p = await col.update({_id:id},{$set:{playlistInfo}});
		console.log("Playlist updated");
			
	} catch (err) {
		console.log(err.stack);
		
	} finally {
		await client.close();
	}
}

async function newUser(userInfo) {
	try {
		await client.connect();
		console.log("Connected correctly to server");
		const db = client.db(dbName);
		const col = db.collection("users");
		const p = await col.insertOne(userInfo);
		console.log("New user created");
	
	} catch (err) {
		console.log(err.stack);
	
	} finally {
		await client.close();
	}
}

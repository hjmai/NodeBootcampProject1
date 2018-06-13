const express = require('express');
const app = express();
const Discord = require('discord.js');
const client = new Discord.Client();
const botToken = "commentedout";
const firebaseAdmin = require('firebase-admin');
var serviceAccount = require('./fire-rocks-7d02e-firebase-adminsdk-wl32u-e0e89874b6.json');
firebaseAdmin.initializeApp({
	credential: firebaseAdmin.credential.cert(serviceAccount),
	databaseURL: 'https://fire-rocks-7d02e.firebaseio.com'
});
var database = firebaseAdmin.database();

var port = process.env.PORT || 8080;

app.set('view engine', 'ejs')

app.get('/', function (req, res) {
	res.render('index');
})
app.use(express.static('public'));
app.listen(port, function () {
	console.log('Fire Rocks listening on port 8080')
})

client.on('ready', () => {
	console.log('I am ready!');	
});

// Log our bot in
client.login(botToken);

database.ref().child('decks/').on('child_added', function(childSnapshot){
	var channel = client.channels;
	var generalChannel = client.channels.get('455546465713127459');
	generalChannel.send('New deck created: \n' +
						'```' +
						'\nDeck Name: ' + childSnapshot.val().selectedDeck.name + 
						'\nDeck Class: ' + childSnapshot.val().selectedDeck.deckClass +
						'\nAuthor: ' + childSnapshot.val().selectedDeck.author +
						'```' + 
						'Check it out at: https://heroku-firerocks-8080.herokuapp.com/\n');
})

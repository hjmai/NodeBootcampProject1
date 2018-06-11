const express = require('express');
const app = express();
const Discord = require('discord.js');
const client = new Discord.Client();
const botToken = "NDU0MDI0OTY0NTUxNjA2Mjgy.Df9acQ.XgBA5jPG6e1eTHhN0n1G5UB5dcc";
const firebaseAdmin = require('firebase-admin');
var serviceAccount = require('./fire-rocks-7d02e-firebase-adminsdk-wl32u-e0e89874b6.json');
firebaseAdmin.initializeApp({
	credential: firebaseAdmin.credential.cert(serviceAccount),
	databaseURL: 'https://fire-rocks-7d02e.firebaseio.com'
});
var database = firebaseAdmin.database();

app.set('view engine', 'ejs')

app.get('/', function (req, res) {
	res.render('index');
})
app.use(express.static('public'));
app.listen(3000, function () {
	console.log('Fire Rocks listening on port 3000')
})

client.on('ready', () => {
	console.log('I am ready!');	
});

// Log our bot in
client.login(botToken);

database.ref().child('decks/').on('child_added', function(childSnapshot){
	var channel = client.channels;
	var generalChannel = client.channels.get('455546465713127459');
	generalChannel.send('New deck was created! Check it out at: https://hjmai.github.io/BootcampProject1/');
})
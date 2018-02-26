// An Express Server for running our app
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

// Servinig Static Content
app.use(express.static('static'));

// Defining routes
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});
app.get('/example', function (req, res) {
    res.sendFile(__dirname + '/example.html');
});

app.listen(PORT, console.log("The App is running on PORT: " + PORT +". Visit http://localhost:"+PORT+"/"));
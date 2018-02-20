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
app.get('/example1', function (req, res) {
    res.sendFile(__dirname + '/examples/example1.html');
});
app.get('/example2', function (req, res) {
    res.sendFile(__dirname + '/examples/example2.html');
});
app.get('/example3', function (req, res) {
    res.sendFile(__dirname + '/examples/example3.html');
});

app.listen(PORT, console.log("The App is running on PORT: " + PORT +". Visit http://localhost:"+PORT+"/"));
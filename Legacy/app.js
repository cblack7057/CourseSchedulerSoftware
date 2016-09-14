var app, express;
var path = require('path');


express = require("express");

app = express();

app.get("/", function (req, res) {
    //res.send('Hello World');
    console.log('getting ' + 'index2.html');
    res.sendFile(path.join(__dirname + '/index2.html'));
});

app.post("/locations", function (request, response) {
    console.log('Hurhurhur');
    var latitude, longitude;
    latitude = request.body.latitude;
    longitude = request.body.longitude;
    return response.json({}, 200);
});

app.listen(8080);
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

// bodyParser() is used to let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080; // set the api port

var router = express.Router();

router.use(function(req, res, next) {
        console.log('Received ' + req.method + ' request at ' + req.url);
        next();
    })
    // /test endpoint
    .get('/test/:param', function(req, res) {
        console.log(req.params);

        res.json({ id: req.params.param, message: 'TODO: Implement me!' });   
    })

    // get citizen info based on the passed params
    .get('/getCitizen', function(req, res) {
        res.json({ message: 'TODO: Implement me!' });   
    })

    // create citizen info
    .post('/createCitizen', function(req, res) {
        res.json({ message: 'TODO: Implement me!' });   
    });

app.use('/api', router);
app.listen(port);

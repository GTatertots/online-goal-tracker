import * from ('./data_model.js');

const express = require('express');
const session = require('express-session');
const cors = require('cors');


const app = express();
const port = process.env.PORT || 8080;
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: 'fadsbjvirpoweruvklxnvldfjgaznxcvkjoue',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))

app.post('/users', function (req, res) {
    createUser(req.body.username,req.body.email,req.body.first_name,req.body.last_name,password).then(() => {
        console.log("user created to database");
        res.status(201).send("created user");
    }).catch((err) => {
        if (err.errors) {
            let errorList = {};
            for (let i in err.errors) {
                errorList[i] = error.errors[i].message;
            }
            res.status(422).json(errorList);
        } else { 
            res.status(500).send("server failed to create user");
        }
    });
});

app.get('/users', function (req, res) {
    retrieveUsers(req.body.condition).then(err, users => {
        if (err) {
            res.status(500).send("server failed to retrieve users");
        } else {
            res.json(users);
        }
    });
});

app.post('/goals', function (req, res) {
    createGoal(req.body.title,req.body.description,req.body.frequency,req.body.timeframe).then(() => {
        console.log("goal created to database");
        res.status(201).send("created goal");
    }).catch((err) => {
        if (err.errors) {
            let errorList = {};
            for (let i in err.errors) {
                errorList[i] = error.errors[i].message;
            }
            res.status(422).json(errorList);
        } else { 
            res.status(500).send("server failed to create goal");
        }
    });
});



app.listen(8080, function () {
	console.log('Server running on port 8080...');
});


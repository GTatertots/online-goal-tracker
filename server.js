const db = require("./data_model.js");

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

app.post('/session', function (req, res) {
    db.signIn(req.body.email, req.body.password).then((userID) => {
        if (userID) {
            res.status(201).send("Authenticated");
        } else { 
            res.status(401).send("Unauthenticated");
        }
    }).catch((err) => {
        res.status(401).send("Unauthenticated");
    });
});

app.post('/users', function (req, res) {
    db.createUser(req.body.username,req.body.email,req.body.first_name,req.body.last_name,req.body.password).then(() => {
        console.log("user created to database");
        res.status(201).send("created user");
    }).catch((err) => {
        if (err) {
            //let errorList = {};
            //for (let i in err.errors) {
            //    errorList[i] = error.errors[i].message;
            //}
            res.status(422).json(err);
        } else { 
            res.status(500).send("server failed to create user");
        }
    });
});

app.get('/users', function (req, res) {
    console.log("get users called");
    console.log("condition:", req.body.condition);
    db.retrieveUsers(req.body.condition).then((users) => { 
        res.json(users);
    }).catch((err) => {
        if (err) {
            res.status(422).json(err);
        } else {
            res.status(500).send("server failed to retrieve users");
        }
    });
});

app.post('/goals', function (req, res) {
    db.createGoal(req.body.title,req.body.description,req.body.frequency,req.body.timeframe).then(() => {
        console.log("goal created to database");
        res.status(201).send("created goal");
    }).catch((err) => {
        if (err) {
            res.status(422).json(err);
        } else { 
            res.status(500).send("server failed to create goal");
        }
    });
});

app.post('/followees', function (req, res) {
    db.addFollow(req.session.userID, req.body.followID).then(() => {
        console.log("new follow created");
        res.status(201).send("followed successfully");
    }).catch((err) => {
        if (err) {
            res.status(422).json(err);
        } else {
            res.status(500).send("server failed to create follow");
        }
    });
});

app.delete('/followees/:followeeID', function (req, res) {
    db.removeFollow(req.session.userID, req.params.followeeID).then(() => {
        console.log("follow deleted");
        res.status(200).send("unfollowed successfully");
    }).catch((err) => {
        if (err) {
            res.status(404).json(err);
        } else {
            res.status(500).send("server failed to delete follow");
        }
    });
});

app.delete('/followers/:followerID', function (req, res) {
    db.removeFollow(req.params.followerID,req.session.userID).then(() => {
        console.log("follow deleted");
        res.status(200).send("follower removed successfully");
    }).catch((err) => {
        if (err) {
            res.status(404).json(err);
        } else {
            res.status(500).send("server failed to delete follow");
        }
    });
});

app.get('/followees', function (req, res) {
    db.retrieveFollowing(req.session.userID).then((users) => {
        res.json(users);
    }).catch((err) => {
        if (err) {
            res.status(404).json(err);
        } else {
            res.status(500).send("server failed to retrieve following");
        }
    });
});

app.get('/followers', function (req, res) {
    db.retrieveFollowers(req.session.userID).then((users) => {
        res.json(users);
    }).catch((err) => {
        if (err) {
            res.status(404).json(err);
        } else {
            res.status(500).send("server failed to retrieve followers");
        }
    });
});

app.listen(8080, function () {
	console.log('Server running on port 8080...');
});


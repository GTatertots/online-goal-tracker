const db = require("./data_model.js");

const express = require('express');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config({ path: './.env' });

const app = express();
const port = process.env.PORT || 8080;
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(cors({
    credentials: true,
    origin: function (origin, callback) {
        callback(null, origin);
    }
}));
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true
    //cookie: { 
    //    secure: true,
    //    sameSite: 'None'
    //}  
}))

function authorizeRequest(req, res, next) { 
    console.log("request userID:", req.session.userID)
    console.log("req session:", req.session)
    if (req.session && req.session.userID) {
        db.retrieveUser(req.session.userID).then(function (user) {
            if (user) {
              //req.userID = user.user_id;
              next();
            } else {
              res.status(401).send("Unauthenticated");
            }
        });
    } else {
        res.status(401).send("Unauthenticated");
    }
}

app.post('/session', function (req, res) {
    db.signIn(req.body.email, req.body.password).then((userID) => {
        if (userID) {
            req.session.userID = userID;
            console.log("userID set to:", req.session.userID);
            res.status(201).send("Authenticated");
        } else { 
            res.status(401).send("Unauthenticated");
        }
    }).catch((err) => {
        res.status(401).send("Unauthenticated");
    });
});

app.get('/session', authorizeRequest, function (req, res) {
    console.log("session data:", req.session);
    res.json(req.session.userID);
});

app.delete('/session', authorizeRequest, function (req, res) {
    req.session.userID = undefined;
    res.status(204).send("logged out");
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

app.get('/users', authorizeRequest, function (req, res) {
    console.log("get users called");
    console.log("condition:", req.query.condition);
    console.log("user:", req.query.userID);
    db.retrieveUsers(req.query.condition, req.query.userID).then((users) => { 
        res.json(users);
    }).catch((err) => {
        if (err) {
            res.status(422).json(err);
        } else {
            res.status(500).send("server failed to retrieve users");
        }
    });
});

app.post('/users/:userID/followees', authorizeRequest, function (req, res) {
    db.addFollow(parseInt(req.params.userID), parseInt(req.body.followeeID)).then(() => {
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

app.delete('/users/:userID/followees/:followeeID', authorizeRequest, function (req, res) {
    db.removeFollow(parseInt(req.params.userID), parseInt(req.params.followeeID)).then(() => {
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

app.delete('/users/:userID/followers/:followerID', authorizeRequest, function (req, res) {
    db.removeFollow(parseInt(req.params.followerID),parseInt(req.params.userID)).then(() => {
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

app.get('/users/:userID/followees', authorizeRequest, function (req, res) {
    console.log(req.params.userID)
    db.retrieveFollowing(req.params.userID).then((users) => {
        res.json(users);
    }).catch((err) => {
        if (err) {
            res.status(404).json(err);
        } else {
            res.status(500).send("server failed to retrieve following");
        }
    });
});

app.get('/users/:userID/followers', authorizeRequest, function (req, res) {
    db.retrieveFollowers(req.params.userID).then((users) => {
        res.json(users);
    }).catch((err) => {
        if (err) {
            res.status(404).json(err);
        } else {
            res.status(500).send("server failed to retrieve followers");
        }
    });
});

app.get('/goals', authorizeRequest, function (req, res) {
    db.retrieveGoals(req.query.condition).then((goals) => {
        res.json(goals);
    }).catch((err) => {
        if (err) {
            res.status(404).json(err);
        } else {
            res.status(500).send("server failed to retrieve followers");
        }
    }); 
});

app.get('/goals/:goalID/users', authorizeRequest, function (req, res) {
    db.retrieveGoalUsers(req.params.goalID).then((users) => {
        res.json(users);
    }).catch((err) => {
        if (err) {
            res.status(404).json(err);
        } else {
            res.status(500).send("server failed to retrieve goal users");
        }
    });
});

app.get('/users/:userID/goals', authorizeRequest, function (req, res) {
    console.log("userID:",req.params.userID);
    console.log("condition:",req.query.condition);
    db.retrieveUserGoals(req.params.userID,req.query.condition).then((goals) => {
        res.json(goals);
    }).catch((err) => {
        if (err) {
            res.status(404).json(err);
        } else {
            res.status(500).send("server failed to retrieve goals");
        }
    }); 
});

app.post('/goals', authorizeRequest, function (req, res) {
    db.createGoal(req.body.title,req.body.description,req.body.frequency,req.body.timeframe).then((lastID) => {
        console.log("new goal created with id:",lastID);
        res.status(201).json({"lastID":lastID});
        //res.status(201).send("goal created successfully");
    }).catch((err) => {
        if (err) {
            res.status(422).json(err);
        } else {
            res.status(500).send("server failed to create goal");
        }
    });
});

app.post('/users/:userID/goals', authorizeRequest, function (req, res) {
    console.log("called to add goal:", req.body.goalID)
    db.addGoal(parseInt(req.params.userID),parseInt(req.body.goalID)).then(() => {
        console.log("new goal added");
        res.status(201).send("goal added successfully");
    }).catch((err) => {
        if (err) {
            console.log(err);
            res.status(422).json(err);
        } else {
            res.status(500).send("server failed to add goal");
        }
    });
});

app.delete('/goals/:goalID', authorizeRequest, function (req, res) {
    db.deleteGoal(req.params.goalID).then(() => {
        console.log("goal deleted");
        res.status(200).send("goal deleted successfully");
    }).catch((err) => {
        if (err) {
            res.status(404).json(err);
        } else {
            res.status(500).send("server failed to delete goal");
        }
    });
});

app.delete('/users/:userID/goals/:goalID', authorizeRequest, function (req, res) {
    db.removeGoal(req.params.userID,req.params.goalID).then(() => {
        console.log("goal removed");
        res.status(200).send("goal removed successfully");
    }).catch((err) => {
        if (err) {
            res.status(404).json(err);
        } else {
            res.status(500).send("server failed to remove goal");
        }
    });
});

app.post('/users/:userID/goals/:goalID/stats', authorizeRequest, function (req, res) {
    console.log("stats params:", req.params);
    console.log("stats body:", req.body);
    db.createStat(parseInt(req.params.userID),parseInt(req.params.goalID),parseInt(req.body.day),parseInt(req.body.month),parseInt(req.body.year),parseInt(req.body.stat)).then(() => {
        console.log("stat added"); 
        res.status(201).send("stat added successfully");
    }).catch((err) => {
        if (err) {
            res.status(422).json(err);
        } else {
            res.status(500).send("server failed to add stat");
        }
    });
});

app.get('/users/:userID/goals/:goalID/stats', authorizeRequest, function (req, res) {
    console.log("limit inside SQL Query:", req.query.limit);
    db.retrieveStats(parseInt(req.params.userID),parseInt(req.params.goalID),parseInt(req.query.limit)).then((stats) => {
        res.json(stats);
    }).catch((err) => {
        if (err) {
            res.status(404).json(err);
        } else {
            res.status(500).send("server failed to retrieve goal stats");
        }
    }); 
});

app.put('/stats/:statID', authorizeRequest, function (req, res) {
    console.log("putStat called with statID:", req.params.statID)
    db.updateStat(req.params.statID, req.body.stat).then(() => {
        console.log("stat updated"); 
        res.status(200).send("stat updated successfully");
    }).catch((err) => {
        if (err) {
            res.status(404).json(err);
        } else {
            res.status(500).send("server failed to update stat");
        }
    });
});

app.listen(port, function () {
	console.log('Server running on port 8080...');
});


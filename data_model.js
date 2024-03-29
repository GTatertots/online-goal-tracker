const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');

const DB = './data.db';

module.exports = {

    signIn: function(email, password) {
        return new Promise(async (resolve, reject) => {
            const db = new sqlite3.Database(DB);
            db.serialize(() => {
                db.all('SELECT user_id, encrypted_password FROM users WHERE email = ?', [email], (err, rows) => {
                    if (err) {
                        reject(err)
                    } else if (rows[0]) {
                        bcrypt.compare(password, rows[0].encrypted_password).then(result => {
                            if (result) {
                                resolve(rows[0].user_id);
                            } else {
                                reject("bad password");
                            }
                        });
                    } else {
                        reject("bad email");
                    }
                })
            })
        });
    },

    createUser: function(username, email, firstName,lastName,password) {
        return new Promise(async (resolve, reject) => {
            const db = new sqlite3.Database(DB);
            const encryptedPassword = await bcrypt.hash(password, 10);
            console.log(encryptedPassword);
            db.serialize(() => {
                db.run('INSERT INTO users (username, email, first_name, last_name, encrypted_password) VALUES (?,?,?,?,?)',[username,email,firstName,lastName,encryptedPassword], (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                })
            })
            db.close();
        });
    },

    retrieveUsers: function(condition) { 
        return new Promise(function (resolve, reject) {
            console.log("retrieveUsers called")
            const db = new sqlite3.Database(DB);
            db.serialize(() => {
                db.all('SELECT * FROM users WHERE username LIKE ?1 OR first_name LIKE ?1 OR last_name LIKE ?1',[condition], (err, rows) => {
                    if (err) {
                        reject(err);
                    } else { 
                        resolve(rows);
                    }
                });
            });
            db.close();
        });
    },

    retrieveUser: function(userID) {
        return new Promise(function (resolve, reject) {
            console.log("retrieveUser called")
            const db = new sqlite3.Database(DB);
            db.serialize(() => {
                db.all('SELECT * FROM users WHERE user_id = ?', [userID], (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows[0]);
                    }
                });
            });
            db.close();
        });
    },

//
// these functions refer to the 'follows' table, where a user follows another user
//

    retrieveFollowing: function(userId) { 
        return new Promise(function (resolve, reject) {
            const db = new sqlite3.Database(DB);
            db.serialize(() => {
                db.all('SELECT users.user_id, users.username, users.email, users.first_name, users.last_name FROM follows JOIN users ON follows.follows_id = users.user_id WHERE follows.user_id = ?',[userId], (err, rows) => {
                    if (err) {
                        reject(err);
                    } else { 
                        resolve(rows);
                    }
                })
            })
            db.close();
        });
    },

    retrieveFollowers: function(userId) {
        return new Promise(function (resolve, reject) {
            const db = new sqlite3.Database(DB);
            db.serialize(() => {
                db.all('SELECT users.user_id, users.username, users.email, users.first_name, users.last_name FROM follows JOIN users ON follows.user_id = users.user_id WHERE follows.follows_id = ?',[userId], (err, rows) => {
                    if (err) {
                        reject(err);
                    } else { 
                        resolve(rows);
                    }
                })
            })
            db.close();
        })
    },

    addFollow: function(userId, followId) { 
        console.log(userId, followId);
        return new Promise(function (resolve, reject) {
            const db = new sqlite3.Database(DB);
            db.serialize(() => {
                db.run('INSERT INTO follows (user_id, follows_id) VALUES (?,?)',[userId,followId], (err) => {
                    if (err) {
                        reject(err);
                    } else { 
                        resolve();
                    }
                })
            })
            db.close();
        })
    },

    removeFollow: function(userId, followId) { 
        return new Promise(function (resolve, reject) {
            const db = new sqlite3.Database(DB);
            db.serialize(() => {
                db.run('DELETE FROM follows WHERE user_id = ? AND follows_id = ?',[userId,followId], (err) => {
                    if (err) {
                        reject(err);
                    } else { 
                        resolve();
                    } 
                })
            })
            db.close();
        })
    },

//
// addGoal and removeGoal refer to specifically to the 'has' table, where a user has a goal
//

    retrieveUserGoals: function(userId, condition) {
        return new Promise(function (resolve, reject) {
            const db = new sqlite3.Database(DB);
            db.serialize(() => {
                db.all('SELECT goal_id, title, description, frequency, timeframe FROM goals NATURAL JOIN has NATURAL JOIN users WHERE users.user_id = ? AND goals.title LIKE ?',[userId, condition], (err, rows) => {
                    if (err) {
                        reject(err);
                    } else { 
                        resolve(rows);
                    } 
                })
            })
            db.close();
        });
    },

    addGoal: function(userId, goalId) {
        return new Promise(function (resolve, reject) {
            const db = new sqlite3.Database(DB);
            db.serialize(() => {
                db.run('INSERT INTO has (user_id, goal_id) VALUES (?,?)',[userId,goalId], (err) => {
                    if (err) {
                        reject(err);
                    } else { 
                        resolve();
                    } 
                })
            })
            db.close();
        });
    },

    removeGoal: function(userId, goalId) {
        return new Promise(function (resolve, reject) { 
            const db = new sqlite3.Database(DB);
            db.serialize(() => {
                db.run('DELETE FROM has WHERE user_id = ? AND goal_id = ?',[userId,goalId], (err) => { 
                    if (err) {
                        reject(err);
                    } else { 
                        resolve();
                    } 
                })
            })
            db.close();
        });
    },

//
// the following refer directly to the 'goal' table
//

    retrieveGoals: function(condition) {
        return new Promise(function (resolve, reject) {
            const db = new sqlite3.Database(DB);
            db.serialize(() => {
                db.all('SELECT * FROM goals WHERE title LIKE ?',[condition], (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                })
            })
            db.close(); 
        });
    },

    createGoal: function(title,description,frequency,timeframe) {
        return new Promise(function (resolve, reject) {
            const db = new sqlite3.Database(DB);
            db.serialize(() => {
                db.run('INSERT INTO goals (title,description,frequency,timeframe) VALUES (?,?,?,?)',[title,description,frequency,timeframe], (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                })
            })
            db.close();
        });
    },

    deleteGoal: function(goalId) {
        return new Promise(function (resolve, reject) {
            const db = new sqlite3.Database(DB);
            db.serialize(() => {
                db.run('DELETE FROM goals WHERE goal_id = ?',[goalId], (err) => {
                    if (err) {
                        reject(err);
                    } else { 
                        resolve();
                    }
                })
            })
            db.close();
        });
    },



}

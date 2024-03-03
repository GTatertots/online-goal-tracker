const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');

export function createUser(username, email, firstName,lastName,password) {
    const db = new sqlite3.Database('./goaltracker.db');
    const encryptedPassword = await bcrypt.hash(password, 10);
    db.serialize(() => {
      db.run('INSERT INTO users (username, email, first_name, last_name, encrypted_password) VALUES (?,?,?,?,?)',[username,email,firstName,lastName,encryptedPassword]);
    })
    db.close();
}

export function retrieveUsers(condition) { 
    const db = new sqlite3.Database('./goaltracker.db');
    db.serialize(() => {
      db.all('SELECT * FROM users WHERE username LIKE ?1 OR first_name LIKE ?1 OR last_name LIKE ?1',[condition], (err, rows) => {
        return err, rows;
      }
    })
    db.close();
}

//
// these functions refer to the 'follows' table, where a user follows another user
//

export function retrieveFollowing(userId) { 
    const db = new sqlite3.Database('./goaltracker.db');
    db.serialize(() => {
      db.all('SELECT follows_id FROM follows WHERE user_id = ?',[userId], (err, rows) => {
        return err, rows;
      }
    })
    db.close();
}

export function retrieveFollowers(userId) {
    const db = new sqlite3.Database('./goaltracker.db');
    db.serialize(() => {
      db.all('SELECT user_id FROM follows WHERE follows_id = ?',[userId], (err, rows) => {
        return err, rows;
      }
    })
    db.close();
}

export function addFollow(userId, followId) { 
    const db = new sqlite3.Database('./goaltracker.db');
    db.serialize(() => {
      db.run('INSERT INTO follows (user_id, goal_id) VALUES (?,?)',[userId,followId]);
    })
    db.close();
}

export function removeFollow(userId, followId) { 
    const db = new sqlite3.Database('./goaltracker.db');
    db.serialize(() => {
      db.run('DELETE FROM follows WHERE user_id = ? AND follows_id = ?',[userId,followId]);
    })
    db.close();
}

//
// addGoal and removeGoal refer to specifically to the 'has' table, where a user has a goal
//

export function retrieveUserGoals(userId, condition){
    const db = new sqlite3.Database('./goaltracker.db');
    db.serialize(() => {
      db.all('SELECT goal_id, title, description, frequency, timeframe FROM goals NATURAL JOIN has NATURAL JOIN users WHERE users.user_id = ? AND goals.title LIKE ?',[userId, condition], (err, rows) => {
        return err, rows;
    })
    db.close();
}

export function addGoal(userId, goalId) {
    const db = new sqlite3.Database('./goaltracker.db');
    db.serialize(() => {
      db.run('INSERT INTO has (user_id, goal_id) VALUES (?,?)',[userId,goalId]);
    })
    db.close();
}

export function removeGoal(userId, goalId) {
    const db = new sqlite3.Database('./goaltracker.db');
    db.serialize(() => {
      db.run('DELETE FROM has WHERE user_id = ? AND goal_id = ?',[userId,goalId]);
    })
    db.close();
}

//
// the following refer directly to the 'goal' table
//

export function retrieveGoals(condition) {
    const db = new sqlite3.Database('./goaltracker.db');
    db.serialize(() => {
      db.all('SELECT * FROM goals WHERE title LIKE ?',[condition], (err, rows) => {
        return err, rows;
    })
    db.close(); 
}

export function createGoal(title,description,frequency,timeframe) {
    const db = new sqlite3.Database('./goaltracker.db');
    db.serialize(() => {
      db.run('INSERT INTO goals (title,description,frequency,timeframe) VALUES (?,?,?,?)',[title,description,frequency,timeframe]);
    })
    db.close();
}

export function deleteGoal(goalId) {
    const db = new sqlite3.Database('./goaltracker.db');
    db.serialize(() => {
      db.run('DELETE FROM goals WHERE goal_id = ?',[goalId]);
    })
    db.close();
}



# goals-with-friends

Goals with friends is a web application designed to help users track all of their goals on one easy to use website. Goals with Friends is also a social platform, allowing for users to see each other's progress on goals and explore goals that others have created in order to expand their self improvement.

This application uses a mainly Javascript stack, it utilizes Vue for frontend, Express for backend, and SQLite3 for database management. This project was conceptualized for a Senior Project.

## Resource

**Goals**

Attributes:

* title
* description
* frequency  
* timeframe  

**Users**

Attributes:

* username 
* email
* firstName
* lastName
* password

**Stats**

Attributes:


* userId
* goalId
* day   
* month 
* year
* status

## SQLite Schema

```sql 
CREATE TABLE users (
    user_id             INTEGER PRIMARY KEY,
    username            TEXT NOT NULL UNIQUE,
    email               TEXT NOT NULL UNIQUE,
    first_name          TEXT NOT NULL,
    last_name           TEXT NOT NULL,
    encrypted_password  TEXT NOT NULL
)

CREATE TABLE goals (
    goal_id     INTEGER PRIMARY KEY,
    title       TEXT NOT NULL,
    description TEXT NOT NULL,
    frequency   INTEGER NOT NULL,
    timeframe   INTEGER NOT NULL
)

CREATE TABLE follows (
    user_id     INTEGER NOT NULL,
    follows_id  INTEGER NOT NULL,
    primary key (user_id, follows_id),
    foreign key (user_id) references users (user_id)
        on delete cascade,
    foreign key (follows_id) references users (user_id)
        on delete cascade
)

CREATE TABLE has (
    user_id     INTEGER NOT NULL,
    goal_id     INTEGER NOT NULL,
    primary key (user_id,goal_id),
    foreign key (user_id) references users (user_id)
        on delete cascade,
    foreign key (goal_id) references goals (goal_id)
        on delete cascade
)

CREATE TABLE stats (
    stat_id     INTEGER PRIMARY KEY,
    user_id     INTEGER NOT NULL,
    goal_id     INTEGER NOT NULL,
    day         INTEGER NOT NULL,
    month       INTEGER NOT NULL,
    year        INTEGER NOT NULL,
    status      INTEGER NOT NULL,
    foreign key (user_id) references users (user_id)
        on delete cascade,
    foreign key (goal_id) references goals (goal_id)
        on delete cascade
);
```


## REST Endpoints

Name                  | Method | Path
----------------------|--------|------------------
create User           | POST   | /users
retrieve Users        | GET    | /users
follow User           | POST   | /users/userID/followees
unfollow User         | DELETE | /users/userID/followees/followeeID
retrieve following    | GET    | /users/userID/followees
retrieve followers    | GET    | /users/userID/followers
remove follower       | DELETE | /users/userID/followers/followerID
create Goal           | POST   | /goals
retrieve Goals        | GET    | /goals
delete Goal           | DELETE | /goals/goalID
add Goal (user)       | POST   | /users/userID/goals/
retrieve Goals (user) | GET    | /users/userID/goals/
remove Goal (user)    | DELETE | /users/userID/goals/goalID
retrieve statistics   | GET    | /users/userID/goals/goalID/stats
create statistic      | POST   | /users/userID/goals/goalID/stats
update statistic      | PUT    | /users/userID/goals/goalID/stats/statID



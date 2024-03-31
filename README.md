# online-goal-tracker

## Resource

**Goals**

Attributes:

* 
* 

**Users**

Attributes:

* 
* 

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
    user_id     INTEGER NOT NULL,
    goal_id     INTEGER NOT NULL,
    day         INTEGER NOT NULL,
    month       INTEGER NOT NULL,
    year        INTEGER NOT NULL,
    status      INTEGER NOT NULL,
    primary key (user_id, goal_id, day, month, year),
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


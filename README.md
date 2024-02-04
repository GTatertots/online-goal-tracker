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
    user_id INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL
);

CREATE TABLE goals (
    goal_id INTEGER NOT NULL,
    goal_title TEXT NOT NULL,
    recurrence INTEGER NOT NULL,
    FOREIGN KEY user_id REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);
```


## REST Endpoints

Name                           | Method | Path
----------------------|--------|------------------
Retrieve collection   | GET    | /lorems
Create something      | POST   | /lorems
                      |        |
Retrieve other        | GET    | /ipsums

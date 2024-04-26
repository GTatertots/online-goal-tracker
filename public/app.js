//const SERVER_URL = "http://localhost:8080";
const SERVER_URL = "https://goals-with-friends-6c700b071025.herokuapp.com";

Vue.createApp({
    data: function () {
        return {
            //session user
            sessionID: '',

            //user
            userUsername: "",
            userPassword: "",
            confirmPassword: "",
            userEmail: "",
            userFirst: "",
            userLast: "",
            
            //errors

            //goals
            createdGoalId: {},

            goalTitle: "",
            goalDescription: "",
            goalFrequency: "",
            goalTimeframe: "",
            
            goalSearch: "",
            goals: [],
            goalUsers: {},

            userGoalSearch: "",
            userGoals: [],
            userGoalIDs: [],
            
            goalStats: {},

            //expanded goal(s)
            expandedGoals: [],
            stats: [],

            //users
            currentUser: {},
            userSearch: "",
            users: [],
            following: [],
            followingIDs: [],
            followers: [],

            //displays
            displayLogin: 0,
            displayMain: 1,
            displaySocial: 2,
            displayFollowing: 3,
            displayFollowers: 4,
            displayGoals: 5,
            displayCreateGoal: 6,
            displayRegister: 7,
            displaySingleGoalStats: 8,
            displayOtherUserGoals: 9,

            display: 1,
            
            //notifications
            displayNotif: false,
            notif: ""
        };
    },
    
    methods: {
        //helper
        clearUserFields: function () {
            this.userUsername = "";
            this.userPassword = "";
            this.userEmail = "";
            this.userFirst = "";
            this.userLast = ""; 
            this.confirmPassword = "";
        },

        clearGoalFields: function () {
            this.goalTitle = "";
            this.goalDescription = "";
            this.goalFrequency = "";
            this.goalTimeframe = "";
        },

        usersIncludes: function (collection, item) {
            temp = [];
            if (collection = "following") {
                for (elt in this.following) {
                    temp.push(elt.user_id);
                }
            } else if (collection = "followers") {
                for (elt in this.followers) {
                    temp.push(elt.user_id);
                }
            }
            return temp.includes(item.user_id);
        },

        //sessions
        getSession: function () {
            fetch(SERVER_URL + "/session", {
                credentials: "include"
            }).then((response) => {
                if(response.status == 401) {
                    console.log("not logged in")
                    this.display = this.displayLogin;
                    return
                }
                response.json().then(data => {
                    this.sessionID = data;
                    this.getUserGoalsFromServer(this.sessionID);
                });
            });
        },

        login: function () {
            var data = "email=" + encodeURIComponent(this.userEmail);
            data += "&password=" + encodeURIComponent(this.userPassword);
            fetch(SERVER_URL + "/session", {
                method: "POST",
                body: data,
                credentials: "include",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then((response) => {
                if (response.status == 201) {
                    console.log("user signed in:", this.userEmail);
                    this.clearUserFields();
                    this.getSession();
                    this.notif = "signed in successfully";
                } else {
                    console.error("failed to login");
                    this.notif = "Incorrect email or password.";
                }
                this.displayNotif = true;
            });
        },

        logout: function() {
            fetch(SERVER_URL + "/session", {
                method: "DELETE",
                credentials: "include"
            }).then((response) => {
                this.display = this.displayLogin;
                this.notif = "logged out successfully";
                this.displayNotif = true;
            })
        },

        goLogin: function() {
            this.clearUserFields();
            this.display = this.displayLogin; 
        },

        //registration
        goRegister: function() {
            this.clearUserFields();
            this.display = this.displayRegister;
        },
        
        register: function () {
            var data = "username=" + encodeURIComponent(this.userUsername);
            data += "&email=" + encodeURIComponent(this.userEmail);
            data += "&first_name=" + encodeURIComponent(this.userFirst);
            data += "&last_name=" + encodeURIComponent(this.userLast);
            data += "&password=" + encodeURIComponent(this.userPassword);
            fetch(SERVER_URL + "/users", {
                method: "POST",
                body: data,
                credentials: "include",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then((response) => {
                if (response.status == 201) {
                    console.log("user registered:", this.userEmail);
                    const temp = this.userEmail;
                    this.clearUserFields();
                    this.userEmail = temp;
                    this.display = this.displayLogin;
                    this.notif = "registered! please sign in";
                } else {
                    console.error("failed to login");
                    this.notif = "user with email/username already exists.";
                }
                this.displayNotif = true;
            });
        },
        
        //server calls
        getGoalsFromServer: function () {
            var path = "/goals?condition=%";
            if(this.goalSearch){
                path += this.goalSearch + "%";
            }
            fetch(SERVER_URL + path, {
                credentials: "include"
            }).then((response) => {
                if(response.status == 401) {
                    console.log("not logged in");
                    this.display = this.displayLogin;
                    return
                }
                response.json().then((data) => {
                    console.log("loaded goals from server:", data);
                    this.goals = data;
                    for (goal of data) {
                        this.getSimilarUsers(goal.goal_id);
                    }
                })
            })
        },

        getUserGoalsFromServer: function (userID) {
            var path = "/users/" + userID + "/goals?condition=%";
            if(this.userGoalSearch){
                path += this.userGoalSearch + "%";
            }
            fetch(SERVER_URL + path, {
                credentials: "include"
            }).then((response) => {
                if(response.status == 401) {
                    console.log("not logged in")
                    this.display = this.displayLogin;
                    return
                }
                response.json().then((data) => {
                    console.log("loaded goals from server:", data);
                    this.userGoalIDs = [];
                    this.userGoals = [];
                    for (goal of data) {
                        goal.completeCount = 0;

                        var pair = { userID: userID, goal: goal }
                        this.userGoals.push(pair);
                        this.userGoalIDs.push(goal.goal_id);
                        if(this.goalStats[userID] == undefined) {
                            this.getStatsFromServer(userID, goal, 7, this.updateStats);
                        } else {
                            this.getStatsFromServer(userID, goal, 7);
                        }
                    }
                });
            });
        },

        getUsersFromServer: function () {
            var path = "/users?userID=" + this.sessionID + "&condition=%";
            if(this.userSearch) {
                path += this.userSearch + "%";
            }
            fetch(SERVER_URL + path, {
                credentials: "include"
            }).then((response) => {
                if(response.status == 401) {
                    this.notif = "not logged in";
                    this.displayNotif = true;
                    this.display = this.displayLogin;
                    return
                }   
                response.json().then((data) => {
                    this.users = data;
                });
            });
        },
        
        //home
        goHome: function () {
            this.expandedGoals = [];
            this.getUserGoalsFromServer(this.sessionID);
        },

        //social
        goSocial: function () {
            this.getUsersFromServer();
            this.getFollowersFromServer();
            this.getFollowingFromServer();
            this.display = this.displaySocial;
        },

        goFollowing: function () {
            this.getFollowingFromServer();
            this.display = this.displayFollowing;
        },
        
        goFollowers: function () {
            this.getFollowersFromServer();
            this.getFollowingFromServer();
            this.display = this.displayFollowers;
        },

        expandUser: function (user) {
            this.currentUser = user;
            this.getUserGoalsFromServer(user.user_id);
        },

        //goals
        goGoals: function () {
            this.getFollowingFromServer();
            this.getGoalsFromServer();
            this.display = this.displayGoals;
        },

        goCreateGoal: function () {
            this.display = this.displayCreateGoal;
        },

        expandGoal: function (userID,goal) {
            var pair = { userID: userID, goal: goal }
            this.expandedGoals.push(pair);
            this.getSimilarUsers(goal.goal_id);
            this.getStatsFromServer(userID,goal);
        },
        
        createAndAddGoal: function () {
            this.postGoalServer(this.addUserGoalServer);
            //this.addUserGoalServer(this.createdGoalId["lastID"]);
            this.goHome();
            //this.notifs.push("Successfully Set Goal! You can now see it on this page");
        },

        toggleStat: function(statOBJ,goal) {
            var stat;
            if (statOBJ.status == 1) {
                stat = 0;
                goal.completeCount -= 1;
            } else {
                stat = 1;
                goal.completeCount += 1;
            }
            this.replaceStatOnServer(statOBJ, stat);
        },

        updateStats: function(userID,goalID) {
            if (!this.goalStats[userID][goalID]) {
                return
            }
            //This code is here to find the length of the object indirectly
            const entriesArray = Object.entries(this.goalStats[userID][goalID]);
            const count = entriesArray.length; 
            var latest = this.goalStats[userID][goalID][count - 1];
            const d = new Date();
            var day = d.getDate();
            var month = d.getMonth();
            var year = d.getFullYear();
            while (day != latest.day || month != latest.month || year != latest.year) {
                this.postStatToServer(userID, goalID, day, month, year);
                day -= 1;
                if (day == 0) {
                    month -= 1;
                    if (month == -1) {
                        year -= 1;
                        month = 11;
                        }
                    if(month in [0, 2, 4, 6, 7, 9, 11]) {
                        day = 31;
                    } else if(month in [3, 5, 8, 10]) {
                        day = 30;
                    } else {
                        day = 28;
                        if (year % 4 == 0) {
                            day += 1;
                        }
                    }
                }
            }
        },

        postGoalServer: function (callback) {
            var data = "title=" + encodeURIComponent(this.goalTitle);
            data += "&description=" + encodeURIComponent(this.goalDescription);
            data += "&frequency=" + encodeURIComponent(this.goalFrequency);
            data += "&timeframe=" + encodeURIComponent(this.goalTimeframe);
            fetch(SERVER_URL + "/goals", {
                method: "POST",
                body: data,
                credentials: "include",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then((response) => {
                if (response.status != 201) {
                    console.log("failed at server to create goal");
                }
                response.json().then((data) => {
                    //this.notif = "goal created succesfully";
                    this.createdGoalId = data;
                    callback(data['lastID']);
                });
                
                //this.displayNotif = true;

            });

        },

        addUserGoalServer: function (goalID) {
            var data = "goalID=" + encodeURIComponent(goalID);
            fetch(SERVER_URL + "/users/" + this.sessionID + "/goals", {
                method: "POST",
                body: data,
                credentials: "include",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then((response) => {
                if (response.status == 201) {
                    console.log("set goal:", this.goalTitle);
                    this.clearGoalFields();
                    this.notif = "Set goal succesfully, you can now see it on your home page";
                    this.displayNotif = true;
                    this.userGoalIDs.push(goalID)
                    //populating stats for newly added goal
                    const d = new Date();
                    var day = d.getDate();
                    var month = d.getMonth();
                    var year = d.getFullYear();
                    this.postStatToServer(this.sessionID, goalID, day, month, year);
                    for (var i = 0; i < 7; i++) {
                        day -= 1;
                        if (day == 0) {
                            month -= 1;
                            if (month == -1) {
                                year -= 1;
                                month = 11;
                            }
                            if(month in [0, 2, 4, 6, 7, 9, 11]) {
                                day = 31;
                            } else if(month in [3, 5, 8, 10]) {
                                day = 30;
                            } else {
                                day = 28;
                                if (year % 4 == 0) {
                                    day += 1;
                                }
                            }
                        }
                        this.postStatToServer(this.sessionID, goalID, day, month, year);
                    }


                } else {
                    console.error("failed to add goal to user:", response.json());
                }
            });
        },

        removeUserGoalServer: function(goalID) {
            var path = "/users/" + this.sessionID + "/goals/" + goalID;
            fetch(SERVER_URL + path, {
                method: "DELETE",
                credentials: "include"
            }).then((response) => {
                if (response.status == 200) {
                    console.log("goal removed:", goalID);
                    /*delete this.userGoals[this.sessionID][goalID];
                    const index = this.userGoalIDs.indexOf(goalID);

                    const x = this.userGoalIDs.splice(index, 1);
                    console.log("goal popped from userGoalIDs:", x)
                    */
                    this.getUserGoalsFromServer(this.sessionID);
                } else {
                    console.log("failed to delete goal")
                }
            });
        },

        getStatsFromServer: function(userID, goal, limit, callback) {
            var path = "/users/" + userID + "/goals/" + goal.goal_id + "/stats";
            if (limit) {
                path += "?limit=" + limit;
            } else {
                path += "?limit=90";
            }
            fetch(SERVER_URL + path, {
                credentials: "include"
            }).then((response) => {
                if(response.status == 401) {
                    this.notifs.push("not logged in");
                    this.display = this.displayLogin;
                    return
                }   
                response.json().then((data) => {
                    if (this.goalStats[userID] == undefined) {
                        this.goalStats[userID] = {};
                    }
                    this.goalStats[userID][goal.goal_id] = data.reverse();
                    for (key in this.goalStats[userID][goal.goal_id]) {
                        stat = this.goalStats[userID][goal.goal_id][key];
                        const d = stat.day;
                        const m = stat.month;
                        const y = stat.year;
                        const date = new Date(y,m,d);
                        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                        this.goalStats[userID][goal.goal_id][key].weekday = days[date.getDay()];

                        if (stat.status == 1) {
                            goal.completeCount += 1;
                        }
                    }
                    if (callback) {
                        callback(userID,goal.goal_id);
                    }
                    if (this.display == this.displayGoals) {
                        
                    }
                    else if (userID == this.sessionID && limit == 7) {
                        this.display = this.displayMain;
                    } else if (userID != this.sessionID & limit == 7) {
                        this.display = this.displayOtherUserGoals;
                    } else {
                        this.display = this.displaySingleGoalStats;
                    }
                });
            }); 
        },

        postStatToServer: function(userID, goalID, day, month, year) {
            var data = "day=" + encodeURIComponent(day);
            data += "&month=" + encodeURIComponent(month);
            data += "&year=" + encodeURIComponent(year);
            data += "&stat=" + encodeURIComponent("0");
            fetch(SERVER_URL + "/users/" + userID + "/goals/" + goalID + "/stats" , {
                method: "POST",
                body: data,
                credentials: "include",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then((response) => {
                if (response.status == 201) {
                    console.log("stat created succesfully");
                    this.getStatsFromServer(userID,goalID,7)
                } else {
                    console.error("failed to create stat:", response.json());
                }
            });
             
        },
        
        replaceStatOnServer: function(statOBJ, stat) {
            var path = "/stats/" + statOBJ.stat_id;
            var data = "stat=" + encodeURIComponent(stat);
            fetch(SERVER_URL + path, {
                method: "PUT",
                body: data,
                credentials: "include",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then((response) => {
                if (response.status == 200) {
                    console.log("stat updated on server");
                    statOBJ.status = stat;
                } else {
                    console.error("failed to update stat:", response.json());
                }

            });
        },

        getSimilarUsers: function(goalID) {
            var path = "/goals/" + goalID + "/users";
            fetch(SERVER_URL + path, {
                credentials: "include"
            }).then((response) => {
                if (response.status == 401) {
                    this.notif = "Login Expired. Please sign in.";
                    this.displayNotif = true;
                    this.display = this.displayLogin; 
                } else {
                    response.json().then((data) => {
                        this.goalUsers[goalID] = data;
                    });
                }
            });
        },

        getFollowingFromServer: function() {
            var path = "/users/" + this.sessionID + "/followees";
            fetch(SERVER_URL + path, {
                credentials: "include"
            }).then((response) => {
                if(response.status == 401) {
                    this.notif = "Login Expired. Please sign in.";
                    this.displayNotif = true;
                    this.display = this.displayLogin;
                    return
                } else {  
                    response.json().then((data) => {
                        this.following = data;
                        this.followingIDs = [];
                        for (i in data) {
                            this.followingIDs.push(data[i].user_id)
                        }
                    });
                }
            });
        },
        
        getFollowersFromServer: function() {
            var path = "/users/" + this.sessionID + "/followers";
            fetch(SERVER_URL + path, {
                credentials: "include"
            }).then((response) => {
                if(response.status == 401) {
                    this.notifs = "Login Expired. Please sign in.";
                    this.displayNotif = true;
                    this.display = this.displayLogin;
                    return
                } else {  
                    response.json().then((data) => {
                        this.followers = data; 
                    });
                }
            });
        },

        followUserOnServer: function(user) {
            var path = "/users/" + this.sessionID + "/followees";
            var data = "followeeID=" + encodeURIComponent(user.user_id);
            fetch(SERVER_URL + path, {
                method: "POST",
                body: data,
                credentials: "include",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then((response) => {
                if (response.status == 201) {
                    console.log("user followed on server");
                    this.following.push(user)
                    this.getFollowingFromServer();
                } else {
                    console.error("failed to follow user:", response.json());
                }
            });
        },
        
        unfollowUserOnServer: function(user) {
            var path = "/users/" + this.sessionID + "/followees/" + user.user_id;
            fetch(SERVER_URL + path, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then((response) => {
                if (response.status == 200) {
                    console.log("user unfollowed on server");
                    this.following.push(user)
                    
                    //this snippet removes instantly from dom before updating from server
                    var index = this.following.indexOf(user);
                    if (index !== -1) {
                        this.following.splice(index, 1);
                    }
                    //

                    this.getFollowingFromServer();
                } else {
                    console.error("failed to unfollow user:", response.json());
                }
            });
        },
        
        removeFollowerOnServer: function(user) {
            var path = "/users/" + this.sessionID + "/followers/" + user.user_id;
            fetch(SERVER_URL + path, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then((response) => {
                if (response.status == 200) {
                    console.log("user followed on server");
                    
                    var index = this.followers.indexOf(user);
                    if (index !== -1) {
                        this.followers.splice(index, 1);
                    }
                    this.getFollowersFromServer();

                } else {
                    console.error("failed to remove follower:", response.json());
                }
            });
        },
        
        
        //notifs
        removeNotif: function() {
            this.displayNotif = false;
        }


    },

    created: function () {
        this.getSession();
    }

}).mount("#app");

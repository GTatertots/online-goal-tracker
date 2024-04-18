const SERVER_URL = "http://localhost:8080";

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
            displayNotifs: false,
            notifs: []
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
                    console.log(this.sessionID);
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
                    this.display = this.displayMain;
                    this.notifs.push("signed in successfully");
                } else {
                    console.error("failed to login");
                    this.notifs.push("Incorrect email or password.");
                }
                this.displayNotifs = true;
            });
        },

        logout: function() {
            fetch(SERVER_URL + "/session", {
                method: "DELETE",
                credentials: "include"
            }).then((response) => {
                this.display = this.displayLogin;
                this.notifs.push("logged out successfully");
                this.displayNotifs = true;
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
                    this.notifs.push("registered! please sign in");
                } else {
                    console.error("failed to login");
                    this.notifs.push("user with email/username already exists.");
                }
                this.displayNotifs = true;
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
                    this.userGoals = data;
                    this.userGoalIDs = [];
                    for (goal of data) {
                        this.userGoalIDs.push(goal.goal_id);
                        console.log(this.goalStats[goal.goal_id])
                        if(this.goalStats[goal.goal_id] == undefined) {
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
                    this.notifs.push("not logged in");
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
            this.getUserGoalsFromServer(this.sessionID);
            this.display = this.displayMain;
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
            this.display = this.displayOtherUserGoals
        },

        //goals
        goGoals: function () {
            this.getGoalsFromServer();
            this.display = this.displayGoals;
        },

        goCreateGoal: function () {
            this.display = this.displayCreateGoal;
        },

        expandGoal: function (goal) {
            console.log(goal.goal_id);
            this.expandedGoals.push(goal);
            console.log("expandedGoals:",this.expandedGoals)
            this.display = this.displaySingleGoalStats;
            this.getStatsFromServer(this.sessionID,goal);
        },
        
        createAndAddGoal: function () {
            this.postGoalServer(this.addUserGoalServer);
            //this.addUserGoalServer(this.createdGoalId["lastID"]);
            //this.goHome();
            //this.notifs.push("Successfully Set Goal! You can now see it on this page");
        },

        toggleStat: function(statOBJ) {
            console.log(statOBJ);
            var stat;
            if (statOBJ.status == 1) {
                stat = 0;
            } else {
                stat = 1;
            }
            this.replaceStatOnServer(statOBJ, stat);
        },

        updateStats: function(userID,goalID) {
            console.log(this.goalStats)
            var latest = this.goalStats[goalID][this.goalStats[goalID].length - 1];
            console.log(latest.year, latest.month, latest.day);
            const d = new Date();
            var day = d.getDate();
            var month = d.getMonth();
            var year = d.getFullYear();
            while (day != latest.day || month != latest.month || year != latest.year) {
                this.postStatToServer(goalID, day, month, year);
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
                    //this.notifs.push("goal created succesfully");
                    console.log(data)
                    this.createdGoalId = data;
                    callback(data['lastID']);
                });
                
                this.displayNotifs = true;

            });

        },

        addUserGoalServer: function (goalID) {
            console.log(goalID);
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
                    this.notifs.push("Set goal succesfully!");

                    //populating stats for newly added goal
                    const d = new Date();
                    var day = d.getDate();
                    var month = d.getMonth();
                    var year = d.getFullYear();
                    this.postStatToServer(goalID, day, month, year);
                    for (var i = 0; i < 14; i++) {
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
                        this.postStatToServer(goalID, day, month, year);
                    }


                } else {
                    console.error("failed to add goal to user:", response.json());
                }
                this.goHome();
            });
        },

        getStatsFromServer: function(userID, goal, limit, callback) {
            console.log("getStats called with:", userID, goal.goal_id)
            var path = "/users/" + userID + "/goals/" + goal.goal_id + "/stats";
            if (limit) {
                path += "?limit=" + limit;
            } else {
                path += "?limit=" + "90";
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
                    this.goalStats[goal.goal_id] = data.reverse();
                    goal.completeCount = 0;
                    for (i in this.goalStats[goal.goal_id]) {
                        stat = this.goalStats[goal.goal_id][i];
                        const d = stat.day;
                        const m = stat.month;
                        const y = stat.year;
                        const date = new Date(y,m,d);
                        //console.log(date);
                        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                        this.goalStats[goal.goal_id][i].weekday = days[date.getDay()];
                        
                        if (stat.status == 1) {
                            goal.completeCount += 1;
                        }
                    }
                    callback(userID,goal.goal_id);
                });
            }); 
        },

        postStatToServer: function(goalID, day, month, year) {
            var data = "day=" + encodeURIComponent(day);
            data += "&month=" + encodeURIComponent(month);
            data += "&year=" + encodeURIComponent(year);
            data += "&stat=" + encodeURIComponent("0");
            fetch(SERVER_URL + "/users/" + this.sessionID + "/goals/" + goalID + "/stats" , {
                method: "POST",
                body: data,
                credentials: "include",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then((response) => {
                if (response.status == 201) {
                    console.log("stat created succesfully");
                } else {
                    console.error("failed to create stat:", response.json());
                }
            });
             
        },
        
        replaceStatOnServer: function(statOBJ, stat) {
            console.log(statOBJ);
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
                    console.log("stat before:", statOBJ.status);
                    statOBJ.status = stat;
                    console.log("stat after:", statOBJ.status);
                } else {
                    console.error("failed to update stat:", response.json());
                }

            });
        },

        getFollowingFromServer: function() {
            var path = "/users/" + this.sessionID + "/followees";
            fetch(SERVER_URL + path, {
                credentials: "include"
            }).then((response) => {
                if(response.status == 401) {
                    this.notifs.push("not logged in");
                    this.display = this.displayLogin;
                    return
                } else {  
                    response.json().then((data) => {
                        this.following = data;
                        this.followingIDs = [];
                        for (i in data) {
                            this.followingIDs.push(data[i].user_id)
                        }
                        console.log("following[0]:", this.following[0]);
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
                    this.notifs.push("not logged in");
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
        clearNotifs: function() {
            this.displayNotifs = false;
            this.notifs = [];
        },

        removeNotif: function(i) {
            this.notifs.splice(i, 1);
            if(this.notifs.length == 0) {
                this.displayNotifs = false;
            }
        },


    },

    created: function () {
        this.getSession();
    }

}).mount("#app");

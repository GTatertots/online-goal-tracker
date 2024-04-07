const SERVER_URL = "http://localhost:8080";

Vue.createApp({
    data: function () {
        return {
            //session user
            sessionID: '',

            //user
            userUsername: "",
            userPassword: "",
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
            
            goalStats: {},

            //expanded goal(s)
            expandedGoals: [],
            stats: [],

            //users
            userSearch: "",
            users: [],

            //displays
            displayLogin: 0,
            displayMain: 1,
            displaySocial: 2,
            displayGoals: 3,
            displayCreateGoal: 4,
            displayRegister: 5,
            displaySingleGoalStats: 6,

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
        },

        clearGoalFields: function () {
            this.goalTitle = "";
            this.goalDescription = "";
            this.goalFrequency = "";
            this.goalTimeframe = "";
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
                    this.clearUserFields();
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
                    for (goal of data) {
                        this.getStatsFromServer(userID, goal.goal_id, 7);
                    }
                });
            });
        },

        getUsersFromServer: function () {
            var path = "/users?condition=%";
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
            this.display = this.displaySocial;
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
            this.expandedGoals.push(goal.goal_id);
            console.log(this.expandedGoals)
            //this.display = this.displaySingleGoalStats;
            this.getStatsFromServer(this.sessionID,goal.goal_id);
        },
        
        createAndAddGoal: function () {
            this.postGoalServer(this.addUserGoalServer);
            //this.addUserGoalServer(this.createdGoalId["lastID"]);
            //this.goHome();
            this.notifs.push("Successfully Set Goal! You can now see it on this page");
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
                    this.notifs.push("goal created succesfully");
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

        getStatsFromServer: function(userID, goalID, limit) {
            console.log("getStats called with:", userID, goalID)
            var path = "/users/" + userID + "/goals/" + goalID + "/stats";
            if (limit) {
                path += "?limit=" + limit;
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
                    this.goalStats[goalID] = data;
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

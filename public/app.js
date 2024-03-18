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
            goalSearch: "",
            goals: [],

            //users
            userSearch: "",
            users: [],

            //displays
            displayLogin: 0,
            displayMain: 1,
            displaySocial: 2,
            displayGoals: 3,
            displayRegister: 4,

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
        getUserGoalsFromServer: function (userID) {
            var path = "/users/" + userID + "/goals?condition=%";
            if(this.goalSearch){
                path += this.goalSearch + "%";
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
                    this.goals = data;
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
            this.display = this.displayGoals;
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

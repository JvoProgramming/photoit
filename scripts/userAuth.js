var userStateBtn;
var mobileUserStateBtn;
var loggedIn;

window.onload = function () {
    userStateBtn = document.getElementById("userStateBtn");
    mobileUserStateBtn = document.getElementById("mobileUserStateBtn");
    getUserAuthentication();
};

function getUserAuthentication() {
    var xhttp = new XMLHttpRequest();
    xhttp.open(
        "GET",
        "https://server-snowy-smoke-8305.fly.dev/GetUserAuthentication",
        true
    );
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send();

    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // call is complete and call is successful

            var result = this.response;

            if (result) {
                console.log("user signed in");
                userStateBtn.innerHTML = "Sign Out";
                mobileUserStateBtn.innerHTML = "Sign Out";
                loggedIn = true;
            } else {
                console.log("user not signed in");
                userStateBtn.innerHTML = "Login";
                mobileUserStateBtn.innerHTML = "Login";
                loggedIn = false;
            }
        }
    };
}

function userState() {
    if (loggedIn) {
        userStateBtn.innerHTML = "Login";
        mobileUserStateBtn.innerHTML = "Login";
        // sign out the user
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", "https://server-snowy-smoke-8305.fly.dev/SignOut", true);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send();

        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                // call is complete and call is successful
                var result = this.response;
                if (result == "true") {
                    console.log("user signed out successfully");
                    loggedIn = false;
                } else {
                    console.log("user sign out failed");
                }
            }
        };
    } else {
        window.location.href = "../views/login.html";
    }
}

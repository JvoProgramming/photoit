var userStateBtn;
var mobileUserStateBtn;
var loggedIn;

window.onload = function () {
    userStateBtn = document.getElementById("userStateBtn");
    mobileUserStateBtn = document.getElementById("mobileUserStateBtn");

    // check if there is a parameter in the url. If so, we are visiting another user's profile
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const username = urlParams.get("user");

    if (username == null) {
        getUserAuthentication();
    } else {
        getUserID(username);
    }
};

const firebaseConfig = {
    apiKey: "AIzaSyD0xEM1KZAsjST9GwQs1sxBu2zhGXHOfDk",
    authDomain: "photoit-jvo.firebaseapp.com",
    databaseURL: "https://photoit-jvo-default-rtdb.firebaseio.com",
    projectId: "photoit-jvo",
    storageBucket: "photoit-jvo.firebasestorage.app",
    messagingSenderId: "136578612415",
    appId: "1:136578612415:web:1a3762ca08598ab8d65a0a",
    measurementId: "G-LF8C9QZZ61"
  };

firebase.initializeApp(firebaseConfig);

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

            var user_infoDiv = document.getElementById("user_info");

            if (result) {
                console.log("user signed in");
                user_infoDiv.style.display = "flex";
                userStateBtn.innerHTML = "Sign Out";
                mobileUserStateBtn.innerHTML = "Sign Out";
                loggedIn = true;

                getUserInfo(result);
            } else {
                console.log("user not signed in");
                userStateBtn.innerHTML = "Login";
                mobileUserStateBtn.innerHTML = "Login";
                loggedIn = false;

                user_infoDiv.innerHTML =
                    '<p style="text-align: center"> Must be signed in to view profile! </p>';
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
                    location.reload();
                } else {
                    console.log("user sign out failed");
                }
            }
        };
    } else {
        window.location.href = "../views/login.html";
    }
}

function chooseFile(e) {
    console.log("file is chosen");
    var file = {};
    file = e.target.files[0];

    var reader = new FileReader();

    reader.onload = function (e) {
        $("#profilePic").attr("src", e.target.result).width(175).height(175);
    };

    reader.readAsDataURL(file);

    uploadPicture(file);
}

function uploadPicture(file) {
    console.log("uploading picture");
    var postStorageID = create_UUID();
    var storageRef = firebase.storage().ref("profilePhotos/" + postStorageID);

    storageRef
        .put(file)
        .then(function () {
            console.log("upload successful");

            // uploaded, get URL
            firebase
                .storage()
                .ref("profilePhotos/" + postStorageID)
                .getDownloadURL()
                .then((imgUrl) => {
                    //add url to firebase db
                    postChangeAvatar(imgUrl);
                });
        })
        .catch((error) => {
            console.log("upload failed");
            console.log("Error: " + error);
        });
}

function getUserID(userUsername) {
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // call is complete and call is successful

            var result = this.response;

            var user_infoDiv = document.getElementById("user_info");

            getUserInfo(result);
        }
    };

    var params = "?username=" + userUsername;

    xhttp.open(
        "GET",
        "https://server-snowy-smoke-8305.fly.dev/GetUserID" + params,
        true
    );
    xhttp.setRequestHeader("Content-Type", "application/json");

    xhttp.send();
}

function getUserInfo(userIDUser) {
    var xhttp = new XMLHttpRequest();
    xhttp.responseType = "json";

    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // call is complete and call is successful
            var result = this.response;
            var profilePic = document.getElementById("photoBtn");
            var userName = document.getElementById("user_name");
            var numLikes = document.getElementById("num_likes");
            var awards = document.getElementById("awards");

            profilePic.style.backgroundImage =
                "url('" + result.ProfilePic + "')";
            userName.innerHTML += result.Username;
            numLikes.innerHTML += result.AppreciationPoints;

            if (result.awards != null) {
                awards.innerHTML += result.awards;
            }

            getUsersPosts(result.Username);
        }
    };

    var params = "?userID=" + userIDUser;

    xhttp.open(
        "GET",
        "https://server-snowy-smoke-8305.fly.dev/GetUserInfo" + params,
        true
    );
    xhttp.setRequestHeader("Content-Type", "application/json");

    xhttp.send();
}

function getUsersPosts(usernameUser) {
    var xhttp = new XMLHttpRequest();
    xhttp.responseType = "json";
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // call is complete and call is successful
            var result = this.response;

            if (result == null) {
                console.log("no posts exists");
            } else {
                console.log("posts exists");
                var picturesID = Object.keys(this.response);
                var pictures = Object.values(this.response);

                var container = document.getElementById("container");
                container.innerHTML = "";
                var numPhotos = document.getElementById("num_photos");
                numPhotos.innerHTML =
                    "Number of Photos: " + pictures.length.toString();
                var picHostedLink;
                var picTitle;
                var postID;
                for (let i = 0; i < pictures.length; i++) {
                    picHostedLink = pictures[i].ImageURL;
                    picTitle = pictures[i].Caption;
                    postID = picturesID[i];
                    container.innerHTML +=
                        '<div class="box">' +
                        '<form action="../views/photo.html">' +
                        '<input type="hidden" name="postID" value="' +
                        postID +
                        '"/>' +
                        '<button class="btn" type="submit" id="categoryButton">' +
                        '<div class="imgBox">' +
                        '<img src="' +
                        picHostedLink +
                        '">' +
                        "</div>" +
                        '<div class="content">' +
                        "<h2>" +
                        picTitle +
                        "</h2>" +
                        "</div>" +
                        "</button>" +
                        "</form>";
                }
            }
        }
    };
    var params = "?username=" + usernameUser;
    xhttp.open(
        "GET",
        "https://server-snowy-smoke-8305.fly.dev/GetUsersPosts" + params,
        true
    );
    xhttp.setRequestHeader("Content-Type", "application/json");

    xhttp.send();
}

function create_UUID() {
    var dt = new Date().getTime();
    var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
            var r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
        }
    );
    return uuid;
}

function postChangeAvatar(imageURLUser) {
    console.log("entered postChangeAvatar()");
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // call is complete and call is successful
            var result = this.response;
            if (result == null) {
                console.log("Change avatar unsuccessful");
            } else {
                console.log("Change avatar successful");
            }
        }
    };
    xhttp.open("POST", "https://server-snowy-smoke-8305.fly.dev/PostUserAvatar", true);
    xhttp.setRequestHeader("Content-Type", "application/json");

    var data = { imageURL: imageURLUser };
    xhttp.send(JSON.stringify(data));
}

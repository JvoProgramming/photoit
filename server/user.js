// firebase
var firebase = require('firebase/app');
  require('firebase/auth');
  require('firebase/database');

///////////////////////////////////////////////////////////////////////// get functions

function getMostLike(request, response){

  firebase.database().ref("Users").once('value', function(snapshot){
    if (snapshot.numChildren() >= 1) 
    {
      var result = snapshot.val(); 
      // result = sorting.sortByProperty([result], 'attributes.AppreciatedPoint', -1);

      response.send(result);
    }

    else 
    {
      console.log("getMostLike() - found no user"); 
      response.send(); 
    }
  }); 

}

function getUserInfo(request, response){

  var userID = request.query.userID;

  var refUser = firebase.database().ref('Users/' + userID);

  refUser.once('value', function(snapshot){

    const obj = snapshot.val();
    response.send(obj);

  });

}

function getUserID(request, response) {


  var username = request.query.username;

  console.log("\n\nUsername = " + username + "\n\n")
  var userIDQuery = firebase.database().ref("Users").orderByChild("Username").equalTo(username).limitToLast(1);

  userIDQuery.once('value', function(snapshot) {

    if (snapshot.numChildren() >= 1) {

      response.send(Object.keys(snapshot.val())[0]);
    
    }
    else {
    
      response.send(null);
    
    }

  });

}

function getUsername(request, response){

  var unsubscribe = firebase.auth().onAuthStateChanged(function(user) {

    if (user) {
      var userID = firebase.auth().currentUser.uid;

      var target = 'Users/' + userID; 
      var ref = firebase.database().ref(target);

      ref.once('value', function(snapshot){
        const username = snapshot.val().Username;
        response.send(username);
      });

    } else {
      // No user is signed in.
      console.log("user not signed in");
      response.send(null);
    }
  });

  unsubscribe();

}

function getUserAuthentication(request, response){

  var unsubscribe = firebase.auth().onAuthStateChanged( function(user) {
    if (user) {
      // User is signed in.
      console.log("user signed in");
      var uid = firebase.auth().currentUser.uid;
      response.send(uid);
    } else {
      // No user is signed in.
      console.log("user not signed in");
      response.send(null);
    }
  });

  unsubscribe();

}

/////////////////////////////////////////////////////////////////////////// post functions

function postRegister(request, response){

    var email = request.body.email;
    var password = request.body.password;
    var ref = firebase.database().ref('Users'); //.ref(target); 
    var username = request.body.username; 
    ref.orderByChild("Username").equalTo(username).once("value", function(snapshot){
      if (snapshot.numChildren() >= 1)
      {
          // duplicate username
          response.send("Username already exists.");
      }
      else 
      {
          firebase.auth().createUserWithEmailAndPassword(email, password)
          .then((userCredential) => {
            // Signed in 
            var rootRef = firebase.database().ref();
            var userRef = rootRef.child('Users/' + firebase.auth().currentUser.uid);
            userRef.set({
              Username: username,
              ProfilePic: "https://firebasestorage.googleapis.com/v0/b/photoit110.appspot.com/o/profilePhotos%2FdefaultProfilePhoto.png?alt=media&token=3a7c1bcd-7e36-404f-b7b8-3438549c4885", 
              AppreciationPoints: 0
            });
            console.log("create user successful");
            response.send("Successful");
          })
          .catch((error) => {
            console.log("Error " + error.code + ": " + error.message + ".\n");
            response.send(error.message);
          });
      }
    }); 
}

function postLogin(request, response){

  var email = request.body.email;
  var password = request.body.password;

  firebase.auth().signInWithEmailAndPassword(email, password)
  .then((userCredential) => {
    console.log("login successful");
    response.send("Successful");
  })
  .catch((error) => {
    console.log("Error " + error.code + ": " + error.message + ".\n");
    response.send(error.message);
  });

}

function postSignOut(request, response){

  firebase.auth().signOut().then(() => {
    // Sign-out successful.
    console.log("user signed out successfully");
    response.send("true");
  }).catch((error) => {
    // An error happened.
    console.log("user sign out failed");
    response.send("false");
  });

}

function postUserAvatar(request, response){
  console.log("postuseravatar function");
  var userID = firebase.auth().currentUser.uid;
  var ref = firebase.database().ref('Users/' + userID);
  var username;

  ref.once("value", function(snapshot) {
    ref.update({
      ProfilePic: request.body.imageURL
    }, function(error){
      if (error) {
       console.error(error)
       console.log('Update avatar unsuccessful');
       response.send(null);
      }
      else {
        console.log('Update avatar successful');
      }
    });
  });
}

///////////////////////////////////////////////////////////////////////// helper functions

function searchDataBase(request, response) {
  var query = request.query.username; 
  var ref = firebase.database().ref('Users'); //.ref(target); 
  ref.orderByChild("Username").equalTo(query).once("value", function(snapshot){

    const obj = snapshot.val();

    if (snapshot.numChildren() >= 1) {
      console.log(obj);
      response.send(obj);
    }
    else {
      console.log("no user found")
      response.send(obj);
    }

  })
}

module.exports = {
  getMostLike,
  getUserInfo,
  getUserID,
  getUsername,
  getUserAuthentication,
  postRegister,
  postLogin,
  postSignOut,
  postUserAvatar,
  searchDataBase,
};
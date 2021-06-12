// firebase
var firebase = require('firebase/app');
  require('firebase/auth');
  require('firebase/database');

const sorting = require('../sorting.js');

//////////////////////////////////////////////////////////////////////// get functions
function getPost(request, response){

  var postID = request.query.postID;
  console.log("postID = " + postID);


  var postDB = firebase.database().ref('Posts/' + postID);

  postDB.once('value', (snapshot) => {

    if (snapshot.numChildren() >= 1) {
      console.log("post found");
      response.send(snapshot.val());
    }
    else {
      console.log("getPost() - post not found");
      response.send("not found");
    }

  }, (errorObject) => {

    console.log('The read failed: ' + errorObject.name);
    response.send("unsuccessful");

  }); 

}

function getUsersPosts(request, response){

  var userName = request.query.userName;

  var queryUsersPosts = firebase.database().ref("Posts").orderByChild("userName").equalTo(userName);

  queryUsersPosts.once('value', function(snapshot) {

    if (snapshot.numChildren() >= 1) {
      response.send(snapshot.val());
    }
    else {
      response.send("empty");
    }

  });

}

function getCategoryPosts(request, response){

  var category = request.query.category;
  var filter = request.query.filter;

  var filterTime = 0;
  var currentDate = Date.now();

  if (filter == "hour") {
    filterTime = currentDate - 3600000;
  }
  else if (filter == "day") {
    filterTime = currentDate - 86400000;
  }
  else if (filter == "week") {
    filterTime = currentDate - 604800000;
  }
  else if (filter == "month") {
    filterTime = currentDate - 2592000000;
  }
  else if (filter == "year") {
    filterTime = currentDate - 31556952000;
  }
  else {
    console.log("Error: getCategoryPosts() - incorrect function call");
    response.send("unsuccessful");
  }

  var queryUsersPosts = firebase.database().ref("Posts").orderByChild("category").equalTo(category);

  queryUsersPosts.once('value', function(snapshot) {

    if (snapshot.numChildren() >= 1) {

      var filteredJSON = snapshot.val();

      for (var key in filteredJSON) {
        if (filteredJSON.hasOwnProperty(key)) {

          if (filteredJSON[key].date < filterTime) {
            delete filteredJSON[key];
          }

        }
      }
      
      filteredJSON = sorting.sortByProperty([filteredJSON], 'attributes.likes', -1);

      console.log("getCategoryPosts() - found posts");
      response.send(filteredJSON);

    }
    else {
      
      console.log("getCategoryPosts() - found no posts");
      response.send(snapshot.val());

    }

  });

}

//////////////////////////////////////////////////////////////////////////// posts functions
function postCreatePost(request, response){
  console.log("Create Post");
  var postsDB =  firebase.database().ref('Posts/');
  var userID = firebase.auth().currentUser.uid;
  var ref = firebase.database().ref('Users/' + userID); //.ref(target); 
  var userName; 
  ref.once("value", function(snapshot){
    userName = snapshot.val().UserName; 
    postsDB.push().set({
      userName: userName,
      imageURL: request.body.imageURL,
      category: request.body.category,
      caption: request.body.caption,
      date: Date.now(),
      likes: '0'
    });

  response.send("successful");
  }); 
}

// function postLike(request, response){
//   firebase.auth().onAuthStateChanged(function(user) {

//     if (user) {

//         // get userName  
//         var userID = firebase.auth().currentUser.uid;
//         var refUser = firebase.database().ref('Users/' + userID);

//         refUser.once('value', function(snapshot){
//           var userName = snapshot.val().UserName;

//           var tempPostID = request.body.postID; 
//           var refLikedByUser = firebase.database().ref('Posts/' + tempPostID + "/likedBy/" + userName);

//           // check if liked
//           refLikedByUser.once('value', function(snapshot){

//             if (snapshot.numChildren() >= 1) { // if is liked
//               var postID = request.body.postID;

//               // get old likes
//               var likesDB = firebase.database().ref('Posts/' + postID + "/likes");

//               likesDB.once('value', (snapshot) => {

//                 var oldLikes = parseInt(snapshot.val());

//                 var newLikes = oldLikes - 1; // add like

//                 // post new likes
//                 var updateData = {
//                   likes: newLikes
//                 };

//                 var postDB = firebase.database().ref('Posts/' + postID);
//                 postDB.update(updateData);
//                 response.send(newLikes.toString());

//                 var refLikedBy = firebase.database().ref('Posts/' + postID + "/likedBy");

//                 refLikedBy.child(userName).remove();     

//               }, (errorObject) => {

//                 console.log('The read failed: ' + errorObject.name);

//               });

//             }
//             else { // if is not liked
//               var postID = request.body.postID;

//               // get old likes
//               var likesDB = firebase.database().ref('Posts/' + postID + "/likes");

//               likesDB.once('value', (snapshot) => {

//                 var oldLikes = parseInt(snapshot.val());

//                 var newLikes = oldLikes + 1; // add like

//                 // post new likes
//                 var updateData = {
//                   likes: newLikes
//                 };

//                 var postDB = firebase.database().ref('Posts/' + postID);
//                 postDB.update(updateData);
//                 response.send(newLikes.toString());

//                 var refLikedBy = firebase.database().ref('Posts/' + postID + "/likedBy");

//                 refLikedBy.child(userName).set({
//                   liked: ""
//                 });

//               }, (errorObject) => {

//                 console.log('The read failed: ' + errorObject.name);

//               });
      
//             }

//           });

            
//         });

//     } else {
//       // No user is signed in.
//       console.log("user not signed in");
//       response.send(null);
//     }
//   });

// }

function postLike(request, response){
  firebase.auth().onAuthStateChanged(function(user) {

    if (user) {

        // get userName  
        var userID = firebase.auth().currentUser.uid;
        var refUser = firebase.database().ref('Users/' + userID);

        refUser.once('value', function(snapshot){
          var userName = snapshot.val().UserName;

          var tempPostID = request.body.postID; 
          var refLikedByUser = firebase.database().ref('Posts/' + tempPostID + "/likedBy/" + userName);

          // check if liked
          refLikedByUser.once('value', function(snapshot){

            if (snapshot.numChildren() >= 1) { // if is liked
              var postID = request.body.postID;

              // get old likes
              var likesDB = firebase.database().ref('Posts/' + postID + "/likes");

              likesDB.once('value', (snapshot) => {

                var oldLikes = parseInt(snapshot.val());

                var newLikes = oldLikes - 1; // add like

                // post new likes
                var updateData = {
                  likes: newLikes
                };

                var postDB = firebase.database().ref('Posts/' + postID);
                postDB.update(updateData);
                response.send(newLikes.toString());

                var refLikedBy = firebase.database().ref('Posts/' + postID + "/likedBy");

                refLikedBy.child(userName).remove();                

              }, (errorObject) => {

                console.log('The read failed: ' + errorObject.name);

              });

            }
            else { // if is not liked
              var postID = request.body.postID;

              // get old likes
              var likesDB = firebase.database().ref('Posts/' + postID + "/likes");

              likesDB.once('value', (snapshot) => {

                var oldLikes = parseInt(snapshot.val());

                var newLikes = oldLikes + 1; // add like

                // post new likes
                var updateData = {
                  likes: newLikes
                };

                var postDB = firebase.database().ref('Posts/' + postID);
                postDB.update(updateData);
                response.send(newLikes.toString());

                var refLikedBy = firebase.database().ref('Posts/' + postID + "/likedBy");

                refLikedBy.child(userName).set({
                  liked: ""
                });

              }, (errorObject) => {

                console.log('The read failed: ' + errorObject.name);

              });
      
            }

          });

            
        });

    } else {
      // No user is signed in.
      console.log("user not signed in");
      response.send(null);
    }
  });

}

// export modules
module.exports = {
  getPost,
  getUsersPosts,
  getCategoryPosts,
  postCreatePost,
  postLike
};
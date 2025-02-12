// import dependencies
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
var cors = require('cors')
require('dotenv').config();

// firebase
var firebase = require('firebase/app');
  require('firebase/auth');
  require('firebase/database');

firebase.initializeApp({
  apiKey: "AIzaSyD0xEM1KZAsjST9GwQs1sxBu2zhGXHOfDk",
  authDomain: "photoit-jvo.firebaseapp.com",
  databaseURL: "https://photoit-jvo-default-rtdb.firebaseio.com",
  projectId: "photoit-jvo",
  storageBucket: "photoit-jvo.firebasestorage.app",
  messagingSenderId: "136578612415",
  appId: "1:136578612415:web:1a3762ca08598ab8d65a0a",
  measurementId: "G-LF8C9QZZ61"
});

// create server
const app = express();
const port = process.env.PORT || 8080;

// add stuff to server
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../')));
app.use(cors());

// import handlers
const redirectHandler = require('./redirect.js');
const postsHandler = require('./posts.js');
const userHandler = require('./user.js');
const commentHandler = require('./comments.js');

//redirect
app.get('/', redirectHandler.getHome);


// get handlers
app.get('/GetPost', postsHandler.getPost);
app.get('/GetUsersPosts', postsHandler.getUsersPosts);
app.get('/GetCategoryPosts', postsHandler.getCategoryPosts);
app.get('/GetUserAuthentication', userHandler.getUserAuthentication);
app.get('/GetUserInfo', userHandler.getUserInfo);
app.get('/GetUserID', userHandler.getUserID);
app.get('/GetUsername', userHandler.getUsername);
app.get('/getMostLike', userHandler.getMostLike);
app.get('/getComments', commentHandler.getComments);
app.get('/searchDataBase', userHandler.searchDataBase); 

// post handlers
app.post('/CreatePost', postsHandler.postCreatePost);
app.post('/PostRegister', userHandler.postRegister);
app.post('/PostLogin', userHandler.postLogin);
app.post('/SignOut', userHandler.postSignOut);
app.post('/postComments', commentHandler.postComments);
app.post('/PostLike', postsHandler.postLike);
app.post('/PostUserAvatar', userHandler.postUserAvatar);

// start listening on server
app.listen(3000, () => console.log(`Server listening on http://localhost:${port}`));
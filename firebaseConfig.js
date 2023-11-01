// firebaseConfig.js
const firebase = require("firebase/app");
require("firebase/database");

const config = {
  apiKey: "AIzaSyDMsq7pz55UD6HPJogZaUQ_qTy09xzMyzY",
  authDomain: "milho-c89cb.firebaseapp.com",
  projectId: "milho-c89cb",
  storageBucket: "milho-c89cb.appspot.com",
  messagingSenderId: "213770553121",
  appId: "1:213770553121:web:922a76da26d988d947e060",
  measurementId: "G-EVZWZCRK7V"
};

firebase.initializeApp(config);

const database = firebase.database();

module.exports = database;

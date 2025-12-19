// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAwo1gaDW94XSxy2Ut3_G_nj5fCIb3d0oY",
  authDomain: "smartwallet-10702.firebaseapp.com",
  databaseURL: "https://smartwallet-10702-default-rtdb.firebaseio.com",
  projectId: "smartwallet-10702",
  storageBucket: "smartwallet-10702.appspot.com",
  messagingSenderId: "82577266544",
  appId: "1:82577266544:web:8dc16650691408d25ee1b5",
  measurementId: "G-GZCZ2NVPP8"
};

// Initialize Firebase once
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Anonymous login
firebase.auth().signInAnonymously().catch(err => console.error(err));

// Firebase Database reference
const db = firebase.database();

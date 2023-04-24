import './style.css';

import { initializeApp } from "firebase/app";
import { getFirestore, doc, collection, setDoc, addDoc, getDoc, updateDoc, onSnapshot, query, where } from "firebase/firestore";

// Create this file...
import * as firebaseConfig from './firebaseConfig.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

// Global State
const pc = new RTCPeerConnection(servers);
let localStream = null;
let remoteStream = null;

// HTML elements
const webcamVideo = document.getElementById('webcamVideo');
const answerButton = document.getElementById('answerButton');
const remoteVideo = document.getElementById('remoteVideo');
const hangupButton = document.getElementById('hangupButton');
const listElem = document.getElementById('list');
const snackbar = document.getElementById("snackbar");
const eventsList = document.getElementById('eventsList');
const callElements = document.getElementById("callElements");

function timeConverter (UNIX_timestamp) {
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes() < 10 ? '0' + a.getMinutes() : a.getMinutes();
  var sec = a.getSeconds() < 10 ? '0' + a.getSeconds() : a.getSeconds();
  var time = date + ' ' + month + ' ' + hour + ':' + min + ':' + sec;
  return time;
}
// 1. Setup media sources

async function answer () {
  console.log("answering call!");
  eventsList.style.display = "none";
  callElements.style.display = "block";



  connectToCall();
}


// 3. Answer the call with the unique ID
async function connectToCall () {
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  remoteStream = new MediaStream();

  // Push tracks from local stream to peer connection
  localStream.getTracks().forEach((track) => {
    pc.addTrack(track, localStream);
  });

  // Pull tracks from remote stream, add to video stream
  pc.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };

  webcamVideo.srcObject = localStream;
  webcamVideo.muted = true;

  remoteVideo.srcObject = remoteStream;

  // answerButton.disabled = false;

  // const callId = callInput.value;
  const callId = "room";
  // const callDoc = db.collection('calls').doc(callId);
  const callDoc = doc(db, 'calls', callId);

  // const answerCandidates = callDoc.collection('answerCandidates');
  // const offerCandidates = callDoc.collection('offerCandidates');
  const offerCandidates = collection(callDoc, 'offerCandidates');
  const answerCandidates = collection(callDoc, 'answerCandidates');

  pc.onicecandidate = (event) => {
    // event.candidate && answerCandidates.add(event.candidate.toJSON());
    event.candidate && addDoc(answerCandidates, event.candidate.toJSON());
  };

  // const callData = (await callDoc.get()).data();
  const callData = (await getDoc(callDoc)).data();

  const offerDescription = callData.offer;
  await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

  const answerDescription = await pc.createAnswer();
  await pc.setLocalDescription(answerDescription);

  const answer = {
    type: answerDescription.type,
    sdp: answerDescription.sdp,
  };

  // await callDoc.update({ answer });
  await updateDoc(callDoc, { answer });

  // offerCandidates.onSnapshot((snapshot) => {
  onSnapshot(offerCandidates, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      console.log(change);
      if (change.type === 'added') {
        let data = change.doc.data();
        pc.addIceCandidate(new RTCIceCandidate(data));
      }
    });
  });
};


const unsub = onSnapshot(collection(db, "knocks"), (documents) => {
  // console.log("Current data: ", doc.data());
  // console.log(doc);
  let knocks = [];
  let names = [];
  documents.forEach(doc => {
    // knocks.push(doc.data());
    let date = doc._key.path.segments[6];
    console.log("Current data: ", doc.data().fromDoorBell);

    knocks.push(date);
    let data = doc.data();
    if (data.name) {
      names.push(data.name);
    }
    else {
      names.push("Anonymous");
    }
  });
  // console.log(knocks);
  // console.log(names);
  knocks = knocks.reverse();
  names = names.reverse();

  listElem.innerHTML = '';
  for (let i = 0; i < knocks.length; i++) {
    let knock = knocks[i];
    // let date = new Date(knock * 1000);
    // var hours = date.getHours();
    // let minutes = "0" + date.getMinutes();
    // let seconds = "0" + date.getSeconds();
    // let formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    knock = timeConverter(knock);

    const name = names[i];

    let holder = document.createElement("div");
    let left = document.createElement("div");
    let right = document.createElement("div");

    left.innerText = knock;
    right.innerText = name;

    holder.appendChild(left);
    holder.appendChild(right);

    listElem.appendChild(holder);


  }
  // let gridItem = document.createElement("div");
  // gridItem.className = "grid-item";
  // mapRef.appendChild(gridItem);
});

let firstGet = false;

const unsubCals = onSnapshot(doc(db, "calls", "room"), (documents) => {
  if (!firstGet) { firstGet = true; return; }
  let p = document.createElement("p");
  p.innerText = "Someone is calling you!";
  let button = document.createElement("button");
  button.innerText = "Answer";
  button.className = "button-green";
  button.onclick = answer;
  snackbar.innerHTML = "";
  snackbar.appendChild(p);
  snackbar.appendChild(button);

  // Add the "show" class to DIV
  snackbar.className = "show";

  // After 3 seconds, remove the show class from DIV
  setTimeout(function () { snackbar.className = snackbar.className.replace("show", ""); }, 8000);
  firstGet = false;
});


// const q = query(collection(db, "knocks"));
// const unsubscribe = onSnapshot(q, (querySnapshot) => {
//   const cities = [];
//   querySnapshot.forEach((doc) => {
//     cities.push(doc);
//   });
//   console.log(cities);
//   // console.log(querySnapshot);
//   // console.log("Current cities in CA: ", cities.join(", "));
// });

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
const webcamButton = document.getElementById('webcamButton');
const webcamVideo = document.getElementById('webcamVideo');
const answerButton = document.getElementById('answerButton');
const remoteVideo = document.getElementById('remoteVideo');
const hangupButton = document.getElementById('hangupButton');

// 1. Setup media sources

webcamButton.onclick = async () => {
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

  answerButton.disabled = false;
  webcamButton.disabled = true;

};


// 3. Answer the call with the unique ID
answerButton.onclick = async () => {
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
  documents.forEach(doc => {
    // knocks.push(doc.data());
    let date = doc._key.path.segments[6];

    knocks.push(date);
  });
  console.log(knocks);
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

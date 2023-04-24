import './style.css';

import { initializeApp } from "firebase/app";
import { getFirestore, doc, collection, setDoc, addDoc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";

// Create this file...
import * as firebaseConfig from './firebaseConfig.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

let roomId = "room";

const servers = {
  iceServers: [{ urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'], },],
  iceCandidatePoolSize: 10,
};

// Global State
const pc = new RTCPeerConnection(servers);
let localStream = null;
let remoteStream = null;

// HTML elements
const callButton = document.getElementById('call');
const knockButton = document.getElementById('knock');
const webcamVideo = document.getElementById('webcamVideo');
const remoteVideo = document.getElementById('remoteVideo');
const hangupButton = document.getElementById('hangupButton');
const buttonHolders = document.getElementById('buttonHolders');
const nameInput = document.getElementById('nameInput');

let createOffer = async () => {
  // Reference Firestore collections for signaling
  // const callDoc = db.collection('calls').doc();
  // const callDoc = doc(collection(db, "calls"));
  const callDoc = doc(collection(db, "calls"), roomId);


  // const offerCandidates = callDoc.collection('offerCandidates');
  // const answerCandidates = callDoc.collection('answerCandidates');
  const offerCandidates = collection(callDoc, 'offerCandidates');
  const answerCandidates = collection(callDoc, 'answerCandidates');


  // Get candidates for caller, save to db
  pc.onicecandidate = (event) => {
    // event.candidate && offerCandidates.add(event.candidate.toJSON());
    event.candidate && addDoc(offerCandidates, event.candidate.toJSON());
  };

  // Create offer
  const offerDescription = await pc.createOffer();
  await pc.setLocalDescription(offerDescription);

  const offer = {
    sdp: offerDescription.sdp,
    type: offerDescription.type,
  };

  // await callDoc.set({ offer });
  await setDoc(callDoc, { offer });

  // Listen for remote answer
  // callDoc.onSnapshot((snapshot) => {
  onSnapshot(callDoc, (snapshot) => {
    const data = snapshot.data();
    if (!pc.currentRemoteDescription && data?.answer) {
      const answerDescription = new RTCSessionDescription(data.answer);
      pc.setRemoteDescription(answerDescription);
    }
  });

  // When answered, add candidate to peer connection
  // answerCandidates.onSnapshot((snapshot) => {
  onSnapshot(answerCandidates, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const candidate = new RTCIceCandidate(change.doc.data());
        pc.addIceCandidate(candidate);
      }
    });
  });

  hangupButton.disabled = false;
};
// 1. Setup media sources

callButton.onclick = async () => {
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


  // webcamButton.disabled = true;
  // callButton.style.display = "none";
  // knockButton.style.display = "none";
  buttonHolders.style.display = "none";



  webcamVideo.style.display = "block";
  // call.remove();


  createOffer();
};

// 2. Create an offer
// callButton.onclick = createOffer();

knockButton.onclick = async () => {
  let unixTimeStamp = Math.floor(Date.now() / 1000);
  console.log(unixTimeStamp);
  console.log(nameInput.value);
  if (nameInput.value == "Name") {
    await setDoc(doc(db, "knocks", String(unixTimeStamp)), { name: "Anonymous" });
  }
  else {
    await setDoc(doc(db, "knocks", String(unixTimeStamp)), { name: nameInput.value });
  }
};
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyBHnCtRNbommBKPlwMSqIk-fNddObbJozo",
  authDomain: "lifelink-8ed3d.firebaseapp.com",
  projectId: "lifelink-8ed3d",
  storageBucket: "lifelink-8ed3d.appspot.com",
  messagingSenderId: "551857386656",
  appId: "1:551857386656:web:7d4f23f6684d04b25505c5"
};

export const app = initializeApp(firebaseConfig);
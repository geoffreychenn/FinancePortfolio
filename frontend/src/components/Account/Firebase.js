import firebase from "firebase/compat/app";
import "firebase/compat/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAPd9XXMW5Z_UxCnoN1siQUl1MsHVtYRJY",
  authDomain: "w14a-werebadatnames.firebaseapp.com",
  projectId: "w14a-werebadatnames",
  storageBucket: "w14a-werebadatnames.appspot.com",
  messagingSenderId: "53390184435",
  appId: "1:53390184435:web:8b4aa71778086a9a0d0c86",
};

const app = firebase.initializeApp(firebaseConfig);
export const auth = app.auth();
export default app;

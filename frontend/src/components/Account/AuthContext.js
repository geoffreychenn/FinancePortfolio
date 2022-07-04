import React, {useContext, useEffect, useState} from "react";
import {auth} from "./Firebase";
import API from "../../API";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);

  async function signup(email, password) {
    var newUser = await auth.createUserWithEmailAndPassword(email, password);
    await API.addUser(newUser.user.uid, newUser.user.email);
    return newUser;
  }

  function login(email, password) {
    return auth.signInWithEmailAndPassword(email, password);
  }

  async function logout() {
    await API.logout(currentUser.uid);
    return auth.signOut();
  }

  function resetPassword(email) {
    return auth.sendPasswordResetEmail(email);
  }

  function updateEmail(email) {
    return currentUser.updateEmail(email);
  }

  function updatePassword(password) {
    return currentUser.updatePassword(password);
  }

  useEffect(() => {
    return auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    updateEmail,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

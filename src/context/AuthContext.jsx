import { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../firebase";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        console.log("🔄 AuthContext: Fetching user details from backend...");
        const res = await api.get("/api/users/me");
        console.log("✅ AuthContext: Backend sync success", res.data);

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          ...res.data,
        });
      } catch (err) {
        console.error("❌ Backend user sync failed", err);
        await signOut(auth);
        localStorage.removeItem("firebaseToken");
        setUser(null);
      }

      setLoading(false);
      console.log("🏁 AuthContext: Loading set to false");
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    const token = await userCredential.user.getIdToken();
    localStorage.setItem("firebaseToken", token);

    console.log("✅ Token stored in localStorage");

    return userCredential.user;
  };

  const googleLogin = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);

    const token = await userCredential.user.getIdToken();
    localStorage.setItem("firebaseToken", token);

    console.log("✅ Token stored in localStorage (Google)");

    return userCredential.user;
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem("firebaseToken");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        googleLogin,
        logout,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import { createContext, useContext, useEffect, useState } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );
    return decoded;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  async function login(email, password, loginType) {
    setLoading(true);

    try {
      let endpoint;

      if (loginType === "ADMIN") {
        endpoint = "/admin/login";
      } else if (loginType === "SUPPLIER") {
        endpoint = "/supplier/login";
      } else {
        endpoint = "/users/login";
      }

      const res = await client.post(endpoint, {
        email,
        password,
      });

      const token = res.data;

      if (!token || token.startsWith("Invalid")) {
        throw new Error("Invalid email or password");
      }

      localStorage.setItem("token", token);

      const claims = decodeJwt(token);

      let fullUser = null;

      if (loginType !== "ADMIN" && loginType !== "SUPPLIER") {
        const usersRes = await client.get("/users");
        fullUser = usersRes.data.find((u) => u.email === email);
      }

      const sessionUser = {
        email: claims?.sub ?? email,
        role: claims?.role ?? loginType,
        userId: fullUser?.userId,
        name: fullUser?.name,
        department: fullUser?.department,
        designation: fullUser?.designation,
      };

      setUser(sessionUser);

      return sessionUser;
    } finally {
      setLoading(false);
    }
  }

  async function register(payload) {
    setLoading(true);

    try {
      await client.post("/users", payload);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return ctx;
}
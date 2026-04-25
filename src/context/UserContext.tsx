import {createContext, useContext, useState, useEffect, type ReactNode} from "react";
import {post} from "@/api";
import {getItem, setItem, removeItem} from "@/utils/storage";

interface User {
  username: string | null;
  storiePubblicate: number;
  storieCondivise: number;
  templateSalvati: number;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  loadFromJwt: (token: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({children}: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const decodeJwt = (token: string) => {
    try {
      // JWT has 3 parts: header.payload.signature
      const payload = token.split(".")[1];
      if (!payload) {
        console.error("Invalid JWT format");
        return null;
      }

      // Decode base64url payload
      const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = atob(base64);
      const decoded = JSON.parse(jsonPayload);

      return decoded;
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  };

  const loadFromJwt = async (token: string) => {
    const decoded = decodeJwt(token);
    if (decoded?.username) {
      const username = decoded.username;
      const storiePubblicate = decoded.storiePubblicate || 0;
      const storieCondivise = decoded.storieCondivise || 0;
      const templateSalvati = decoded.templateSalvati || 0;

      setUser({username, storiePubblicate, storieCondivise, templateSalvati});
      // Save decoded user to AsyncStorage
      await setItem("user", JSON.stringify({username, storiePubblicate, storieCondivise, templateSalvati}));
    } else {
      console.error("Username claim not found in JWT");
    }
  };

  useEffect(() => {
    // Try to load user from AsyncStorage on mount
    const loadStoredUser = async () => {
      const storedUser = await getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser?.username) {
            setUser({
              username: parsedUser.username,
              storiePubblicate: parsedUser.storiePubblicate || 0,
              storieCondivise: parsedUser.storieCondivise || 0,
              templateSalvati: parsedUser.templateSalvati || 0
            });
          }
        } catch (error) {
          console.error("Error parsing stored user:", error);
        }
      }
      setIsLoading(false);
    };

    loadStoredUser();
  }, []);

  const logout = async () => {
    try {
      await post<void>("/utente/logout", {});
      setUser(null);
      await removeItem("user");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <UserContext.Provider value={{user, isLoading, loadFromJwt, logout}}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

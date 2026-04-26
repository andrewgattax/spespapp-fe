import {createContext, useContext, useState, useEffect, type ReactNode} from "react";
import * as SecureStore from "expo-secure-store";
import {getItem, setItem, removeItem} from "@/utils/storage";
import {hasKeys, getUsername as getKeyUsername} from "@/utils/keyManager";

interface User {
  username: string | null;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  isRegistered: boolean;
  registeredUsername: string | null;
  loadFromJwt: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
  checkRegistrationStatus: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({children}: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [registeredUsername, setRegisteredUsername] = useState<string | null>(null);

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
    if (decoded?.sub) {
      const username = decoded.sub;

      // Store JWT in SecureStore (encrypted, no biometric prompt required)
      await SecureStore.setItemAsync("auth_token", token);

      setUser({username});
      // Save decoded user to AsyncStorage
      await setItem("user", JSON.stringify({username}));
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
            // Verify JWT still exists in SecureStore
            const token = await SecureStore.getItemAsync("auth_token");
            if (token) {
              setUser({
                username: parsedUser.username
              });
            } else {
              // Token missing, clear user data
              await removeItem("user");
            }
          }
        } catch (error) {
          console.error("Error parsing stored user:", error);
        }
      }

      // Check registration status
      await checkRegistrationStatus();

      setIsLoading(false);
    };

    loadStoredUser();
  }, []);

  const logout = async () => {
    try {
      setUser(null);
      await removeItem("user");
      // Clear JWT from SecureStore
      await SecureStore.deleteItemAsync("auth_token");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const getToken = async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync("auth_token");
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  };

  const checkRegistrationStatus = async () => {
    try {
      const keysExist = await hasKeys();
      const username = await getKeyUsername();

      setIsRegistered(keysExist);
      setRegisteredUsername(username);
    } catch (error) {
      console.error("Error checking registration status:", error);
    }
  };

  return (
    <UserContext.Provider value={{user, isLoading, isRegistered, registeredUsername, loadFromJwt, logout, getToken, checkRegistrationStatus}}>
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

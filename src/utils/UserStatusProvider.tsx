// UserStatusProvider.tsx
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";

interface UserStatus {
  username: string;
  online: boolean;
}

interface UserStatusContextType {
  userStatuses: UserStatus[];
}

// const USER_STATUS_STORAGE_KEY = "userStatuses";


const UserStatusContext = createContext<UserStatusContextType | undefined>(undefined);

export const UserStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userStatuses, setUserStatuses] = useState<UserStatus[]>(() => {
    // const stored = localStorage.getItem(USER_STATUS_STORAGE_KEY);
    return [];
  });
  const stompClient = useRef<Client | null>(null);

  // useEffect(() => {
  //   localStorage.setItem(USER_STATUS_STORAGE_KEY, JSON.stringify(userStatuses));
  // }, [userStatuses]);

  useEffect(() => {
    const socket = new SockJS(`${process.env.REACT_APP_SERVER_HOST}/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (msg) => console.log("[STOMP]", msg),
    });

    client.onConnect = () => {
      console.log("Connected to WebSocket");

      client.subscribe("/topic/status", (message: IMessage) => {
        const status: UserStatus = JSON.parse(message.body);
        console.log(status);
        setUserStatuses((prev) => {
          const exists = prev.find((u) => u.username === status.username);
          if (exists) {
            return prev.map((u) =>
              u.username === status.username ? { ...u, online: status.online } : u
            );
          } else {
            return [...prev, status];
          }

        });
      });
    };

    client.activate();
    stompClient.current = client;

    return () => {
      client.deactivate();
    };
  }, []);

  return (
    <UserStatusContext.Provider value={{ userStatuses }}>
      {children}
    </UserStatusContext.Provider>
  );
};

export const useUserStatus = (): UserStatusContextType => {
  const context = useContext(UserStatusContext);
  if (!context) {
    throw new Error("useUserStatus must be used within a UserStatusProvider");
  }
  return context;
};

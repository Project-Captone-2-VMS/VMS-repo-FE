import React, { useEffect, useState } from "react";
import { over } from "stompjs";
import SockJS from "sockjs-client";

const UserReceiver = () => {
  const [notifications, setNotifications] = useState([]);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      console.error("Username not found in localStorage!");
    }
  }, []);

  useEffect(() => {
    if (!username) return;

    const socket = new SockJS("http://localhost:8080/ws");
    const client = over(socket);

    client.connect(
      {},
      () => {
        console.log(`Connected to WebSocket as ${username}`);
        client.subscribe(`/user/${username}/notifications`, (message) => {
          const notification = JSON.parse(message.body);
          console.log("New notification received:", notification);
          alert(`Bạn có tin nhắn mới: ${notification.title}`);
          setNotifications((prev) => [...prev, notification]);
        });
      },
      (error) => {
        console.error("Error connecting to WebSocket:", error);
      }
    );

    return () => {
      if (client.connected) {
        client.disconnect(() => {
          console.log("Disconnected from WebSocket");
        });
      }
    };
  }, [username]);

  

  if (!username) {
    return <p>Loading user information...</p>;
  }

  return (
    <div>
      <h2>User Notifications</h2>
      <ul>
        {notifications.map((notif) => (
          <li key={notif.id}>
            <strong>{notif.title}:</strong> {notif.content} -{" "}
            <em>{notif.type}</em>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserReceiver;

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Checkbox,
  Typography,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../theme"; // Adjust the path if necessary
import Header from "../../components/Header";

const NotificationsPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [token, setToken] = useState("");

  // Login to retrieve the token
  useEffect(() => {
    const login = async () => {
      try {
        const response = await fetch("http://51.20.144.224:3000/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "user-agent": navigator.userAgent,
          },
          body: JSON.stringify({
            email: "angreg007@gmail.com",
            password: "admin",
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Login failed");
        }

        setToken(result.accessToken); // Store the token in state
      } catch (error) {
        console.error("Error during login:", error);
      }
    };

    login();
  }, []);

  // Fetch notifications after login and token is set
  useEffect(() => {
    if (token) {
      const fetchNotifications = async () => {
        try {
          const response = await axios.get(
            "http://51.20.144.224:3000/notification/all",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          console.log("Response data:", response.data); // Log response to inspect its structure

          // Ensure that notifications are fetched properly
          setNotifications(
            Array.isArray(response.data.notifications)
              ? response.data.notifications
              : []
          );

          setLoading(false);
        } catch (error) {
          console.error("Error fetching notifications:", error);
          setLoading(false);
        }
      };

      fetchNotifications();
    }
  }, [token]);

  // Mark selected notifications as read
  const handleMarkAsRead = async () => {
    if (selectedIds.length === 0) return;

    try {
      await axios.post(
        "http://51.20.144.224:3000/notification/view",
        { ids: selectedIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(selectedIds);
      // Update notifications state to mark the selected ones as read
      setNotifications(
        notifications.map((notification) =>
          selectedIds.includes(notification.id)
            ? { ...notification, isViewed: true }
            : notification
        )
      );
      setSelectedIds([]); // Clear selected notifications after marking as read
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  // Toggle notification selection
  const handleSelectNotification = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ padding: "20px" }}>
      <Header
        title="Liste des notifications"
        subtitle="Voire la liste des notifications"
      />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "10px",
        }}
      >
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <Box
              key={notification.id}
              sx={{
                display: "flex",
                alignItems: "center",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                backgroundColor: notification.isViewed
                  ? colors.grey?.[900] || "#E0E0E0" // Default color
                  : colors.blue?.[100] || "#BBDEFB", // Default color

                cursor: "pointer",
              }}
              onClick={() => handleSelectNotification(notification.id)}
            >
              <Checkbox
                checked={selectedIds.includes(notification.id)}
                onChange={() => handleSelectNotification(notification.id)}
                sx={{
                  color: colors.greenAccent[200],
                  "&.Mui-checked": {
                    color: colors.greenAccent[700],
                  },
                }}
              />
              <Box sx={{ marginLeft: "10px" }}>
                <Typography variant="h6">{notification.title}</Typography>
                <Typography variant="body2">
                  {notification.description}
                </Typography>
                <Typography variant="caption">
                  {new Date(notification.sendingTime).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          ))
        ) : (
          <Typography>No notifications available</Typography>
        )}
      </Box>
      <Button
        onClick={handleMarkAsRead}
        disabled={selectedIds.length === 0}
        sx={{
          mt: "20px",
          padding: "10px 20px",
          backgroundColor:
            selectedIds.length === 0
              ? colors.grey[300]
              : colors.blueAccent[700],
          color: "#fff",
          "&:hover": {
            backgroundColor: colors.blueAccent[500],
          },
        }}
      >
        Marquer comme vu
      </Button>
    </Box>
  );
};

export default NotificationsPage;

import React, { useState, useEffect } from "react";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import axios from "axios";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../theme"; // Adjust the path if necessary
import Header from "../../components/Header";
import { CheckCircle, Circle } from "@mui/icons-material"; // Icons for viewed and non-viewed

const NotificationsPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [token, setToken] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10); // Adjust the page size as needed

  // Login to retrieve the token
  useEffect(() => {
    const login = async () => {
      try {
        const response = await fetch("http://localhost:3000/auth/login", {
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
            `http://localhost:3000/notification/all?page=${currentPage}&limit=${pageSize}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          console.log("Response data:", response.data); // Log response to inspect its structure

          setNotifications(
            Array.isArray(response.data.notifications)
              ? response.data.notifications
              : []
          );

          setTotalPages(response.data.totalPages); // Assuming the API returns total pages

          setLoading(false);
        } catch (error) {
          console.error("Error fetching notifications:", error);
          setLoading(false);
        }
      };

      fetchNotifications();
    }
  }, [token, currentPage]);

  // Mark selected notifications as read
  const handleMarkAsRead = async () => {
    if (selectedIds.length === 0) return;

    try {
      await axios.post(
        "http://localhost:3000/notification/view",
        { ids: selectedIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );

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

  // Display unread notifications first, no need to sort by date
  const sortedNotifications = [...notifications].sort((a, b) => {
    // Prioritize unread notifications (isViewed === false)
    return a.isViewed - b.isViewed;
  });

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
        {sortedNotifications.length > 0 ? (
          sortedNotifications.map((notification) => (
            <Box
              key={notification.id}
              sx={{
                display: "flex",
                alignItems: "center",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                backgroundColor: notification.isViewed
                  ? colors.grey?.[900] || "#E0E0E0" // Default color for read notifications
                  : colors.blue?.[100] || "#BBDEFB", // Default color for unread notifications
                cursor: "pointer",
              }}
              onClick={() => handleSelectNotification(notification.id)}
            >
              {/* Icon based on viewed or not */}
              {selectedIds.includes(notification.id) ||
              notification.isViewed ? (
                <CheckCircle
                  sx={{
                    color: colors.greenAccent[700], // Custom color for viewed notifications icon
                    fontSize: "24px",
                  }}
                />
              ) : (
                <Circle
                  sx={{
                    color: colors.blueAccent[800], // Custom blue color for unread notifications icon
                    fontSize: "24px",
                  }}
                />
              )}

              {/* Always display the content of notifications */}
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

      {/* Pagination Controls */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "20px",
        }}
      >
        <Button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </Button>
        <Typography>
          Page {currentPage} of {totalPages}
        </Typography>
        <Button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </Button>
      </Box>

      <Button
        onClick={handleMarkAsRead}
        disabled={selectedIds.length === 0}
        sx={{
          mt: "20px",
          padding: "10px 20px",
          backgroundColor:
            selectedIds.length === 0
              ? colors.grey[800]
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

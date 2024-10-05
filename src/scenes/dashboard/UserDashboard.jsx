import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import Line from "../line";

const UserDashboard = () => {
  const [contact, setContact] = useState(null); // State to hold contact data
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error handling

  useEffect(() => {
    const fetchContactData = () => {
      try {
        const storedContact = localStorage.getItem("contact");
        console.log(storedContact);

        if (storedContact) {
          setContact(JSON.parse(storedContact));
        } else {
          throw new Error("No contact data found in local storage");
        }
      } catch (error) {
        console.error("Error fetching contact data:", error);
        setError("Failed to fetch contact data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchContactData(); // Fetch contact data from local storage
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <Box
      p="20px"
      display="flex"
      flexDirection="column"
      height="100vh"
      overflow="auto"
    >
      {contact && (
        <>
          <Box
            sx={{
              backgroundColor: "#114232",
              color: "white",
              borderRadius: "8px",
              padding: "20px",
              maxWidth: "800px", // Limit the width of the box
              ml: "0", // Center the box horizontally
              mb: "20px",
              fontSize: "24px", // Adjust the font size as needed
              textAlign: "left", // Align text to the left
            }}
          >
            <Typography variant="h4" mb="20px">
              Dashboard de {contact.name} :
            </Typography>
            <Typography variant="body1" mb="10px">
              * Email: {contact.email}
            </Typography>
            <Typography variant="body1" mb="10px">
              * Téléphone: {contact.phone}
            </Typography>
          </Box>

          {/* Render the Line component */}
          <Box flexGrow={1}>
            <Line />
          </Box>
        </>
      )}
    </Box>
  );
};

export default UserDashboard;

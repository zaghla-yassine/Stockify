import { Box, IconButton, Menu, MenuItem, useTheme } from "@mui/material";
import { useContext, useState } from "react";
import { ColorModeContext } from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";

const Topbar = () => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const [anchorEl, setAnchorEl] = useState(null);

  // Open and close the menu
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle logout action
  const handleLogout = async () => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5OTI3ZmE5Mi00NDk4LTRlZGQtOGMwNS0yM2E3NTBjZjE5MzciLCJyb2xlIjoiU3RhZmYiLCJpYXQiOjE3MjcxMDQzOTksImV4cCI6MTcyNzcwOTE5OX0.1kbKrSNRj2_sNFZBprtu5TupaJQJGbEitGfpwg9O96Q";

    if (!token) {
      console.error("No token found");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        localStorage.removeItem("jwtToken"); // Remove the token after logout
        window.location.href = "http://localhost:3001/login"; // Redirect to the login page
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="flex-end"
      alignItems="center"
      sx={{ p: 2, borderBottom: "2px solid #114232" }}
    >
      <IconButton onClick={colorMode.toggleColorMode}>
        {theme.palette.mode === "dark" ? (
          <DarkModeOutlinedIcon sx={{ fontSize: 30 }} />
        ) : (
          <LightModeOutlinedIcon sx={{ fontSize: 30 }} />
        )}
      </IconButton>

      <IconButton onClick={handleMenuClick}>
        <PersonOutlinedIcon sx={{ fontSize: 30 }} />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleLogout}>Déconnexion</MenuItem>
      </Menu>
    </Box>
  );
};

export default Topbar;

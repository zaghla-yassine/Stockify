import { Box, Button, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import Header from "../../components/Header";
import React, { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom"; // Updated import

const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [staffMembers, setStaffMembers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");

  const navigate = useNavigate(); // Use navigate

  const handleTaskListClick = (staffId) => {
    navigate(`/tasks/${staffId}`);
  };

  // Function to log in and obtain the token
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
      console.log(token);
    } catch (error) {
      console.error("Error during login:", error);
      setError("Login failed. Please check your credentials and try again.");
      setLoading(false);
    }
  };

  // Fetch the staff members after login
  useEffect(() => {
    login(); // Perform login when the component mounts
  }, []);

  useEffect(() => {
    const fetchStaffMembers = async () => {
      if (!token) return; // Ensure the token is available

      try {
        const response = await fetch(
          "http://51.20.144.224:3000/users?role=Staff",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch staff members");
        }

        const result = await response.json();

        const transformedStaff = result.users.map((staff) => ({
          id: staff.id,
          name: `${staff.firstName} ${staff.lastName}`,
          age: staff.age,
          email: staff.email,
          phone: staff.phoneNumber,
          access: "manager", // Set all badges to 'manager'
        }));

        setStaffMembers(transformedStaff);
      } catch (error) {
        console.error("Error fetching staff members:", error);
        setError("Failed to fetch staff members. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchStaffMembers(); // Fetch staff members after obtaining the token
    }
  }, [token]);

  const columns = [
    { field: "id", headerName: "ID" },
    {
      field: "name",
      headerName: "Nom",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "phone",
      headerName: "Télephone",
      flex: 1,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "access",
      headerName: "Access Level",
      flex: 1,
      renderCell: (params) => {
        return (
          <Button
            color="secondary"
            variant="contained"
            onClick={() => handleTaskListClick(params.row.id)}
          >
            Liste des taches
          </Button>
        );
      },
    },
  ];

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <Box m="20px">
      <Header title="TEAM" subtitle="Gérer les Membres de L'équipe" />
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
        <DataGrid checkboxSelection rows={staffMembers} columns={columns} />
      </Box>
    </Box>
  );
};

export default Team;

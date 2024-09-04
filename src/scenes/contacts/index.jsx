import { Box, Button } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Use useNavigate from react-router-dom

const Contacts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [clients, setClients] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate

  const login = async () => {
    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user-agent": navigator.userAgent,
        },
        body: JSON.stringify({
          email: "anghamz@gmail.com",
          password: "password",
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

  useEffect(() => {
    login(); // Login when the component mounts
  }, []);

  useEffect(() => {
    const fetchClients = async () => {
      if (!token) return; // Ensure the token is available

      try {
        const response = await fetch(
          "http://localhost:3000/users?role=Default",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch clients");
        }

        const result = await response.json();

        const transformedClients = result.users.map((client) => ({
          id: client.id,
          name: `${client.firstName} ${client.lastName}`,
          email: client.email,
          phone: client.phoneNumber,
        }));

        setClients(transformedClients);
      } catch (error) {
        console.error("Error fetching clients:", error);
        setError("Failed to fetch clients. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchClients(); // Fetch clients after obtaining the token
    }
  }, [token]);

  const handleDashboardRedirect = (contact) => {
    // Store contact information in local storage
    localStorage.setItem("contact", JSON.stringify(contact));
    // Navigate to the specific user's dashboard page
    navigate(`/dashboard/UserDashboard`);
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    {
      field: "name",
      headerName: "Nom",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "phone",
      headerName: "Télephone",
      flex: 1,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => {
        return (
          <Button
            variant="contained"
            sx={{
              backgroundColor: colors.greenAccent[700],
              color: "#fff",
              "&:hover": {
                backgroundColor: colors.greenAccent[500], // Optional: Add a hover effect
              },
            }}
            onClick={() => handleDashboardRedirect(params.row)}
          >
            Go to Dashboard
          </Button>
        );
      },
    },
  ];

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <Box m="20px">
      <Header title="CONTACTS" subtitle="Liste des Clients" />
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
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <DataGrid
          rows={clients}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
        />
      </Box>
    </Box>
  );
};

export default Contacts;

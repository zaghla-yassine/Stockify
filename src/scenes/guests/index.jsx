import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Guests = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null); // To store client ID
  const [dialogOpen, setDialogOpen] = useState(false); // To manage product dialog
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const navigate = useNavigate();

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

      setToken(result.accessToken);
      localStorage.setItem("token", result.accessToken);
    } catch (error) {
      console.error("Error during login:", error);
      setError("Login failed. Please check your credentials and try again.");
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        "http://localhost:3000/users?role=Default&isSubscribed=false",
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

      // Save all clients to localStorage
      localStorage.setItem("clients", JSON.stringify(transformedClients));

      setClients(transformedClients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      setError("Failed to fetch clients. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch products when a client is selected
  const fetchProducts = async (clientId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/product/client/${clientId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const result = await response.json();
      console.log("Fetched products:", result); // Log the response for debugging

      // Use result.products to access the products array
      setProducts(result.products || []); // Set products or an empty array
      setSelectedClientId(clientId); // Store client ID for future use
      setDialogOpen(true); // Open the dialog to display products
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to fetch products. Please try again later.");
    }
  };

  // Handle product selection
  const handleProductClick = (product) => {
    // Store product details in localStorage
    localStorage.setItem("productId", product.id);
    localStorage.setItem("productPackType", product.packType);

    // Close the dialog after selecting a product
    setDialogOpen(false);

    // Navigate to Commande page with the selected client and product
    navigate(`/command/${selectedClientId}`);
  };

  // Effect to log in when the component mounts
  useEffect(() => {
    login();
  }, []);

  // Effect to fetch clients after obtaining the token
  useEffect(() => {
    if (token) {
      fetchClients();
    }
  }, [token]);

  // Define columns for the data grid
  const columns = [
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
              marginLeft: "10px",
              "&:hover": {
                backgroundColor: colors.greenAccent[500],
              },
            }}
            onClick={() => fetchProducts(params.row.id)} // Only opens the dialog
          >
            Liste des produits
          </Button>
        );
      },
    },
  ];

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <Box m="20px">
      <Header title="GUESTS" subtitle="Liste des Visiteurs" />
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

      {/* Dialog to display products */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle style={{ color: "green", fontWeight: "bold" }}>
          ID des Produits :{" "}
        </DialogTitle>
        <DialogContent>
          <List>
            {/* Check if products is an array before mapping */}
            {Array.isArray(products) && products.length > 0 ? (
              products.map((product, i) => (
                <ListItem
                  button
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                >
                  <ListItemText primary={`${i + 1}--- ${product.id}`} />
                </ListItem>
              ))
            ) : (
              <p>No products available</p> // Handle empty products array
            )}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Guests;

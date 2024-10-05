import {
  Box,
  Button,
  Dialog,
  DialogActions,
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

const Contacts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [pdfData, setPdfData] = useState(null); // State to store the PDF data
  const [open, setOpen] = useState(false); // State for controlling the modal
  const navigate = useNavigate();
  const [selectedClientId, setSelectedClientId] = useState(null); //
  const [dialogOpen, setDialogOpen] = useState(false);

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
    } catch (error) {
      console.error("Error during login:", error);
      setError("Login failed. Please check your credentials and try again.");
      setLoading(false);
    }
  };

  // Fetch products when a client is selected
  const fetchProducts = async (clientId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/product/client/${clientId.id}`,
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
      console.log("Fetched products:", result);

      setProducts(result.products || []);
      setSelectedClientId(clientId);

      // Store the selected client's details in localStorage
      localStorage.setItem(
        "contact",
        JSON.stringify({
          name: clientId.name,
          email: clientId.email,
          phone: clientId.phone,
          id: clientId.id,
        })
      );

      setDialogOpen(true);
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
    // Store clientId in localStorage from the selected client
    localStorage.setItem("clientId", selectedClientId.id);

    // Close the dialog after selecting a product
    setDialogOpen(false);

    // Navigate to Commande page with the selected client and product
    navigate(`/dashboard/UserDashboard`);
  };

  useEffect(() => {
    login();
  }, []);

  useEffect(() => {
    const fetchClients = async () => {
      if (!token) return;

      try {
        const response = await fetch(
          "http://localhost:3000/users?role=Default&isSubscribed=true",
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
      fetchClients();
    }
  }, [token]);

  const handleDownloadReport = async () => {
    try {
      const response = await fetch("http://localhost:5000/download", {
        method: "GET",
        headers: {
          "Content-Type": "application/pdf",
        },
      });
      console.log(response);

      if (!response.ok) {
        throw new Error("Failed to download report");
      }

      const blob = await response.blob(); // Convert the response into a Blob (PDF format)
      const url = URL.createObjectURL(blob); // Create a URL for the blob
      setPdfData(url); // Store the PDF URL in state
      setOpen(true); // Open the popup/modal to display the PDF
    } catch (error) {
      console.error("Error downloading report:", error);
      setError("Failed to download report. Please try again later.");
    }
  };

  const handleClose = () => {
    setOpen(false);
    URL.revokeObjectURL(pdfData); // Clean up the object URL when closing the modal
  };

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
          <>
            <Button
              variant="contained"
              sx={{
                backgroundColor: colors.greenAccent[900],
                color: "#114232",
                "&:hover": {
                  backgroundColor: colors.greenAccent[500],
                },
              }}
              onClick={() => fetchProducts(params.row)}
            >
              Dashboard
            </Button>
            <Button
              variant="contained"
              sx={{
                backgroundColor: colors.greenAccent[200],
                color: "#fff",
                ml: 1, // Add margin between buttons
                "&:hover": {
                  backgroundColor: colors.greenAccent[300],
                },
              }}
              onClick={handleDownloadReport} // Download report on click
            >
              Télécharger Rapport
            </Button>
          </>
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
            color: colors.greenAccent[400],
            fontSize: "16px", // Taille de police plus grande (ajuste la valeur selon tes besoins)
          },

          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.greenAccent[200],
            borderBottom: "none",
            color: "#fff", // Couleur du texte en blanc
          },

          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.greenAccent[200],
            color: "#fff",
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[200]} !important`,
          },
        }}
      >
        <DataGrid
          rows={clients}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
        />
      </Box>

      {/* Dialog for PDF report */}
      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogContent>
          {pdfData && (
            <iframe
              src={pdfData}
              title="Report PDF"
              width="100%"
              height="600px"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
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
                  <ListItemText primary={`${i + 1}-)   ${product.id}`} />
                </ListItem>
              ))
            ) : (
              <p>Il n'a pas de produits</p> // Handle empty products array
            )}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Contacts;

import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Snackbar,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { tokens } from "../../theme";
import { useTheme } from "@mui/material/styles";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import Header from "../../components/Header";

const Command = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [amount] = useState(6000);

  const [activeStep, setActiveStep] = useState(0);
  const [amountInDT, setAmountInDT] = useState(0);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffList, setStaffList] = useState([]); // To store the staff list
  const [dialogOpen, setDialogOpen] = useState(false); // State to control dialog
  const [clientInfo, setClientInfo] = useState({});
  const [productId, setProductId] = useState(null);
  const [productPackType, setProductPackType] = useState(null);

  const steps = [
    "Non payé",
    "En cours d'installation",
    "Livraison et installation terminée",
  ];
  const { clientId } = useParams();

  const client = useMemo(() => {
    const clients = JSON.parse(localStorage.getItem("clients")) || [];
    return clients.find((c) => c.id === clientId);
  }, [clientId]);

  useEffect(() => {
    const storedProductId = localStorage.getItem("productId");
    const storedProductPackType = localStorage.getItem("productPackType");

    if (storedProductId && storedProductPackType) {
      setProductId(storedProductId);
      setProductPackType(storedProductPackType);
    }
  }, []);

  if (!client) {
    console.log("Client not found");
  } else {
    console.log("Client found:", client);
  }

  // Fetch staff when dialog opens
  // Fetch staff when dialog opens
  const fetchStaff = async () => {
    try {
      const response = await fetch("http://localhost:3000/staff", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Include admin JWT token
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch staff.");
      }

      const data = await response.json();
      console.log("suiii", data); // This should show the full response object

      // If staff is inside an object, extract the `staffs` array
      setStaffList(data.staffs); // Assuming `staffs` is the key in your response
    } catch (error) {
      setError("Error fetching staff.");
    }
  };

  // Open the staff selection dialog
  const handleOpenDialog = () => {
    handleTaskCreation();
    fetchStaff(); // Fetch staff when opening the dialog
    setDialogOpen(true); // Open the dialog
  };

  // Close the dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Handle staff selection
  const handleSelectStaff = (staff) => {
    setSelectedStaff(staff); // Set selected staff
    setDialogOpen(false); // Close dialog after selection
  };

  const handlePayment = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/payment/clientGuest",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ clientId, amountInDT: amount }),
        }
      );

      if (!response.ok) {
        throw new Error("Payment failed");
      }

      setActiveStep(1);
    } catch (error) {
      console.error("Error during payment:", error);
      setError("Payment failed. Please try again.");
    }
  };

  const handleInstallation = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/users/${client.id}/subscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Installation failed.");
      }

      setActiveStep(2);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleTaskCreation = async () => {
    if (!selectedStaff) {
      setError("Please select a staff member.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/task/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId,
          staffId: selectedStaff.id,
          productId: localStorage.getItem("productId"),
        }),
      });

      if (!response.ok) {
        throw new Error("Task creation failed.");
      }

      setSnackbarOpen(true);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  console.log("aaaaa", staffList);
  return (
    <Box m="20px">
      <Header title="COMMANDE" subtitle="Processus de Commande" />

      {/* Display Client Info */}
      <Box justifyContent="space-between" alignItems="center" mb="20px">
        <Typography variant="h5">Nom et Prénom : {`${client.name}`}</Typography>
        <Typography variant="h5">Email : {client.email}</Typography>
        <Typography variant="h5">Téléphone : {client.phone}</Typography>

        {/* Display product details */}
        <Typography variant="h6">ID du produit : {productId}</Typography>
        <Typography variant="h6">
          Product Pack Type: {productPackType}
        </Typography>
      </Box>

      {/* Stepper */}
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel
              StepIconProps={{ style: { fontSize: "4rem", color: "#4CAF50" } }} // Augmente la taille des numéros
            >
              {label}
              {index === 2 && (
                <LocalShippingIcon
                  style={{ marginLeft: 8, fontSize: "2rem" }}
                />
              )}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step Content */}
      <Box mt="40px">
        {activeStep === 0 && (
          <Box sx={{ ml: 25 }}>
            <Typography variant="h6">Entrez le montant (DT)</Typography>
            <input
              type="number"
              value={amountInDT}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (value > 0 || e.target.value === "") {
                  setAmountInDT(e.target.value); // Met à jour seulement si la valeur est > 0 ou vide (pour permettre l'effacement)
                }
              }}
              min="0"
            />
            {amountInDT <= 0 && amountInDT !== "" && (
              <Typography color="error">
                Le montant doit être supérieur à 0.
              </Typography>
            )}
            <Button
              variant="contained"
              color="secondary"
              onClick={handlePayment}
              disabled={amountInDT <= 0}
            >
              Payer
            </Button>
          </Box>
        )}

        {activeStep === 1 && (
          <Box sx={{ ml: 105 }}>
            <Typography variant="h6">Continuer avec la livraison</Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleOpenDialog} // Open dialog to select staff
              sx={{ m: 2 }}
            >
              Choisir Staff
            </Button>
          </Box>
        )}

        {activeStep === 2 && (
          <Box>
            <Typography variant="h6">Installation Completed</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleTaskCreation} // Assign task to the selected staff member
              sx={{ mt: 2 }}
            >
              Assign Task to Staff
            </Button>
          </Box>
        )}
      </Box>

      {/* Error Message */}
      {error && (
        <Typography color="error" ml={105}>
          {error}
        </Typography>
      )}

      {/* Snackbar for Task Creation */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message="Task created successfully"
      />
      {/* Dialog for staff selection */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle style={{ color: "green", fontWeight: "bold" }}>
          Choisir un membre du Staff
        </DialogTitle>

        <DialogContent>
          <List>
            {staffList.map((staff, i) => (
              <ListItem key={staff.id}>
                <ListItemButton onClick={() => handleSelectStaff(staff)}>
                  <ListItemText
                    primary={`${i + 1}. ${staff.firstName} ${staff.lastName}`}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Command;

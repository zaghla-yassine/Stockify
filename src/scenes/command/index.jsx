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
  StepConnector,
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
  const [taskAssigned, setTaskAssigned] = useState(false); // New state to track task assignment
  const [paymentSnackbarOpen, setPaymentSnackbarOpen] = useState(false);
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

      setStaffList(data.staffs); // Assuming `staffs` is the key in your response
    } catch (error) {
      setError("Error fetching staff.");
    }
  };
  console.log("Staff list:", staffList);

  // Open the staff selection dialog
  const handleOpenDialog = () => {
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

    // Proceed to the next step after staff selection
    setActiveStep((prevStep) => prevStep + 1);
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
          body: JSON.stringify({
            clientId,
            amountInDT: parseInt(amountInDT),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Payment failed");
      }

      setActiveStep(1);
      setPaymentSnackbarOpen(true); // Show snackbar on successful payment
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
      setTaskAssigned(true); // Update state to indicate task is assigned
    } catch (error) {
      setError(error.message);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box m="20px">
      <Header title="COMMANDE" subtitle="Processus de Commande" />

      <Box
        p="20px"
        borderRadius="8px"
        boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)"
        bgcolor="#f9f9f9"
        maxWidth="600px"
        mb={10}
      >
        {/* Display Client Info */}
        <Typography variant="h4" color="#114232" fontWeight="bold" mb="10px">
          Informations du Client :
        </Typography>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          bgcolor="#114232"
          color="#fff"
          p="20px"
          borderRadius="8px"
        >
          <Typography variant="h6">
            <strong>Nom et Prénom :</strong> {`${client.name}`}
          </Typography>
          <Typography variant="h6">
            <strong>Email :</strong> {client.email}
          </Typography>
          <Typography variant="h6">
            <strong>Téléphone :</strong> {client.phone}
          </Typography>
        </Box>

        {/* Display Product Info */}
        <Box
          mt="20px"
          p="20px"
          bgcolor="#114232"
          borderRadius="8px"
          color="#fff"
        >
          <Typography variant="h6">
            <strong>ID du produit :</strong> {productId}
          </Typography>
          <Typography variant="h6">
            <strong>Type de Pack :</strong> {productPackType}
          </Typography>
        </Box>
      </Box>

      {/* Stepper */}
      <Stepper
        activeStep={activeStep}
        alternativeLabel
        connector={<StepConnector sx={{ top: "  30%" }} />} // Adjust the connector position
      >
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel
              sx={{
                fontSize: "2rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center", // Center the label and icon vertically
              }}
              StepIconProps={{
                style: { fontSize: "4rem", color: "#114232" },
              }}
            >
              {label}
              {index === 2 && (
                <LocalShippingIcon
                  style={{ marginLeft: 8, fontSize: "2rem", marginTop: 8 }} // Adjust the margin as needed
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
                  setAmountInDT(e.target.value); // Only update if the value is > 0 or empty (to allow clearing the input)
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
            {!taskAssigned ? (
              <Button
                variant="contained"
                color="secondary"
                onClick={handleTaskCreation} // Assign task to the selected staff member
                sx={{ ml: 105 }}
              >
                Accorder cette tache
              </Button>
            ) : (
              <Button
                variant="contained"
                disabled // Disable the button since the task is already assigned
                sx={{
                  ml: 180,
                  backgroundColor: "red",
                  color: "white",
                  "&:hover": { backgroundColor: "darkred" },
                }}
              >
                En cours de livraison
              </Button>
            )}
          </Box>
        )}
      </Box>

      {/* Snackbar for Task Creation */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={7000}
        onClose={handleCloseSnackbar}
        message="Tache créé avec succès"
        sx={{
          "& .MuiSnackbarContent-root": {
            fontSize: "1.5rem", // Increase font size
            padding: "16px 24px", // Increase padding if needed
          },
        }}
      />
      {/* Snackbar for Payment */}
      <Snackbar
        open={paymentSnackbarOpen}
        autoHideDuration={10000} // Same duration as the task snackbar
        onClose={() => setPaymentSnackbarOpen(false)}
        message="Paiement fait avec succès"
        sx={{
          "& .MuiSnackbarContent-root": {
            fontSize: "1.5rem", // Same font size as the task snackbar
            padding: "16px 24px", // Same padding as the task snackbar
          },
        }}
      />

      {/* Dialog for staff selection */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle style={{ color: "green", fontWeight: "bold" }}>
          Choisir un membre du Staff
        </DialogTitle>

        <DialogContent>
          <List>
            {staffList.map((staff, index) => (
              <ListItem key={staff.id}>
                <ListItemButton onClick={() => handleSelectStaff(staff)}>
                  <ListItemText
                    primary={`${index + 1}. ${staff.firstName} ${
                      staff.lastName
                    }`}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>

        <DialogActions>
          <Button color="secondary" onClick={handleCloseDialog}>
            Annuler
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Command;

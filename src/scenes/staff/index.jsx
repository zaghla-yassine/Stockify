import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { useState, useEffect } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const AddStaffForm = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [token, setToken] = useState("");

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

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
      setSnackbarMessage(
        "Échec de la connexion. Veuillez vérifier vos informations d'identification et réessayer."
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    login(); // Login when the component mounts
  }, []);

  const handleFormSubmit = async (values) => {
    if (!token) {
      setSnackbarMessage("Échec de l'authentification. Veuillez réessayer.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      const response = await fetch("http://51.20.144.224:3000/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (response.ok) {
        setSnackbarMessage("Membre du personnel créé avec succès !");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage(
          data.message || "Erreur lors de la création du membre du personnel."
        );
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage("Une erreur est survenue. Veuillez réessayer.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  return (
    <Box m="20px">
      <Header
        title="CRÉER UN MEMBRE DU PERSONNEL"
        subtitle="Ajouter un nouveau membre du personnel"
      />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={staffSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
              }}
            >
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Prénom"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.firstName}
                name="firstName"
                error={!!touched.firstName && !!errors.firstName}
                helperText={touched.firstName && errors.firstName}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Nom"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.lastName}
                name="lastName"
                error={!!touched.lastName && !!errors.lastName}
                helperText={touched.lastName && errors.lastName}
                sx={{ gridColumn: "span 2" }}
              />
              <FormControl
                fullWidth
                variant="filled"
                sx={{ gridColumn: "span 4" }}
              >
                <InputLabel>Sexe</InputLabel>
                <Select
                  name="gender"
                  value={values.gender}
                  onChange={handleChange}
                  error={!!touched.gender && !!errors.gender}
                >
                  <MenuItem value="M">Homme</MenuItem>
                  <MenuItem value="F">Femme</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Numéro de téléphone"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.phoneNumber}
                name="phoneNumber"
                error={!!touched.phoneNumber && !!errors.phoneNumber}
                helperText={touched.phoneNumber && errors.phoneNumber}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="email"
                label="Email"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name="email"
                error={!!touched.email && !!errors.email}
                helperText={touched.email && errors.email}
                sx={{ gridColumn: "span 4" }}
              />
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Ajouter un membre du personnel
              </Button>
            </Box>
          </form>
        )}
      </Formik>

      {/* Snackbar for Success/Error Messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={10000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        sx={{ width: "400px" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{
            width: "100%",
            height: "100px", // Hauteur
            display: "flex", // Flexbox pour alignement
            alignItems: "center", // Centre verticalement
            justifyContent: "center", // Centre horizontalement
            fontWeight: "800", // Très gras
            fontSize: "1.2rem", // Plus grand texte
            textAlign: "center", // Centrer le texte
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

const phoneRegExp = /^\d{8}$/;

const staffSchema = yup.object().shape({
  firstName: yup.string().required("Le prénom est requis"),
  lastName: yup.string().required("Le nom est requis"),
  gender: yup.string().oneOf(["M", "F"]).required("Le sexe est requis"),
  phoneNumber: yup
    .string()
    .matches(phoneRegExp, "Le numéro de téléphone doit comporter 8 chiffres")
    .required("Le numéro de téléphone est requis"),
  email: yup
    .string()
    .email("Adresse e-mail non valide")
    .required("L'e-mail est requis"),
});

const initialValues = {
  firstName: "",
  lastName: "",
  gender: "",
  phoneNumber: "",
  email: "",
};

export default AddStaffForm;

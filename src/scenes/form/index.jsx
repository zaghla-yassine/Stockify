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
import { useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const Form = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleFormSubmit = async (values) => {
    const { firstName, lastName, gender, email, phoneNumber, price, packType } =
      values;

    const payload = {
      createUserDto: { firstName, lastName, gender, email, phoneNumber },
      createProductDto: { price, packType },
    };

    try {
      const response = await fetch(
        "http://localhost:3000/command/create/ClientGuest",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setSnackbarMessage("Utilisateur créé avec succès !");
        setSnackbarSeverity("success");
      } else {
        setSnackbarMessage(
          `Erreur : ${data.message || "Échec de la création de l'utilisateur"}`
        );
        setSnackbarSeverity("error");
      }
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage("Erreur réseau. Veuillez réessayer.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  return (
    <Box m="20px">
      <Header
        title="CRÉER UN UTILISATEUR"
        subtitle="Créer un Nouveau Profil Utilisateur"
      />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={checkoutSchema}
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
              {/* Existing Fields */}
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
                <InputLabel>Genre</InputLabel>
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
                label="Numéro de Téléphone"
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

              {/* New Fields for Price and Pack Type */}
              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Prix"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.price}
                name="price"
                error={!!touched.price && !!errors.price}
                helperText={touched.price && errors.price}
                sx={{ gridColumn: "span 4" }}
              />
              <FormControl
                fullWidth
                variant="filled"
                sx={{ gridColumn: "span 4" }}
              >
                <InputLabel>Type de Pack</InputLabel>
                <Select
                  name="packType"
                  value={values.packType}
                  onChange={handleChange}
                  error={!!touched.packType && !!errors.packType}
                >
                  <MenuItem value="STANDARD">Standard</MenuItem>
                  <MenuItem value="PERSONNALIZED">Personnalisé</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Créer nouveau Client
              </Button>
            </Box>
          </form>
        )}
      </Formik>

      {/* Snackbar for success/error messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={10000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        sx={{ width: "400px" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{
            width: "100%",
            height: "100px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "800",
            fontSize: "1.2rem",
            textAlign: "center",
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

const phoneRegExp = /^\d{8}$/;

const checkoutSchema = yup.object().shape({
  firstName: yup.string().required("Le prénom est requis"),
  lastName: yup.string().required("Le nom est requis"),
  gender: yup.string().oneOf(["M", "F"]).required("Le sexe est requis"),
  phoneNumber: yup
    .string()
    .matches(
      phoneRegExp,
      "Le numéro de téléphone doit comporter exactement 8 chiffres"
    )
    .required("Le numéro de téléphone est requis"),
  email: yup.string().email("Email invalide").required("L'email est requis"),
  price: yup
    .number()
    .required("Le prix est requis")
    .min(0, "Le prix doit être supérieur à 0"),
  packType: yup.string().required("Le type de pack est requis"),
});

const initialValues = {
  firstName: "",
  lastName: "",
  gender: "",
  phoneNumber: "",
  email: "",
  price: "",
  packType: "",
};

export default Form;

import { Box, Typography, IconButton } from "@mui/material";
import Header from "../../components/Header";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import GroupIcon from "@mui/icons-material/Group";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import VisibilityIcon from "@mui/icons-material/Visibility";
import HandshakeIcon from "@mui/icons-material/Handshake";

const Dashboard = () => {
  const theme = useTheme();
  const colors = theme.palette.mode === "light" ? "green" : "green";
  const navigate = useNavigate();

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Bienvenue dans votre dashboard" />
      </Box>

      {/* ICONS GRID */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(3, 1fr)"
        gridGap="40px" // Increased the gap between cards
        mt="40px"
      >
        <IconCard
          icon={<GroupIcon sx={{ fontSize: "60px", color: colors }} />} // Increased icon size
          title="Liste des staffs"
          onClick={() => navigate("/team")}
        />
        <IconCard
          icon={<HandshakeIcon sx={{ fontSize: "60px", color: colors }} />}
          title="Liste des clients"
          onClick={() => navigate("/guests")}
        />
        <IconCard
          icon={<VisibilityIcon sx={{ fontSize: "60px", color: colors }} />}
          title="Liste des visiteurs"
          onClick={() => navigate("/guests")}
        />
        <IconCard
          icon={
            <SupervisorAccountIcon sx={{ fontSize: "60px", color: colors }} />
          }
          title="Ajouter client"
          onClick={() => navigate("/form")}
        />
        <IconCard
          icon={
            <AddCircleOutlineIcon sx={{ fontSize: "60px", color: colors }} />
          }
          title="Ajouter staff"
          onClick={() => navigate("/staff")}
        />

        <IconCard
          icon={<QuestionAnswerIcon sx={{ fontSize: "60px", color: colors }} />}
          title="F.A.Q"
          onClick={() => navigate("/faq")}
        />
      </Box>
    </Box>
  );
};

// Reusable card component with onClick handler
const IconCard = ({ icon, title, onClick }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p="40px" // Increased padding for larger card
      borderRadius="12px" // Increased border radius for rounder edges
      boxShadow="0 8px 16px rgba(0, 0, 0, 0.1)" // Increased shadow for depth
      border="1px solid #ddd"
      sx={{
        cursor: "pointer",
        "&:hover": {
          backgroundColor: "rgba(0, 128, 0, 0.1)",
        },
      }}
      onClick={onClick}
    >
      <IconButton sx={{ fontSize: "60px" }}>{icon}</IconButton>{" "}
      {/* Larger icon size */}
      <Typography variant="h5" color="textPrimary" sx={{ mt: 2 }}>
        {" "}
        {/* Larger text */}
        {title}
      </Typography>
    </Box>
  );
};

export default Dashboard;

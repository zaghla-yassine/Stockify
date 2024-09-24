import { Box, IconButton, useTheme } from "@mui/material";
import { useContext } from "react";
import { ColorModeContext, tokens } from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";

const Topbar = () => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  return (
    <Box
      display="flex"
      justifyContent="flex-end"
      alignItems="center"
      margin={5}
    >
      <IconButton onClick={colorMode.toggleColorMode}>
        {theme.palette.mode === "dark" ? (
          <DarkModeOutlinedIcon sx={{ fontSize: 30 }} />
        ) : (
          <LightModeOutlinedIcon sx={{ fontSize: 30 }} />
        )}
      </IconButton>
      {/* Uncomment if you want to include notifications and settings icons */}
      {/* <IconButton>
        <NotificationsOutlinedIcon sx={{ fontSize: 30 }} />
      </IconButton> */}
      {/* <IconButton>
        <SettingsOutlinedIcon sx={{ fontSize: 30 }} />
      </IconButton> */}
      <IconButton>
        <PersonOutlinedIcon sx={{ fontSize: 30 }} />
      </IconButton>
    </Box>
  );
};

export default Topbar;

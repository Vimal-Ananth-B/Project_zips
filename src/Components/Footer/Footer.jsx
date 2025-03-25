import { Box, Container, Typography, Link } from "@mui/material";

const Footer = () => {
  return (
    <Box
      sx={{
        background: "linear-gradient(to right, #1E293B, #111827)",
        color: "white",
        py: 2,
        textAlign: "center",
        mt: "auto", 
        // Push footer to the bottom
      }}
    >
      <Container maxWidth="lg" sx={{position:'sticky'}}>
        <Typography variant="body2">
          © {new Date().getFullYear()} Kanban Task Manager. All rights reserved.
        </Typography>
        <Box sx={{ mt: 1 }}>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;

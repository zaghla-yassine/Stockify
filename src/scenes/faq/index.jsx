import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { tokens } from "../../theme";
import Header from "../../components/Header";

const FAQ = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // State for FAQs
  const [faqs, setFaqs] = useState([]);

  // State for new FAQ input
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });

  // State for editing FAQ
  const [editFaqId, setEditFaqId] = useState(null);
  const [editFaq, setEditFaq] = useState({ question: "", answer: "" });

  // Fetch FAQs from the backend
  useEffect(() => {
    axios
      .get("http://localhost:3000/faqs")
      .then((response) => {
        setFaqs(response.data);
      })
      .catch((error) => {
        console.error("Error fetching FAQs:", error);
      });
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    setNewFaq({ ...newFaq, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditFaq({ ...editFaq, [e.target.name]: e.target.value });
  };

  // Add a new FAQ
  const handleAddFaq = () => {
    axios
      .post("http://localhost:3000/faqs", newFaq)
      .then((response) => {
        setFaqs([...faqs, response.data]);
        setNewFaq({ question: "", answer: "" });
      })
      .catch((error) => {
        console.error("Error adding FAQ:", error);
      });
  };

  // Update an FAQ
  const handleUpdateFaq = (id) => {
    axios
      .put(`http://localhost:3000/faqs/${id}`, editFaq)
      .then((response) => {
        setFaqs(faqs.map((faq) => (faq.id === id ? response.data : faq)));
        setEditFaqId(null);
      })
      .catch((error) => {
        console.error("Error updating FAQ:", error);
      });
  };

  // Delete an FAQ
  const handleDeleteFaq = (id) => {
    axios
      .delete(`http://localhost:3000/faqs/${id}`)
      .then(() => {
        setFaqs(faqs.filter((faq) => faq.id !== id));
      })
      .catch((error) => {
        console.error("Error deleting FAQ:", error);
      });
  };

  // Toggle Edit Mode
  const handleEditFaqClick = (faq) => {
    setEditFaqId(faq.id);
    setEditFaq({ question: faq.question, answer: faq.answer });
  };

  return (
    <Box m="20px">
      <Header title="FAQ" subtitle="Questions Fréquemment Posées" />

      {/* FAQ list */}
      {faqs.map((faq, index) => (
        <Accordion key={faq.id} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography color={colors.greenAccent[200]} variant="h5">
              {index + 1}. {faq.question}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" style={{ fontSize: "1.2rem" }}>
              {faq.answer}
            </Typography>
            <Box mt={2}>
              {/* Edit Button */}
              <Button
                variant="outlined"
                style={{ backgroundColor: "#114232", color: "white" }}
                onClick={() => handleEditFaqClick(faq)}
              >
                Edit
              </Button>
              {/* Delete Button */}
              <Button
                variant="outlined"
                style={{ backgroundColor: "#114232", color: "white" }}
                onClick={() => handleDeleteFaq(faq.id)}
                sx={{ ml: 2 }}
              >
                Delete
              </Button>
            </Box>
          </AccordionDetails>
          {editFaqId === faq.id && (
            <Box p={2} mt={2} border="1px solid #ccc">
              <TextField
                name="question"
                label="Question"
                value={editFaq.question}
                onChange={handleEditChange}
                fullWidth
                margin="normal"
              />
              <TextField
                name="answer"
                label="Answer"
                value={editFaq.answer}
                onChange={handleEditChange}
                fullWidth
                margin="normal"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleUpdateFaq(faq.id)}
              >
                Save
              </Button>
            </Box>
          )}
        </Accordion>
      ))}
      {/* Add new FAQ form */}
      <Box mb={2}>
        <Typography variant="h6">Add a New FAQ</Typography>
        <TextField
          name="question"
          label="Question"
          value={newFaq.question}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          name="answer"
          label="Answer"
          value={newFaq.answer}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <Button variant="contained" color="secondary" onClick={handleAddFaq}>
          Add FAQ
        </Button>
      </Box>
    </Box>
  );
};

export default FAQ;

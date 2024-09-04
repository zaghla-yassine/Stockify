import React, { useState } from "react";
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
  const [faqs, setFaqs] = useState([
    {
      id: 1,
      question: "Combien coûte un biodigesteur ?",
      answer:
        "Nos tarifs pour les biodigesteurs varient selon la taille du réacteur et comprennent un package de diagnostic—basé sur une évaluation personnalisée des besoins énergétiques et en engrais de chaque ferme—l'installation, la formation des utilisateurs. De plus, nous offrons un service de monitoring intelligent et à distance pour optimiser le fonctionnement et la performance de votre biodigesteur.",
    },
    {
      id: 2,
      question: "Comment fonctionne un digesteur ?",
      answer:
        "MEPS fonctionne grâce à la digestion anaérobie de la matière organique. Il vous suffit de verser du fumier animal ou des déchets alimentaires dans l’évier d’entrée du système. Les bactéries présentes s’occuperont du reste : elles transformeront les déchets organiques en biogaz, créant ainsi une source d’énergie renouvelable à partir de vos déchets !",
    },
    {
      id: 3,
      question:
        "Quels types de déchets animaux conviennent pour alimenter un biodigesteur, et quel est le nombre minimum d'animaux nécessaire pour commencer ?",
      answer:
        "Notre biodigesteur peut traiter efficacement les déchets de divers animaux tels que les cochons, les moutons, les lapins, les chèvres et les chevaux, mais il fonctionne encore mieux avec le fumier de vaches et de porcs. De plus, il peut également gérer les déchets humains et les matières végétales.",
    },
    {
      id: 4,
      question: "Le biogaz est-il sûr, et y a-t-il un risque d'explosion ?",
      answer:
        "Le biogaz est généralement sécurisé et ne comporte pas de risque d'explosion. Cependant, comme pour toutes les sources d'énergie, une mauvaise manipulation peut entraîner des brûlures. Il est donc crucial de rester prudent lors de l'allumage et de l'utilisation du biogaz. Pour des informations détaillées, veuillez consulter le manuel d'utilisation.",
    },
    {
      id: 5,
      question: "Le système dégage-t-il une odeur ?",
      answer:
        "En général, il n'y a pas d'odeur. Cependant, si une odeur se fait sentir, cela indique qu'il est temps de remplacer le filtre.",
    },
    {
      id: 6,
      question: "Est-il insalubre de cuisiner avec du biogaz ?",
      answer:
        "Cuisiner avec du biogaz est sanitaire, car il ne contient pas de bactéries et ne dégage pas d'odeurs. Les agents pathogènes sont partiellement neutralisés pendant le processus de digestion et ont peu de chances de passer par la ligne de biogaz. De plus, tout pathogène potentiel serait éliminé par la flamme du brûleur pendant la cuisson.",
    },
  ]);

  // State for new FAQ input
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });

  // State for editing FAQ
  const [editFaqId, setEditFaqId] = useState(null);
  const [editFaq, setEditFaq] = useState({ question: "", answer: "" });

  // Handle input changes
  const handleInputChange = (e) => {
    setNewFaq({ ...newFaq, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditFaq({ ...editFaq, [e.target.name]: e.target.value });
  };

  // Add a new FAQ
  const handleAddFaq = () => {
    const newId = faqs.length + 1;
    setFaqs([...faqs, { ...newFaq, id: newId }]);
    setNewFaq({ question: "", answer: "" });
  };

  // Update an FAQ
  const handleUpdateFaq = (id) => {
    setFaqs(faqs.map((faq) => (faq.id === id ? { ...editFaq, id } : faq)));
    setEditFaqId(null);
  };

  // Delete an FAQ
  const handleDeleteFaq = (id) => {
    setFaqs(faqs.filter((faq) => faq.id !== id));
  };

  return (
    <Box m="20px">
      <Header title="FAQ" subtitle="Questions Fréquemment Posées" />

      {/* FAQ list */}
      {faqs.map((faq) => (
        <Accordion key={faq.id} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography color={colors.greenAccent[500]} variant="h5">
              {faq.question}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>{faq.answer}</Typography>
            <Box mt={2}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  setEditFaqId(faq.id);
                  setEditFaq({
                    question: faq.question,
                    answer: faq.answer,
                  });
                }}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="secondary"
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

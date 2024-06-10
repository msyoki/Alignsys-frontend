import React, { useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const CustomAccordion = () => {
  const [selectedIndex, setSelectedIndex] = useState(null);

  const handleAccordionChange = (index) => (event, isExpanded) => {
    setSelectedIndex(isExpanded ? index : null);
  };

  return (
    <Box>
      {['Item 1', 'Item 2', 'Item 3'].map((item, index) => (
        <Accordion
          key={index}
          expanded={selectedIndex === index}
          onChange={handleAccordionChange(index)}
          sx={{
            border: selectedIndex === index ? '2px solid #3f51b5' : '1px solid rgba(0, 0, 0, .125)',
            '&:not(:last-child)': {
              borderBottom: selectedIndex === index ? '2px solid #3f51b5' : '1px solid rgba(0, 0, 0, .125)',
            },
            '&::before': {
              display: 'none',
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel${index}a-content`}
            id={`panel${index}a-header`}
            sx={{
              bgcolor: selectedIndex === index ? 'rgba(63, 81, 181, 0.1)' : 'inherit',
            }}
          >
            <Typography>{item}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.
            </Typography>
          </AccordionDetails>
        </Accordion>





      ))}
    </Box>
  );
};

export default CustomAccordion;

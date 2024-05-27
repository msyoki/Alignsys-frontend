import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles'; // Import ThemeProvider and createTheme
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';

const theme = createTheme(); // Create a theme instance

export default function TransitionAlerts(props) {
 

  return (
    <ThemeProvider theme={theme}> {/* Wrap your component with ThemeProvider */}
      <Box sx={{ width: '100%' }} >
        <Collapse in={props.open}>
          <Alert
            severity={props.alertSeverity}
            style={{fontSize:'11.5px'}}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  props.setOpen(false);
                }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{ mb: 2}}
          >
            {props.alertmsg}
          </Alert>
        </Collapse>
        {/* <Button
          disabled={props.open}
          variant="outlined"
          onClick={() => {
            props.setOpen(true);
          }}
        >
          Re-open
        </Button> */}
      </Box>
    </ThemeProvider>
  );
}

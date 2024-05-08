import * as React from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';

// import CloseIcon from '@mui/icons-material/Close';


export default function Alerts(props) {

  return (
    <Box sx={{ width: '100%' ,text:'center'}}>
      <Collapse in={props.openalert}>
        <Alert
          severity={props.alertseverity}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                props.setOpenAlert(false);
              }}

            >
              {/* <CloseIcon fontSize="inherit" /> */}
            </IconButton>
          }
          // sx={{ mb: 1 }}
        >
          <small>{props.alertmsg}</small>
        </Alert>
      </Collapse>

    </Box>

  );
}

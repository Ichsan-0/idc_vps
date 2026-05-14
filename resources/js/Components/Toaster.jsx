import { Alert, Slide, Snackbar } from '@mui/material';
import React, { useState, useEffect } from 'react';

const SlideTransition = (props) => {
  return <Slide {...props} direction="down" />;
};

const Toaster = ({ message, openToaster, onClose, severity = "success" }) => {
  const [open, setOpen] = useState(openToaster);

  useEffect(() => {
    setOpen(openToaster);
  }, [openToaster]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
    onClose();
  };

  return (
    <Snackbar
      key={SlideTransition}
      TransitionComponent={SlideTransition}
      open={open}
      autoHideDuration={3000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={handleClose} severity={severity}  variant="standard" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Toaster;

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

const ConfirmDialog = ({ open, title, content, onClose, onConfirm }) => {
  return (
    <Dialog open={open} onClose={() => onClose()}>
      <DialogTitle>{title || '¿Estás seguro?'}</DialogTitle>
      <DialogContent>
        <Typography>{content || 'Esta acción no se puede deshacer.'}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Cancelar</Button>
        <Button onClick={() => onConfirm()} autoFocus>
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;

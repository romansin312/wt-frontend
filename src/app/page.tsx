'use client'
import { Box, Button, Modal, TextField, Typography } from "@mui/material";
import { redirect } from "next/dist/client/components/redirect";
import Image from "next/image";
import { useState } from "react";

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function Home() {
  const [open, setOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>("");

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleCreate = () => {
    const body = {
      videoUrl
    }

    fetch(`http://localhost:4000/rooms/create`, {
      body: JSON.stringify(body),
      method: 'POST'
    }).then(() => {
      redirect("/subfolder")
    });
  }

  return (
    <>
      <Button variant="contained" onClick={handleOpen}>Create a new room</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Box sx={{ pb: 2 }}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Create a new room
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              Please enter a video URL for your room
            </Typography>
            <TextField value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} fullWidth id="outlined-basic" variant="outlined" />
          </Box>
          <Button variant="contained" onClick={handleCreate}>Create</Button>
        </Box>
      </Modal>
    </>
  );
}

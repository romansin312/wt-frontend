import { Box, Button, Modal, TextField, Typography, Grid, Alert } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import type { Route } from "./+types/home";
import { useNavigate } from "react-router";
import { RoomService } from "~/services/rooms-service";

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

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "WT App" }, ,
  ];
}

export default function Home() {
  const roomService = useMemo(() => new RoomService(), []);
  const [isModalOpened, setIsModalOpened] = useState(false);
  let navigate = useNavigate();
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");
  const [alertText, setAlertText] = useState<string>("");

  const handleOpen = () => setIsModalOpened(true);
  const handleClose = () => setIsModalOpened(false);

  const handleCreate = () => {
    roomService.createRoom(videoUrl).then((newId) => navigate(`/room/${newId}`));
  }

  const handleFind = () => {
    roomService.getRoom(roomId)
      .then(r => {
        return navigate(`/room/${roomId}`)
      })
      .catch(err => {
        setAlertText("The room is not found");
      })
  }

  const renderModal = useCallback(() => <Modal
    open={isModalOpened}
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
  </Modal>, [isModalOpened, handleClose]);

  const renderAlert = useCallback(() => <Alert severity="error" onClose={() => setAlertText("")}>
    {alertText}
  </Alert>, [alertText]);

  return (
    <>
      <Box width={"100%"}>
        <Button variant="contained" onClick={handleOpen} fullWidth>Create a new room</Button>

        <Grid mb={2} mt={8} container spacing={1}>
          <Grid size={8}>
            <TextField size="small" label="Or enter an existing room ID" value={roomId} onChange={(e) => setRoomId(e.target.value)} fullWidth id="outlined-basic" variant="outlined" />
          </Grid>

          <Grid size={4}>
            <Button variant="contained" onClick={handleFind} fullWidth>Find</Button>
          </Grid>
        </Grid>
        {alertText && renderAlert()}
      </Box>
      {renderModal()}
    </>
  );
}

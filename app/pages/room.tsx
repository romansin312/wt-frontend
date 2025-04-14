import { Alert, type AlertColor, Snackbar } from "@mui/material";
import { BASE_URL } from "config";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactPlayer from "react-player";
import type { OnProgressProps } from "react-player/base";
import { useParams } from "react-router";
import { RoomService } from "~/services/rooms-service";

enum Actions {
  'Pause',
  'Play',
  'Progress',
  'UserConnected',
  'UserDisconnected'
}

interface WsMessage {
  ActionType: Actions,
  ActionInfo: string,
  Timestamp: number,
  SenderUserId: number,
  RoomId: string
}


export default function Room() {
  const roomService = useMemo(() => new RoomService(), []);

  const params = useParams();

  const [hasWindow, setHasWindow] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("success")
  const playerRef = useRef<ReactPlayer>(null);
  const [playing, setPlaying] = useState(false);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [videoUrl, setVideoUrl] = useState("")
  const [roomId, setRoomId] = useState("")
  const ws = useRef<WebSocket>(null);
  const [lastSentMessageTimestamp, setLastSentMessageTimestamp] = useState(0);
  const [lastReceivedMessageTimestamp, setLastReceivedMessageTimestamp] = useState(0);

  const userId = useMemo(() => Math.floor(Math.random() * 1000), []);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasWindow(true);
    }

    let roomId = params.roomId;
    if (roomId) {
      roomService.getRoom(roomId).then(room => {
        setVideoUrl(room.VideoUrl);
      });
      setRoomId(roomId);
    }

    if(ws.current == null) {
      ws.current = new WebSocket(`ws://${BASE_URL}/room/${roomId}/subscribe?userId=${userId}`);
      ws.current.onopen = function (event) {
        console.log("Connected to WebSocket server");
      };
    }

  }, [userId]);

  useEffect(() => {
    if (ws.current == null)
      return;

    ws.current.onmessage = function (event) {
      if(event.data == "Ping") {
        return;
      }

      let message = JSON.parse(event.data) as WsMessage;
      console.log("Received: " + event.data);
      console.log(message.SenderUserId, userId);
      if (message.SenderUserId == userId) {
        console.log("that is the current user, skip");
        return;
      }

      if (lastSentMessageTimestamp > message.Timestamp) {
        return;
      }

      if (lastReceivedMessageTimestamp > message.Timestamp) {
        return;
      }

      setLastReceivedMessageTimestamp(message.Timestamp);

      switch (message.ActionType) {
        case Actions.Pause:
          setPlaying(false);
          break;

        case Actions.Play:
          setPlaying(true);
          break;

        case Actions.Progress:
          let seconds = parseInt(message.ActionInfo);
          const secondsDiff = Math.abs(seconds - playedSeconds);
          console.log('playedSeconds: ' + playedSeconds + ', seconds diff: ' + secondsDiff)
          if (secondsDiff > 1) {
            setPlayedSeconds(seconds);
            playerRef.current?.seekTo(seconds);
          }
          break;
          
        case Actions.UserConnected:
          setSnackbarSeverity("success");
          setSnackbarMessage(`The user ${message.SenderUserId} has been connected`)
          break;

        case Actions.UserDisconnected:
          setSnackbarSeverity("warning");
          setSnackbarMessage(`The user ${message.SenderUserId} has been disconnected`)
          break;
      }
    };
  }, [ws, playedSeconds, userId])

  const sendAction = useCallback((actionType: Actions, actionInfo: string = "") => {
    let timestamp = Date.now();
    let body: WsMessage = {
      ActionType: actionType,
      ActionInfo: actionInfo,
      Timestamp: timestamp,
      SenderUserId: userId,
      RoomId: roomId
    };

    ws.current?.send(JSON.stringify(body))
  }, [roomId, userId, ws.current]);

  function onProgressHandler(progressProps: OnProgressProps): void {
    console.log(progressProps);
    setPlayedSeconds(progressProps.playedSeconds);
    sendAction(Actions.Progress, progressProps.playedSeconds.toString());
  }

  function pauseHandler() {
    setPlaying(false);
    sendAction(Actions.Pause);
  };

  function playHandler() {
    setPlaying(true);
    sendAction(Actions.Play);
  };

  return (
    <>
      {hasWindow &&
        <ReactPlayer
          url={videoUrl}
          controls={true}
          onPause={pauseHandler}
          onProgress={onProgressHandler}
          onPlay={playHandler}
          ref={playerRef}
          playing={playing}
        />}

      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={!!snackbarMessage}
        onClose={() => setSnackbarMessage("")}
      >
        <Alert
          onClose={() => setSnackbarMessage("")}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

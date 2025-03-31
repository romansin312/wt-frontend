'use client';
import { useEffect, useMemo, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { OnProgressProps } from "react-player/base";

enum Actions {
  'Pause',
  'Play',
  'Progress'
}

interface WsMessage {
  ActionType: Actions,
  ActionInfo: string,
  Timestamp: number,
  SenderUserId: number
}

export default function Sub() {
  const [hasWindow, setHasWindow] = useState(false);
  const playerRef = useRef<ReactPlayer>(null);
  const [playing, setPlaying] = useState(false);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const ws = useRef<WebSocket>(null);
  const [lastSentMessageTimestamp, setLastSentMessageTimestamp] = useState(0);
  const [lastReceivedMessageTimestamp, setLastReceivedMessageTimestamp] = useState(0);

  const userId = useMemo(() =>  Math.floor(Math.random() * 1000), []);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasWindow(true);
    }

    ws.current = new WebSocket("ws://localhost:4000/room/12345/subscribe");

    ws.current.onopen = function (event) {
      console.log("Connected to WebSocket server");
    };
  }, []);

  useEffect(() => {
    if(ws.current == null) 
      return;

    ws.current.onmessage = function (event) {
      let message = JSON.parse(event.data) as WsMessage;
      console.log("Received: " + event.data);
      console.log(message.SenderUserId, userId);
      if(message.SenderUserId == userId) {
        console.log("that is the current user, skip");
        return;
      }

      if(lastSentMessageTimestamp > message.Timestamp) {
        return;
      }

      if(lastReceivedMessageTimestamp > message.Timestamp) {
        return;
      }

      setLastReceivedMessageTimestamp(message.Timestamp);
      if (message.ActionType == Actions.Pause) {
        setPlaying(false);
      } else if (message.ActionType == Actions.Play) {
        setPlaying(true)
      } 
      else if (message.ActionType == Actions.Progress) {
        let seconds = parseInt(message.ActionInfo);
        const secondsDiff = Math.abs(seconds - playedSeconds);
        console.log('playedSeconds: ' + playedSeconds + ', seconds diff: ' + secondsDiff)
        if(secondsDiff > 0.5) {
          setPlayedSeconds(seconds);
          playerRef.current?.seekTo(seconds);
        }
      }
    };
  }, [ws, playedSeconds, userId])

  const sendAction = (actionType: Actions, actionInfo: string = "") => {
    let timestamp = Date.now();
    let body: WsMessage = {
      ActionType: actionType,
      ActionInfo: actionInfo,
      Timestamp: timestamp,
      SenderUserId: userId
    };
    fetch(`http://localhost:4000/room/12345/action`, {
      body: JSON.stringify(body),
      method: 'POST'
    }).then(() => {
      setLastSentMessageTimestamp(timestamp);
    });
  }

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
    <div>
      {hasWindow &&
        <ReactPlayer
          url={'https://youtu.be/LXb3EKWsInQ?si=ZC8mG-PE_0ME95CN'}
          controls={true}
          onSeek={sec => console.log("SEC: " + sec)}
          onDuration={dur => console.log("DUR: " + dur)}
          onPause={pauseHandler}
          onProgress={onProgressHandler}
          onPlay={playHandler}
          ref={playerRef}
          playing={playing}

        />}
    </div>
  );
}

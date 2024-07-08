import { useSocket } from "@/context/socket";
import usePeer from "@/hooks/usePeer";
import useMediaStream from "@/hooks/useMediaStream";
import Player from "@/components/Player";
import Bottom from "@/components/Bottom";
import { useEffect } from "react";
import usePlayer from "@/hooks/usePlayer";
import CopySection from "@/components/CopyPanel";
import styles from "@/styles/room.module.css";
import { useRouter } from "next/router";
import { useState } from "react";
import { cloneDeep, set } from "lodash";

const Room = () => {
  const socket = useSocket();
  const { roomId } = useRouter().query;
  const { peer, myId } = usePeer();
  const { stream } = useMediaStream();
  const [users, setUsers] = useState([]);
  const {
    players,
    setPlayers,
    highlightedPlayer,
    nonHighlightedPlayers,
    toggleAudio,
    toggleVideo,
    leaveRoom,
  } = usePlayer(myId, roomId, peer);

  // connecting to room
  useEffect(() => {
    if (!socket || !stream || !peer) return;
    const handleUserConnected = newUserId => {
      console.log(`user connected in room with useId ${newUserId}`);

      const call = peer.call(newUserId, stream);
      call.on("stream", incomingStream => {
        console.log(`incoming stream from ${newUserId}`);
        setPlayers(prev => ({
          ...prev,
          [newUserId]: {
            url: incomingStream,
            muted: false,
            playing: true,
          },
        }));
        setUsers(prev => ({
          ...prev,
          [newUserId]: call,
        }));
      });
    };
    socket.on("user-connected", handleUserConnected);
    return () => {
      socket.off("user-connected", handleUserConnected);
    };
  }, [peer, socket, stream, setPlayers]);

  // calling newly added user in room
  useEffect(() => {
    if (!peer || !stream) return;
    peer.on("call", call => {
      // incoming call callerId
      const { peer: callerId } = call;

      // asnwering call by passing it's own stream
      call.answer(stream);

      //listening to incoming stream
      call.on("stream", incomingStream => {
        console.log(`incoming stream from ${callerId}`);
        setPlayers(prev => ({
          ...prev,
          [callerId]: {
            url: incomingStream,
            muted: false,
            playing: true,
          },
        }));
        setUsers(prev => ({
          ...prev,
          [callerId]: call,
        }));
      });
    });
  }, [peer, stream, setPlayers]);

  // handling and adding players or streams
  useEffect(() => {
    if (!stream || !myId) return;
    console.log(`setting my stream ${myId} in players`);
    setPlayers(prev => ({
      ...prev,
      [myId]: {
        url: stream,
        muted: false,
        playing: true,
      },
    }));
  }, [myId, setPlayers, stream]);

  //handling for toggling video and audio(control panel stuff)
  useEffect(() => {
    if (!socket) return;

    const handleToggleVideo = userId => {
      console.log(`user with id ${userId} has toggled video`);
      setPlayers(prev => {
        const copy = cloneDeep(prev);
        copy[userId].playing = !copy[userId].playing;
        return { ...copy };
      });
    };

    const handleToggleAudio = userId => {
      console.log(`user with id ${userId} has toggled audio`);
      setPlayers(prev => {
        const copy = cloneDeep(prev);
        copy[userId].muted = !copy[userId].muted;
        return { ...copy };
      });
    };

    const handleUserLeave = userId => {
      console.log(`user ${userId} is leaving the room`);
      users[userId]?.close();
      const playersCopy = cloneDeep(players);
      delete playersCopy[userId];
      setPlayers(playersCopy);
    };

    socket.on("user-toggle-video", handleToggleVideo);
    socket.on("user-toggle-audio", handleToggleAudio);
    socket.on("user-leave", handleUserLeave);

    return () => {
      socket.off("user-toggle-video", handleToggleVideo);
      socket.off("user-toggle-audio", handleToggleAudio);
      socket.off("user-leave", handleUserLeave);
    };
  }, [socket, setPlayers, users, players]);

  return (
    <>
      <div className={styles.activePlayerContainer}>
        {highlightedPlayer && (
          <Player
            url={highlightedPlayer.url}
            muted={highlightedPlayer.muted}
            playing={highlightedPlayer.playing}
            isActive
          />
        )}
      </div>
      <div className={styles.inActivePlayerContainer}>
        {Object.keys(nonHighlightedPlayers).map(playerId => {
          const { url, playing, muted } = nonHighlightedPlayers[playerId];
          return (
            <Player
              key={playerId}
              url={url}
              muted={muted}
              playing={playing}
              isActive={false}
            />
          );
        })}
      </div>
      <CopySection roomId={roomId} />
      <Bottom
        muted={highlightedPlayer?.muted}
        playing={highlightedPlayer?.playing}
        toggleAudio={toggleAudio}
        toggleVideo={toggleVideo}
        leaveRoom={leaveRoom}
      ></Bottom>
    </>
  );
};
export default Room;

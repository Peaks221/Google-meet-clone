import { useSocket } from "@/context/socket";
import { cloneDeep } from "lodash";
import { useState } from "react";
import { useRouter } from "next/router";

const usePlayer = (myId, roomId, peer) => {
  const socket = useSocket();
  const [players, setPlayers] = useState({});
  const playersCopy = cloneDeep(players);
  const highlightedPlayer = playersCopy[myId];
  delete playersCopy[myId];
  const nonHighlightedPlayers = playersCopy;
  const router = useRouter();

  const leaveRoom = () => {
    socket.emit("user-leave", myId, roomId);
    console.log("leaving room", roomId);
    peer?.disconnect();
    router.push("/");
  };

  const toggleAudio = () => {
    console.log(`${myId} has toggled audio`);
    setPlayers(prev => {
      const copy = cloneDeep(prev);
      copy[myId].muted = !copy[myId].muted;
      return { ...copy };
    });
    socket.emit("user-toggle-audio", myId, roomId);
  };

  const toggleVideo = () => {
    console.log(`${myId} has toggled video`);
    setPlayers(prev => {
      const copy = cloneDeep(prev);
      copy[myId].playing = !copy[myId].playing;
      return { ...copy };
    });
    socket.emit("user-toggle-video", myId, roomId);
  };

  return {
    players,
    setPlayers,
    highlightedPlayer,
    nonHighlightedPlayers,
    toggleAudio,
    toggleVideo,
    leaveRoom,
  };
};
export default usePlayer;

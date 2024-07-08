import { useSocket } from "@/context/socket";
import { useRouter } from "next/router";

const { useState, useEffect, useRef } = require("react");
const usePeer = () => {
  const [peer, setPeer] = useState(null);
  const [myId, setMyId] = useState("");
  const isPeerSet = useRef(false);
  const socket = useSocket();
  // this will return the roomId for the room
  const roomId = useRouter().query.roomId;

  useEffect(() => {
    if (isPeerSet.current || !roomId || !socket) return;
    isPeerSet.current = true;
    (async function initPeer() {
      const myPeer = new (await import("peerjs")).default();
      setPeer(myPeer);

      myPeer.on("open", id => {
        console.log("my id is ", id);
        setMyId(id);
        socket.emit("join-room", roomId, id);
      });
    })();
  }, [roomId, socket]);
  return {
    peer,
    myId,
  };
};
export default usePeer;

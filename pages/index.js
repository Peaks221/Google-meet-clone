import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/router";
import styles from "@/styles/home.module.css";
import { useState } from "react";
export default function Home() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  const createAndJoin = () => {
    const roomId = uuidv4();
    router.push(`/${roomId}`);
  };

  const joinRoom = () => {
    if (roomId) {
      router.push(`/${roomId}`);
    } else {
      alert("please provide a valid room id");
    }
  };
  return (
    <div className={styles.homeContainer}>
      <h1>Google Meet Clone</h1>
      <div className={styles.enterRoom}>
        <input
          type="text"
          value={roomId}
          placeholder="Enter a Room Id"
          onChange={e => {
            setRoomId(e?.target?.value);
          }}
        ></input>
        <button onClick={joinRoom}>Join a room</button>
      </div>
      <span className={styles.separatorText}>
        ---------------OR-----------------
      </span>
      <div>
        <button onClick={createAndJoin}>Create a new room</button>
      </div>
    </div>
  );
}

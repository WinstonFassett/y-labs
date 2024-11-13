import { Avatar } from "@/components/ui/avatar";
import { useStore } from "@nanostores/react";
import { atom } from "nanostores";
import { ShareDialog } from "./ShareDialog";
import { useDocCollabStore } from "./useDocCollabStore";

export function AppBarCollab() {
  const { $room } = useDocCollabStore();
  const collabRoom = useStore($room || atom(undefined));
  const peers = collabRoom?.peerIds ?? [];
  const awarenessClientID = $room?.provider?.awareness.clientID;
  const awarenessUsers = useStore($room?.$awarenessStates ?? atom(new Map()));
  return (
    <>
      {Array.from(awarenessUsers).map(([peerId, entry]) => {
        const isYou = peerId === awarenessClientID;
        if (isYou) return null;
        const {
          user: { color, userName },
        } = entry;
        return (
          <Avatar
            key={peerId}
            alt={userName}
            title={userName}
            src={
              // `https://i.pravatar.cc/150?u=${peerId}`
              `https://avatar.vercel.sh/${userName}?size=32`
            }
          />
        );
      })}

      <ShareDialog />
    </>
  );
}

export default AppBarCollab;

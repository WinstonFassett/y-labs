import { Avatar } from "@/components/ui/avatar";
import { useStore } from "@nanostores/react";
import { atom } from "nanostores";
import { ShareDialog } from "./ShareDialog";
import { useDocCollabStore } from "./useDocCollabStore";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useStoreIfPresent } from "./useStoreIfPresent";

export function AppBarCollab() {
  const { $room, $roomConfig } = useDocCollabStore();
  const roomConfigMaybe = useStoreIfPresent($roomConfig);
  const isSharing = roomConfigMaybe?.enabled ?? false;
  const collabRoom = useStoreIfPresent($room);
  const peers = collabRoom?.peerIds ?? [];
  const awarenessClientID = $room?.provider?.awareness.clientID;
  const awarenessUsers = useStoreIfPresent($room?.$awarenessStates);
  return (
    <>
      { !isSharing ? <></> : Array.from(awarenessUsers??[]).map(([peerId, entry]) => {
        // console.log({ peerId, awarenessClientID })
        const isYou = peerId === awarenessClientID
        if (isYou) return <div key="you"></div>;
        const {
          user: { color, username },
        } = entry;
        return (
          <Avatar
            key={peerId}
            >
            <AvatarImage 
              alt={username}
              title={username}            
              src={
                // `https://i.pravatar.cc/150?u=${peerId}`
                `https://avatar.vercel.sh/${username}?size=32`
              }/>
            {/* <AvatarFallback>Yo</AvatarFallback> */}
          </Avatar>
        );
      })}

      <ShareDialog />
    </>
  );
}

export default AppBarCollab;

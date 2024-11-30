import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { useDocCollabStore } from "./useDocCollabStore";
import { useStoreIfPresent } from "./useStoreIfPresent";

export function AppBarCollab() {
  const { $room, $roomConfig } = useDocCollabStore();
  const roomConfigMaybe = useStoreIfPresent($roomConfig);
  const isSharing = roomConfigMaybe?.enabled ?? false;
  const awarenessClientID = $room?.awareness.clientID;
  const awarenessUsers = useStoreIfPresent($room?.$awarenessStates);
  return (
    <>
      { !isSharing ? <></> : Array.from(awarenessUsers??[]).map(([peerId, entry]) => {
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
          </Avatar>
        );
      })}
    </>
  );
}

export default AppBarCollab;

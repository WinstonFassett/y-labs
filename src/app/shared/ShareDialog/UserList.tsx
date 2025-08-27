import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { $user } from "../store/local-user";
import { UserForm } from "./UserForm";

interface UserListProps {
  isSharing: boolean;
  peerIds: string[];
  awarenessUsers: Map<string, any> | Map<any, any>;
  awarenessClientID: number | undefined;
}

export function UserList({
  isSharing,
  peerIds,
  awarenessUsers,
  awarenessClientID,
}: UserListProps) {
  const userInfo = $user.get();
  const connectedCount = peerIds?.length ?? 0;
  
  return (
    <div>
      {isSharing && (
        <div>
          <div>You are sharing as:</div>
          {!!userInfo && (
            <div>
              <UserForm />
              <User
                name={userInfo.username ?? "Anonymous"}
                description="YOU"
                avatarProps={{
                  src: `https://avatar.vercel.sh/${userInfo.username}?size=32`,
                }}
              />
            </div>
          )}
          
          <div>{connectedCount} peer{connectedCount !== 1 ? 's' : ''} connected</div>
          
          {!!awarenessUsers &&
            Array.from(awarenessUsers).map(([peerId, awareness]) => {
              const data = awareness.user;
              if (!data) {
                return (
                  <div key={peerId}>
                    Missing data {peerId}: {JSON.stringify(data)}
                  </div>
                );
              }
              const { username, name, color } = data;
              const bestName = username ?? name;
              const isYou = peerId === awarenessClientID;
              if (isYou) return <div key={peerId}></div>;
              return (
                <div key={peerId}>
                  <User
                    className="py-4"
                    key={peerId}
                    name={bestName ? <UserName {...{ username: bestName, color }} /> : peerId}
                    description={isYou ? "YOU" : ''}                        
                    avatarProps={{
                      src: `https://avatar.vercel.sh/${username}?size=32`,
                    }}
                  />
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

function UserName({ username, color }: { username: string; color: string }) {
  return <span style={{ color }}>{username}</span>;
}

interface UserProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: React.ReactNode;
  description?: string;
  avatarProps?: { src: string };
}

const User = forwardRef<HTMLDivElement, UserProps>(
  ({ className, avatarProps, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    >
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarImage {...avatarProps} />
          <AvatarFallback>?</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <div className="text-sm font-semibold">{props.name}</div>
          <div className="text-xs text-default-500">{props.description}</div>
        </div>
      </div>
    </div>
  ),
);
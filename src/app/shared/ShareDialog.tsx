import { Button } from "@/components/ui/button";
import { Button as AriaButton } from "@/components/ui/aria-button";
import { CopyButton } from "@/components/ui/copy-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/aria-dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Share2, Share2Icon, StopCircle } from "lucide-react";
import { forwardRef, useRef, useState } from "react";
import { useForm, useFormContext } from "react-hook-form";
import { z } from "zod";
import { generateId } from "./generateId";
import { RoomConfigSchema, getDocRoomConfig } from "./store/doc-room-config";
import { useDocCollabStore } from "./useDocCollabStore";
import { useStoreIfPresent } from "./useStoreIfPresent";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ShareDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { docId, roomId, $room, $roomConfig, startSharing, stopSharing } =
    useDocCollabStore();


  const roomConfigMaybe = useStoreIfPresent($roomConfig);
  const roomMaybe = useStoreIfPresent($room);
  const peerIds = roomMaybe?.peerIds ?? [];
  const awarenessUsers = useStoreIfPresent(
    $room?.$awarenessStates
  );
  // console.log('ShareDialog awarenessUsers', awarenessUsers);
  const awarenessClientID = $room?.provider?.awareness.clientID;
  const isSharing = roomConfigMaybe?.enabled ?? false;
  // const isSharing = $roomConfig?.get().enabled ?? false;
  const actionLabel = isSharing ? "Sharing" : "Share";
  const [searchParams] = useSearchParams();
  const roomParameter = searchParams.get("roomId");
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof RoomConfigSchema>>({
    resolver: zodResolver(RoomConfigSchema),
    defaultValues: async () => {
      const enabled = roomConfigMaybe?.enabled ?? false;
      const inRoom = roomParameter
      const encrypt = inRoom ? (roomConfigMaybe?.encrypt || !!roomConfigMaybe.password) : true;
      return {
        docId,
        roomId: roomParameter || generateId(),
        enabled,
        encrypt,
          // (roomConfigMaybe?.encrypt === true || roomConfigMaybe?.password != '') ?? true,
        // always generates default password
        password: roomConfigMaybe?.password ?? generateId(),
        accessLevel: "edit",
      }
    },
  });
  const onSubmit = form.handleSubmit(
    (data) => {
      const { roomId, docId } = data;
      startSharing({
        ...$roomConfig?.get(),
        ...data,
      });
      handleCopyLink();
      if (roomParameter !== roomId) {
        navigate(`?roomId=${roomId}`);
      }
    },
    (errors) => {
      console.log({ errors });
    },
  );
  const [linkCopied, setLinkCopied] = useState(false);
  const handleCopyLink = async () => {
    const roomId = form.getValues("roomId");
    const $roomConfig = getDocRoomConfig(docId, roomId);
    const sharingLink = $roomConfig?.$sharingLink.get();
    if (sharingLink && navigator.clipboard){
      await navigator.clipboard?.writeText(sharingLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } else {
      console.warn("Clipboard API not available");
      console.log('sharingLink', sharingLink);
    }
  };

  const formRef = useRef<HTMLFormElement>(null);
  const switchRef = useRef<any>(null);

  return (
      <DialogTrigger>
        <AriaButton
          variant={isSharing ? "warning" : "outline"}
          className="w-auto px-4  border-2 rounded-xl"
        >
          <div className="sr-only sm:not-sr-only !pr-1">{actionLabel}</div>
          <Share2Icon className="h-5 w-5" />
        </AriaButton>        
        <DialogOverlay>
          <DialogContent className="">
            {({ close }) => (
              <>
                <Form {...form}>
                  <form ref={formRef} onSubmit={onSubmit}>
                    <DialogHeader>
                      <DialogTitle>Share</DialogTitle>
                      <DialogDescription>
                        Share with people to collaborate in realtime
                      </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 gap-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sharing-toggle">
                          Sharing is {isSharing ? "on" : "off"}
                        </Label>
                        <Switch
                          id="sharing-toggle"
                          ref={switchRef}
                          checked={isSharing}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              formRef.current?.requestSubmit();
                            } else {
                              stopSharing();
                            }
                          }}
                        />
                      </div>
                    </div>

                    <SharingConfiguration isSharing={isSharing} />

                    <UserList
                      isSharing={isSharing}
                      peerIds={peerIds}
                      awarenessUsers={awarenessUsers}
                      awarenessClientID={awarenessClientID}
                    />

                    <DialogFooter className="pt-4">
                      <SharingActions
                        isSharing={isSharing}
                        stopSharing={stopSharing}
                        handleCopyLink={handleCopyLink}
                        linkCopied={linkCopied}
                      />
                    </DialogFooter>
                  </form>
                </Form>
              </>
            )}
          </DialogContent>
        </DialogOverlay>
    </DialogTrigger>

  );
}

function SharingConfiguration({ isSharing }: { isSharing: boolean }) {
  const form = useFormContext<z.infer<typeof RoomConfigSchema>>();
  const isEncrypted = form.watch("encrypt");
  const { errors } = form.formState;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              `space-y-4 rounded-md p-4`,
              !isSharing && "bg-muted/50",
            )}
          >
            <FormField
              control={form.control}
              name="roomId"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Room*</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input {...field} readOnly={isSharing} />
                      </FormControl>
                      <CopyButton value={field.value} label="room" />
                    </div>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="accessLevel"
              disabled={isSharing}
              render={({ field }) => {
                return (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>
                      Anyone with the link can{" "}
                      {form.watch("accessLevel") === "view" ? "view" : "edit"}
                    </FormLabel>
                    <Select {...field} disabled={isSharing} onValueChange={field.onChange}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="view">View</SelectItem>
                        <SelectItem value="edit">Edit</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="encrypt"
              render={({ field }) => {
                const { value, onChange, ...rest } = field;

                return (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>
                      Encrypt communication
                    </FormLabel>
                    <Switch
                      {...rest}
                      disabled={isSharing}
                      checked={value}
                      onCheckedChange={onChange}
                    />
                  </FormItem>
                );
              }}
            />

            <AnimatePresence>
              {isEncrypted && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className=""
                >
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <FormLabel>Password{isEncrypted && "*"}</FormLabel>
                          <FormControl>
                            <div>
                              <PasswordInput {...field} value={field.value ?? ""} readOnly={isSharing} />
                            </div>
                          </FormControl>
                          <FormDescription />
                          <FormMessage />                          
                        </FormItem>
                      );
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </TooltipTrigger>
        {isSharing && (
          <TooltipContent>
            <p>Stop sharing to edit configuration</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}

function SharingActions({
  isSharing,
  stopSharing,
  handleCopyLink,
  linkCopied,
}: {
  isSharing: boolean;
  stopSharing: () => void;
  linkCopied: boolean;
  handleCopyLink: () => void;
}) {
  return (
    <div className="flex flex-row items-center gap-2">
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {isSharing && (
            <motion.div
              key="copy-link"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                type="button"
                onClick={handleCopyLink}
                variant="outline"
                className="relative"
              >
                <AnimatePresence mode="wait">
                  {linkCopied ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Check className="h-4 w-4 text-green-500" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Copy className="h-4 w-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <span className="ml-2 min-w-24">
                  {linkCopied ? "Link Copied!" : "Copy Link"}
                </span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence mode="wait">
        {isSharing ? (
          <motion.div
            key="stop-sharing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              type="button"
              onClick={() => stopSharing()}
              variant="destructive"
            >
              <StopCircle className="mr-2 h-4 w-4" />
              Stop Sharing
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="share-now"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Button type="submit">
              <Share2 className="mr-2 h-4 w-4" />
              Share Now
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


function UserList({
  isSharing,
  peerIds,
  awarenessUsers,
  awarenessClientID,
}: {
  isSharing: boolean;
  peerIds: string[];
  awarenessUsers: Map<string, any> | Map<any, any>;
  awarenessClientID: number | undefined;
}) {
  const userAwareness = isSharing && (awarenessUsers as Map<any, any>)?.get(awarenessClientID);
  const connectedCount= peerIds?.length ?? 0;
  // console.log('connectedCount', connectedCount, awarenessUsers)
  return (
    <div>isSharing ={isSharing?'true':'false'}
      <div>
        You are sharing as: {awarenessClientID}
      </div>
      {isSharing && userAwareness ? <div>
        <User 
          name={userAwareness?.user?.userName ?? "Anonymous"}
          description="YOU"
          avatarProps={{
            src: `https://avatar.vercel.sh/${userAwareness?.user?.userName}?size=32`,
          }}
        />
      </div> : null}
      <div>{connectedCount} peer{connectedCount !== 1 ? 's':''} connected</div>
      {isSharing && !!awarenessUsers &&
        Array.from(awarenessUsers).map(([peerId, awareness]) => {
          console.log("awareness", peerId, awareness);
          const data = awareness.presence ?? awareness.user;
          if (!data) {
            return (
              <div key={peerId}>
                Missing data {peerId}: {JSON.stringify(data)}
    </div>
  );
}
          const { userName, color } = data;

          const isYou = peerId === awarenessClientID;
          if (isYou) return <div key={peerId}></div>;
          return (
            <div key={peerId}>
              <User
                className="py-4"
                key={peerId}
                name={userName ? <UserName {...{ userName, color }} /> : peerId}
                description={
                  isYou
                    ? "YOU"
                    : userName
                      ? undefined
                      : JSON.stringify(awareness)
                  //"Anonymous"
                }
                avatarProps={{
                  // src: `https://i.pravatar.cc/150?u=${peerId}`,
                  src: `https://avatar.vercel.sh/${userName}?size=32`,
                }}
              />
            </div>
          );
        })}
              </div>
  );
}


function UserName({ userName, color }: { userName: string; color: string }) {
  return <span style={{ color }}>{userName}</span>;
}

interface UserProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
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

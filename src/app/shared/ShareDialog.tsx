import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useStore } from "@nanostores/react";
import { AnimatePresence, motion } from "framer-motion";
import { Share2Icon } from "lucide-react";
import { atom } from "nanostores";
import { forwardRef, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { generateId } from "./generateId";
import {
  getDocRoomConfig,
  latestDocRoom,
  type DocRoomConfigFields,
} from "./store/doc-room-config";
import {
  getTrysteroDocRoom,
  type OnlineDocRoomFields,
} from "./store/trystero-doc-room";

function useDisclosure(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev) => !prev);

  return { isOpen, open, close, toggle };
}

export function ShareDialog() {
  const { docId } = useParams();
  const { isOpen, open, toggle, close } = useDisclosure();
  const [searchParams, setSearchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");
  // if (!roomId) console.warn("No room id specified");
  if (!docId) throw new Error("No document id specified");
  const {
    register,
    trigger,
    reset,
    handleSubmit,
    watch,
    formState: { errors },
    control,
    setValue,
    getValues,
  } = useForm();

  const $config = roomId ? getDocRoomConfig(docId, roomId) : undefined;
  let currentConfig = useStore($config || atom()) as
    | DocRoomConfigFields
    | undefined;

  const isSharing = !!roomId && currentConfig?.enabled;

  const $collabRoom = roomId ? getTrysteroDocRoom(docId!, roomId!) : undefined;
  const collabRoom = useStore($collabRoom || atom({} as OnlineDocRoomFields));
  const awarenessUsers = useStore(
    $collabRoom?.$awarenessStates ?? atom(new Map()),
  );
  const awarenessClientID = $collabRoom?.provider?.awareness.clientID;
  const peers = collabRoom?.peerIds ?? [];
  const navigate = useNavigate();
  console.log({ $config, currentConfig, roomId, docId });
  const password = currentConfig?.password;
  const encrypt = currentConfig?.encrypt;
  const actionLabel = isSharing ? "Sharing" : "Share";

  // TODO: improve this
  useEffect(() => {
    setValue("roomId", roomId || latestDocRoom.get()[docId!]);
  }, [roomId]);
  useEffect(() => {
    setValue("password", password);
  }, [password]);
  useEffect(() => {
    console.log("outer encrypt changed", encrypt);
    setValue("encrypt", encrypt);
  }, [encrypt]);
  watch();
  console.log({ encrypt });
  const submit = handleSubmit((data) => {
    console.log("submit", data);
    // const { roomId, password, encrypt, accessLevel } = data;

    // save config by docId+roomId
    const $newConfig = getDocRoomConfig(docId!, data.roomId);
    $newConfig.set({
      ...currentConfig,
      ...data,
      enabled: true,
    } as any);
    console.log("set config", $newConfig.value);
    if (!roomId) {
      navigate(`/edit/${docId}?roomId=${data.roomId}`);
    }
  });
  const stopSharing = (e) => {
    e?.preventDefault();
    $config?.setKey("enabled", false);
    $collabRoom?.disconnect();
    navigate(`/edit/${docId}`);
  };
  const initialRoomId = roomId ?? latestDocRoom.get()[docId!] ?? generateId();
  const sharingUrl = [
    window.location.protocol,
    "//",
    window.location.host,
    window.location.pathname,
    "#/edit/",
    docId,
    "?roomId=",
    roomId,
    password ? `&x=${password}` : "",
  ].join("");
  return (
    <>
      <Button
        variant={isSharing ? "solid" : "ghost"}
        color={isSharing ? "warning" : "primary"}
        onClick={open}
        isIconOnly={true}
        className="w-auto px-4"
      >
        <div className="sr-only sm:not-sr-only !pr-1">{actionLabel}</div>
        <Share2Icon className="h-5 w-5" />
      </Button>
      <Dialog
        open={isOpen}
        onOpenChange={toggle}
        placement="top"
        classNames={{
          wrapper: "z-[500]",
          backdrop: "z-[500]",
        }}
      >
        {/* protoype, convert to Dialog: 
    <Card className="w-full max-w-lg overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="flex items-start space-x-2">
          <Share2 className="h-6 w-6 mt-1" />
          <div>
            <CardTitle>Share Access</CardTitle>
            <CardDescription>
              Configure online sharing for realtime collaboration
            </CardDescription>
          </div>
        </div>
      </CardHeader> end prototype        */}
        <DialogContent>
          {/* {(onClose) => ( */}
          <form onSubmit={submit} noValidate>
            <>
              <DialogHeader className="flex flex-col gap-1">
                <DialogTitle>{actionLabel}</DialogTitle>
                <DialogDescription>
                  Configure online sharing for realtime collaboration
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 gap-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sharing-toggle">
                    Sharing is {isSharing ? "on" : "off"}
                  </Label>
                  <Switch
                    id="sharing-toggle"
                    checked={isSharing}
                    onCheckedChange={(value) => {
                      console.log("change", { isSharing, value });
                      console.log();
                      (!value ? stopSharing : submit)(null);
                    }}
                  />
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={`space-y-4 rounded-md bg-muted p-4`}>
                        <Controller
                          name="roomId"
                          defaultValue={initialRoomId}
                          rules={{ required: true }}
                          control={control}
                          render={({ field }) => (
                            <div className="space-y-2">
                              <Label htmlFor="room">Room</Label>
                              <div className="flex space-x-2">
                                <Input
                                  {...field}
                                  id="room"
                                  value={field.value || ""}
                                  readOnly={isSharing}
                                  isRequired
                                  isInvalid={!!errors.roomId}
                                  errorMessage={
                                    errors.roomId && "Room name is required"
                                  }
                                  label="Room"
                                  placeholder="Enter a room name to connect to"
                                  variant="bordered"
                                />
                                <CopyButton value={field.value} label="room" />
                              </div>
                            </div>
                          )}
                        ></Controller>

                        {/* <div className="space-y-2">
                          <Label htmlFor="room">Room</Label>
                          <div className="flex space-x-2">
                            <Input
                              id="room"
                              value={roomId}
                              onChange={(e) => setRoom(e.target.value)}
                              readOnly={isSharing}
                            />
                            <CopyButton value={roomId} label="room" />
                          </div>
                        </div>
                         */}
                        <Controller
                          name="encrypt"
                          defaultValue={encrypt ?? false}
                          control={control}
                          render={({ field }) => (
                            // <Switch
                            //   isSelected={field.value}
                            //   isDisabled={isSharing}
                            //   onValueChange={(v) => {
                            //     setValue("encrypt", v);
                            //   }}
                            // >
                            //   Encrypt communication
                            // </Switch>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="encrypt">
                                Encrypt communication ={" "}
                                {field.value ? "on" : "off"}
                              </Label>
                              <Switch
                                id="encrypt"
                                checked={field.value}
                                onCheckedChange={(v) => {
                                  console.log("encrypt", v);
                                  setValue("encrypt", v);
                                }}
                                disabled={isSharing}
                              />
                            </div>
                          )}
                        ></Controller>
                        {/* {!isSharing && getValues().encrypt && (
                            
                           )} */}

                        <AnimatePresence>
                          {getValues().encrypt && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="space-y-4 overflow-hidden"
                            >
                              <Controller
                                name="password"
                                defaultValue={password || generateId()}
                                rules={{ required: true }}
                                control={control}
                                render={({ field }) => (
                                  <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    {/* <PasswordInput
                                      value={password}
                                      onChange={(e) => setPassword(e.target.value)}
                                      readOnly={isSharing}
                                    /> */}
                                    <PasswordInput
                                      {...field}
                                      readOnly={isSharing}
                                      // className="text-default-400"
                                      value={field.value || ""}
                                      // isDisabled={isSharing}
                                      // isInvalid={!!errors.password}
                                      // isRequired
                                      // endContent={
                                      //   <KeyRoundIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                                      // }
                                      // label="Password"
                                      // placeholder="Enter a password to enable encryption"
                                      // variant="bordered"
                                    />
                                  </div>
                                )}
                              ></Controller>
                              {/* <Controller
                                name="includePassword"
                                defaultValue={false}
                                control={control}
                                render={({ field }) => (
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id="include-password"
                                      checked={field.value}
                                      onCheckedChange={(v) => {
                                        setValue("includePassword", v);
                                      }}
                                      disabled={isSharing}
                                    />
                                    <Label htmlFor="include-password">
                                      Include password in sharing link
                                    </Label>
                                  </div>
                                )}
                              ></Controller> */}
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <Controller
                          name="accessLevel"
                          defaultValue={"edit"}
                          rules={{ required: true }}
                          control={control}
                          render={({ field }) => (
                            <div className="flex items-center justify-between">
                              <Label htmlFor="access-level">
                                Anyone with the link can
                              </Label>
                              <Select
                                value={field.value}
                                onValueChange={(v) => {
                                  setValue("accessLevel", v);
                                }}
                                disabled={isSharing}
                              >
                                <SelectTrigger
                                  id="access-level"
                                  className="w-[100px]"
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="view">View</SelectItem>
                                  <SelectItem value="edit">Edit</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        ></Controller>
                      </div>
                    </TooltipTrigger>
                    {isSharing && (
                      <TooltipContent>
                        <p>Stop sharing to edit configuration</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>

                {!!isSharing && (
                  <>
                    <div>
                      <p className="my-2">Sharing Link:</p>
                      <div className="">
                        <Snippet
                          size="lg"
                          symbol=""
                          variant="flat"
                          color="primary"
                          classNames={{
                            base: "text-xs max-w-full",
                            pre: "overflow-hidden",
                          }}
                        >
                          {sharingUrl}
                        </Snippet>
                      </div>
                    </div>
                    {UserList(awarenessUsers, awarenessClientID)}
                  </>
                )}
              </div>
              <DialogFooter>
                <Button variant="light" onClick={close}>
                  Close
                </Button>
                {isSharing ? (
                  <Button color="danger" onClick={stopSharing}>
                    Stop Sharing
                  </Button>
                ) : (
                  <Button color="primary" type="submit">
                    Share
                  </Button>
                )}
              </DialogFooter>
            </>
          </form>
          {/* )} */}
        </DialogContent>
        {/* <DialogContent>
          <AdvancedSharingDialog onClose={close} />
        </DialogContent> */}
      </Dialog>
    </>
  );
}

function UserList({
  awarenessUsers,
  awarenessClientID,
}: {
  awarenessUsers: Map<string, any> | Map<any, any>;
  awarenessClientID: number | undefined;
}) {
  return (
    <div>
      <div>{(awarenessUsers?.size ?? 1) - 1} peers connected</div>
      {!!awarenessUsers &&
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
          if (isYou) return null;
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

// function OrigDialogContent () {
//   return (

//   )
// }

function UserName({ userName, color }: { userName: string; color: string }) {
  return <span style={{ color }}>{userName}</span>;
}

const Snippet = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
Snippet.displayName = "Snippet";

interface UserProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  description?: string;
}

const User = forwardRef<HTMLDivElement, UserProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    >
      <div className="flex items-center gap-2">
        <Avatar {...props} />
        <div className="flex flex-col">
          <div className="text-sm font-semibold">{props.name}</div>
          <div className="text-xs text-default-500">{props.description}</div>
        </div>
      </div>
    </div>
  ),
);

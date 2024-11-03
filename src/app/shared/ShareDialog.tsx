import { useStore } from "@nanostores/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  //   Button,
  Input,
  //   Modal,
  //   ModalBody,
  //   ModalContent,
  //   ModalFooter,
  //   ModalHeader,
  Snippet,
  User,
  useDisclosure,
} from "@nextui-org/react";
import { Switch } from "@/components/ui/switch";
import { KeyRoundIcon, Share2Icon } from "lucide-react";
import { atom } from "nanostores";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { PasswordInput } from "../../lab/nextui/PasswordInput";
import {
  getDocRoomConfig,
  latestDocRoom,
  type DocRoomConfigFields,
} from "./store/doc-room-config";
import {
  getTrysteroDocRoom,
  type OnlineDocRoomFields,
} from "./store/trystero-doc-room";
import { generateId } from "./generateId";

export function ShareDialog() {
  const { docId } = useParams();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure({});
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

  const $config = roomId
    ? getDocRoomConfig(docId, roomId, {
        encrypt: false,
        enabled: true,
        password: undefined,
      })
    : undefined;
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
    setValue("encrypt", encrypt);
  }, [encrypt]);
  watch();
  return (
    <>
      <Button
        variant={isSharing ? "solid" : "ghost"}
        color={isSharing ? "warning" : "primary"}
        onClick={onOpen}
        isIconOnly={true}
        className="w-auto px-4"
      >
        <div className="sr-only sm:not-sr-only !pr-1">{actionLabel}</div>
        <Share2Icon className="h-5 w-5" />
      </Button>
      <Dialog
        open={isOpen}
        onOpenChange={onOpenChange}
        placement="top"
        classNames={{
          wrapper: "z-[500]",
          backdrop: "z-[500]",
        }}
      >
        <DialogContent>
          {/* {(onClose) => ( */}
          <form
            onSubmit={handleSubmit((data) => {
              if ($config) {
                $config.set({
                  ...currentConfig,
                  ...data,
                  enabled: true,
                } as any);
              } else {
                const { roomId, password } = data;
                navigate(
                  `/edit/${docId}?roomId=${roomId}${password ? `&encrypt&x=${password}` : ""}`,
                );
              }
              // // onClose();
            })}
            noValidate
          >
            <>
              <DialogHeader className="flex flex-col gap-1">
                {actionLabel}
              </DialogHeader>
              <div className="gap-6">
                {
                  <>
                    {!isSharing && (
                      <Controller
                        name="roomId"
                        defaultValue={
                          roomId ?? latestDocRoom.get()[docId!] ?? generateId()
                        }
                        rules={{ required: true }}
                        control={control}
                        render={({ field }) => (
                          <div>
                            <Input
                              {...field}
                              value={field.value || ""}
                              isDisabled={isSharing}
                              isRequired
                              isInvalid={!!errors.roomId}
                              errorMessage={
                                errors.roomId && "Room name is required"
                              }
                              label="Room"
                              placeholder="Enter a room name to connect to"
                              variant="bordered"
                            />
                          </div>
                        )}
                      ></Controller>
                    )}
                    <Controller
                      name="encrypt"
                      defaultValue={encrypt ?? false}
                      control={control}
                      render={({ field }) => (
                        <Switch
                          isSelected={field.value}
                          isDisabled={isSharing}
                          onValueChange={(v) => {
                            setValue("encrypt", v);
                          }}
                        >
                          Encrypt communication
                        </Switch>
                      )}
                    ></Controller>
                    {!isSharing && getValues().encrypt && (
                      <Controller
                        name="password"
                        defaultValue={password || generateId()}
                        rules={{ required: true }}
                        control={control}
                        render={({ field }) => (
                          <div>
                            <PasswordInput
                              {...field}
                              className="text-default-400"
                              value={field.value || ""}
                              isDisabled={isSharing}
                              isInvalid={!!errors.password}
                              isRequired
                              endContent={
                                <KeyRoundIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                              }
                              label="Password"
                              placeholder="Enter a password to enable encryption"
                              variant="bordered"
                            />
                          </div>
                        )}
                      ></Controller>
                    )}
                  </>
                }
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
                          {[
                            window.location.protocol,
                            "//",
                            window.location.host,
                            window.location.pathname,
                            "#/edit/",
                            docId,
                            "?roomId=",
                            roomId,
                            password ? `&x=${password}` : "",
                          ].join("")}
                        </Snippet>
                      </div>
                    </div>
                    <div>
                      <div>
                        {(awarenessUsers?.size ?? 1) - 1} peers connected
                      </div>
                      {!!awarenessUsers &&
                        Array.from(awarenessUsers).map(
                          ([peerId, awareness]) => {
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
                                  name={
                                    userName ? (
                                      <UserName {...{ userName, color }} />
                                    ) : (
                                      peerId
                                    )
                                  }
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
                          },
                        )}
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button variant="light" onClick={onClose}>
                  Close
                </Button>
                {isSharing ? (
                  <Button
                    color="danger"
                    onClick={(e) => {
                      e.preventDefault();
                      $config?.setKey("enabled", false);
                      $collabRoom?.disconnect();
                      navigate(`/edit/${docId}`);
                    }}
                  >
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
      </Dialog>
    </>
  );
}

function UserName({ userName, color }: { userName: string; color: string }) {
  return <span style={{ color }}>{userName}</span>;
}

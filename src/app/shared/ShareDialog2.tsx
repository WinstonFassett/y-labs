import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
import { useRef, useState } from "react";
import { useForm, useFormContext } from "react-hook-form";
import { z } from "zod";
import { generateId } from "./generateId";
import {
  RoomConfigSchema,
  getDocRoomConfig,
  roomConfigsByDocId,
} from "./store/doc-room-config";
import { useDocCollabStore } from "./useDocCollabStore";
import { useStoreIfPresent } from "./useStoreIfPresent";

// function useRoomStuffIfRoomId() {
//   const { docId, roomId, $room, ydoc, $roomConfig } = useDocCollabStore();
//   const isSharing = $roomConfig?.get().enabled ?? false;
//   const room = useStore($room ?? (atom() as typeof $room));
//   const roomConfig = useStore($roomConfig ?? (atom() as typeof $roomConfig));
//   return {
//     docId,
//     roomId,
//     ydoc,
//     isSharing,
//     $room,
//     room: $room ? room : undefined,
//     $roomConfig,
//     roomConfig: $roomConfig ? roomConfig : undefined,
//   };
// }

export function ShareDialog() {
  const [isOpen, setIsOpen] = useState(true);
  const { docId, roomId, $room, ydoc, $roomConfig } = useDocCollabStore();
  // const latestRoomConfig = useStore(roomConfigsByDocId)[docId];
  // console.log("latestRoomConfig", latestRoomConfig?.get());
  const room = useStoreIfPresent($room);
  const roomConfig = useStoreIfPresent($roomConfig);
  console.log({ $room, $roomConfig });
  // const isEncrypted = roomConfig?.encrypt ?? false;
  const isSharing = $roomConfig?.get().enabled ?? false;
  // const {
  //   docId,
  //   roomId,
  //   ydoc,
  //   isSharing,
  //   $room,
  //   $roomConfig,
  //   room,
  //   roomConfig,
  // } = useRoomStuffIfRoomId();
  const actionLabel = isSharing ? "Sharing" : "Share";

  // const configAtRender = useStore
  const form = useForm<z.infer<typeof RoomConfigSchema>>({
    resolver: zodResolver(RoomConfigSchema),
    defaultValues: async () => ({
      docId,
      roomId: roomId ?? generateId(),
      enabled: false,
      encrypt: false,
      password: "",
      accessLevel: "view",
    }),
  });
  const onSubmit = form.handleSubmit(
    (data) => {
      console.log("submitted", { data });
      const { roomId, docId } = data;
      const $roomConfig = getDocRoomConfig(docId, roomId);
      $roomConfig?.set({
        ...$roomConfig.get(),
        enabled: true,
        ...data,
      });
      $roomConfig?.startSharing();
    },
    (errors) => {
      console.log({ errors });
    },
  );
  const formRef = useRef<HTMLFormElement>(null);
  const switchRef = useRef<any>(null);
  return (
    <Dialog open={isOpen}>
      <DialogTrigger>
        <Button
          // variant={isSharing ? "solid" : "ghost"}
          color={isSharing ? "warning" : "primary"}
          // isIconOnly={true}
          className="w-auto px-4"
        >
          <div className="sr-only sm:not-sr-only !pr-1">{actionLabel}</div>
          <Share2Icon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
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
                      // form.handleSubmit(
                      //   (data) => {
                      //     console.log("started sharing", { data });
                      //   },
                      //   (errors) => {
                      //     console.log({ errors });
                      //   },
                      // );
                    } else {
                      $roomConfig?.stopSharing();
                    }
                  }}
                />
              </div>
            </div>

            <SharingConfiguration isSharing={isSharing} />

            <DialogFooter className="pt-4">
              <SharingActions isSharing={isSharing} />
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

type SharingProps = {
  isSharing: boolean;
};

function SharingConfiguration({ isSharing }: { isSharing: boolean }) {
  const form = useFormContext<z.infer<typeof RoomConfigSchema>>();
  const isEncrypted = form.watch("encrypt");
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
                    <FormLabel>Room!!</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input {...field} readOnly={isSharing} />
                      </FormControl>
                      <CopyButton value={field.value} label="room" />
                    </div>
                    {/*
                     */}
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="accessLevel"
              defaultValue="view"
              disabled={isSharing}
              render={({ field }) => {
                return (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>
                      Anyone with the link can{" "}
                      {form.watch("accessLevel") === "view" ? "view" : "edit"}
                    </FormLabel>
                    <Select {...field} disabled={isSharing}>
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
            {/* <div className="flex items-center justify-between">
              <Label htmlFor="access-level">Anyone with the link can</Label>
              <Select
                value={accessLevel}
                onValueChange={setAccessLevel}
                disabled={isSharing}
              >
                <SelectTrigger id="access-level" className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View</SelectItem>
                  <SelectItem value="edit">Edit</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
            {/* <div className="flex items-center justify-between">
              <Label htmlFor="encrypt">Encrypt communication</Label>
              <Switch
                id="encrypt"
                checked={isEncrypted}
                onCheckedChange={setIsEncrypted}
                disabled={isSharing}
              />
             
            </div> */}
            <FormField
              control={form.control}
              name="encrypt"
              render={({ field }) => {
                const { value, onChange, ...rest } = field;

                return (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Encrypt communication</FormLabel>
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
                  className="space-y-4 overflow-hidden"
                >
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <PasswordInput {...field} readOnly={isSharing} />
                          </FormControl>
                        </FormItem>
                      );
                    }}
                  />
                  {/* <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-password"
                      checked={includePasswordInLink}
                      onCheckedChange={(checked) =>
                        setIncludePasswordInLink(checked === true)
                      }
                      disabled={isSharing}
                    />
                    <Label htmlFor="include-password">
                      Include password in sharing link
                    </Label>
                  </div> */}
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

function SharingActions({ isSharing }: { isSharing: boolean }) {
  const [linkCopied, setLinkCopied] = useState(false);
  const { $roomConfig, roomId, $room } = useDocCollabStore();
  // const roomConfig = useStoreIfPresent($roomConfig);

  const form = useFormContext<z.infer<typeof RoomConfigSchema>>();
  const handleCopyLink = async () => {
    const baseUrl = "https://example.com/share/";
    const data = form.getValues();
    console.log("copy data", data);
    // const {
    //   roomId,
    //   password,
    //   includePasswordInLink,
    // } = data;
    let shareUrl = `${baseUrl}${roomId}`;
    const {
      encrypt: isEncrypted,
      password,
      // includePassword
    } = form.getValues();
    if (
      isEncrypted
      //  && includePasswordInLink
    ) {
      shareUrl += `#pwd=${encodeURIComponent(password)}`;
    }
    await navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <>
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
              <span className="ml-2">
                {linkCopied ? "Copied!" : "Copy Link"}
              </span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex-grow" />
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
              onClick={() => $roomConfig!.stopSharing()}
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
    </>
  );
}

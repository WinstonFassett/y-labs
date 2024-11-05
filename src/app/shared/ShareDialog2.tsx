import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Share2, Share2Icon, StopCircle } from "lucide-react";
import { useState } from "react";
import { useDocCollabStore } from "./useDocCollabStore";
import {
  type DocRoomConfigFields,
  RoomConfigSchema,
} from "./store/doc-room-config";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type ShareController = {
  store: ReturnType<typeof useDocCollabStore>;
  startSharing: () => void;
  stopSharing: () => void;
  updateConfig: (config: Partial<DocRoomConfigFields>) => void;
};

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

export function ShareDialog() {
  const [isOpen, setIsOpen] = useState(true);
  // const [isSharing, setIsSharing] = useState(true);
  const { docId, roomId, $room, ydoc, $roomConfig } = useDocCollabStore();
  console.log({ docId, roomId, $room, ydoc });
  const isSharing = $roomConfig?.get().enabled ?? false;
  const actionLabel = isSharing ? "Sharing" : "Share";

  const form = useForm<z.infer<typeof RoomConfigSchema>>({
    resolver: zodResolver(RoomConfigSchema),
    defaultValues: {
      docId,
      roomId,
      enabled: false,
      encrypt: false,
      password: "",
      accessLevel: "view",
    },
  });
  const onSubmit = form.handleSubmit((data) => {});
  const open = () => {};
  const setIsSharing = () => {};
  return (
    <Dialog open={isOpen}>
      <DialogTrigger>
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
      </DialogTrigger>
      <DialogContent>
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
              checked={isSharing}
              onCheckedChange={setIsSharing}
            />
          </div>
        </div>
        <SharingConfiguration isSharing={isSharing} />

        <DialogFooter>
          <SharingActions />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SharingConfiguration({ isSharing }: { isSharing: boolean }) {
  const [room, setRoom] = useState("1234");
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [password, setPassword] = useState("");
  const [includePasswordInLink, setIncludePasswordInLink] = useState(false);
  const [accessLevel, setAccessLevel] = useState("edit");

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
            <div className="space-y-2">
              <Label htmlFor="room">Room</Label>
              <div className="flex space-x-2">
                <Input
                  id="room"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  readOnly={isSharing}
                />
                <CopyButton value={room} label="room" />
              </div>
            </div>
            <div className="flex items-center justify-between">
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
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="encrypt">Encrypt communication</Label>
              <Switch
                id="encrypt"
                checked={isEncrypted}
                onCheckedChange={setIsEncrypted}
                disabled={isSharing}
              />
            </div>
            <AnimatePresence>
              {isEncrypted && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <PasswordInput
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      readOnly={isSharing}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
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
                  </div>
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
  setIsSharing,
  handleCopyLink,
  submit,
}: {
  isSharing: boolean;
  setIsSharing: (v: boolean) => void;
  handleCopyLink: () => void;
  submit: () => void;
}) {
  const [linkCopied, setLinkCopied] = useState(false);
  const $roomConfig = useDocCollabStore().$roomConfig;

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
            <Button onClick={() => setIsSharing(true)}>
              <Share2 className="mr-2 h-4 w-4" />
              Share Now
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

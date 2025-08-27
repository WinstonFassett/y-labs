import { Button as AriaButton } from "@/components/ui/aria-button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/aria-dialog";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Share2Icon } from "lucide-react";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { generateId } from "../../../lib/generateId";
import { getDocRoomConfig, RoomConfigSchema } from "../store/doc-room-config";
import { useDocCollabStore } from "../useDocCollabStore";
import { useStoreIfPresent } from "../useStoreIfPresent";
import { SharingActions } from "./SharingActions";
import { SharingConfiguration } from "./SharingConfiguration";
import { SharingToggle } from "./SharingToggle";
import { UserList } from "./UserList";
import { useSharingLink } from "./useSharingLink";
import { generateDocRoomRouterLink } from "./utils";

export function ShareDialog({ type }: { type?: string }) {
  const { docId, $room, $roomConfig, startSharing, stopSharing } =
    useDocCollabStore();

  const roomConfigMaybe = useStoreIfPresent($roomConfig);
  const peerIds = useStoreIfPresent($room?.$peerIds) as string[];
  const awarenessUsers = useStoreIfPresent($room?.$awarenessStates) as Map<string, any>;
  const provider = $room?.get().provider
  const awarenessClientID = provider?.awareness.clientID;
  const isSharing = roomConfigMaybe?.enabled ?? false;
  const actionLabel = isSharing ? "Sharing" : "Share";
  
  const [searchParams] = useSearchParams();
  const roomParameter = searchParams.get("roomId");
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof RoomConfigSchema>>({
    resolver: zodResolver(RoomConfigSchema),
    defaultValues: async () => {
      const enabled = roomConfigMaybe?.enabled ?? false;
      const inRoom = roomParameter
      const encrypt = inRoom ? (roomConfigMaybe?.encrypt || !!roomConfigMaybe?.password) : false;
      return {
        roomId: roomParameter || generateId(),
        enabled,
        encrypt,
        password: roomConfigMaybe?.password ?? (encrypt ? generateId() : undefined),
        accessLevel: roomConfigMaybe?.accessLevel ?? "edit",
      }
    },
  });

  useEffect(() => {
    form.reset(roomConfigMaybe)
  }, [roomConfigMaybe, form])

  const { handleCopyLink, linkCopied } = useSharingLink(docId!, form, type);

  const onSubmit = form.handleSubmit(
    (data) => {
      const { roomId } = data;
      startSharing({
        ...data,
        type: type!,
        docId: docId!
      });
      handleCopyLink();
      const newRoomConfig = getDocRoomConfig(docId!, roomId).get();
      navigate(
        generateDocRoomRouterLink(newRoomConfig, type)
      )
    },
    (errors) => {
      console.log({ errors });
    },
  );

  const formRef = useRef<HTMLFormElement>(null);

  return (
    <DialogTrigger>
      <AriaButton
        size="sm"
        variant={isSharing ? "sharing" : "ghost"}
      >
        <div className="sr-only sm:not-sr-only !pr-1">{actionLabel}</div>
        <Share2Icon className="h-5 w-5" />
      </AriaButton>        
      <DialogOverlay>
        <DialogContent className="max-h-screen flex flex-col overflow-hidden">
          {({ close: _close }) => (
            <>
              <Form {...form}>
                <form ref={formRef} onSubmit={onSubmit} autoComplete="off" className="flex flex-col flex-1 w-full overflow-hidden">
                  <DialogHeader>
                    <DialogTitle>Share</DialogTitle>
                    <DialogDescription>
                      Share with people to collaborate in realtime
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex-1 overflow-y-auto">
                    <div className="py-4 gap-6 space-y-4">
                      <SharingToggle 
                        isSharing={isSharing}
                        onToggle={(checked) => {
                          if (checked) {
                            formRef.current?.requestSubmit();
                          } else {
                            stopSharing();
                          }
                        }}
                      />

                      <SharingConfiguration isSharing={isSharing} />

                      <AnimatePresence>
                        {isSharing && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <UserList
                              isSharing={isSharing}
                              peerIds={peerIds}
                              awarenessUsers={awarenessUsers}
                              awarenessClientID={awarenessClientID}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

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
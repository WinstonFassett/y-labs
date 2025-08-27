import { useState } from "react";
import { type UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { getDocRoomConfig, RoomConfigSchema } from "../store/doc-room-config";
import { generateSharingLink } from "./utils";

export function useSharingLink(
  docId: string, 
  form: UseFormReturn<z.infer<typeof RoomConfigSchema>>, 
  type?: string
) {
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyLink = async () => {
    const roomId = form.getValues("roomId");
    const $roomConfig = getDocRoomConfig(docId, roomId);
    const sharingLink = generateSharingLink($roomConfig.get(), type);
    
    if (sharingLink && navigator.clipboard) {
      await navigator.clipboard?.writeText(sharingLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } else {
      console.warn("Clipboard API not available");
      console.log('sharingLink', sharingLink);
    }
  };

  return { handleCopyLink, linkCopied };
}
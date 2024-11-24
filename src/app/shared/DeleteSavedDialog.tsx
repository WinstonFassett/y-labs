import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider } from "@/components/ui/tooltip.tsx";

import { Button, buttonVariants } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { TrashIcon } from "lucide-react";
import { useState } from "react";
import type { DocMetadata } from "./store/doc-metadata";
import { deleteOfflineDoc, getDocIdbStore, getHasDocIdb } from "./store/local-yjs-idb";

export function DeleteSavedDialog({ id, title, onDeleted }: DocMetadata & { onDeleted?: () => void }) {
  const [open, setOpen] = useState(false);
  const {toast} = useToast()
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <TooltipProvider>
          <Tooltip>
            <Button size="icon" variant="destructive" onClick={e => {
              e.preventDefault()
              setOpen(true)
            }}>
              <TrashIcon size={"16"} />
            </Button>
            <TooltipContent className="bg-destructive">
              <p>Delete document</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>


      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this Document?</AlertDialogTitle>
          <AlertDialogDescription>
            <p>This will stop storing the file:</p>
            <p className="p-2 font-bold">{title || id }</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={async () => {
            const $docOfflineStore = getDocIdbStore(id);
            const exists = await getHasDocIdb(id)
            if (exists) {
              console.log('deleting', id, $docOfflineStore.value)
              $docOfflineStore.setKey("enabled", false);
              if ($docOfflineStore.$persister.value) {
                // console.log('// persister should handle it')
              } else {
                await deleteOfflineDoc(id)
              }
              onDeleted?.()
            }           
          }} className={buttonVariants({ variant: 'destructive'})} >Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

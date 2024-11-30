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
import { Slot } from "@radix-ui/react-slot";
import { TrashIcon } from "lucide-react";
import { useState } from "react";
import { useNavigateMaybe } from "../../lib/useNavigateMaybe";
import { useDocParams } from "../blocknote/Editor";
import type { DocMetadata } from "./store/doc-metadata";
import { deleteOfflineDoc, getDocIdbStore, getHasDocIdb } from "./store/local-yjs-idb";

const DefaultTriggerButton = (props: any) => {
  return (
    <Button size="icon" variant="destructive" {...props}>
      <TrashIcon size={"16"} />
    </Button>
  )
}

interface DeleteSavedDocProps extends DocMetadata {
}
interface DeleteSavedDialogAlertTriggerProps extends DeleteSavedDocProps {
  asChild?: boolean
  children?: React.ReactNode  
}

export function DeleteSavedDialog({ asChild, ...props }: DeleteSavedDialogAlertTriggerProps) {
  const [open, setOpen] = useState(false);
  
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <DeleteSavedDialogAlertTrigger asChild={asChild} setOpen={setOpen} {...props} />
      <DeleteSavedDialogAlertContent {...props} />
    </AlertDialog>
  )
}
export function DeleteSavedDialogAlertTrigger ({ asChild, setOpen, ...props }: DeleteSavedDialogAlertTriggerProps & { setOpen: (open: boolean) => void }) {
  const Comp = asChild ? Slot : DefaultTriggerButton
  const { id, title, ...compProps } = props
  return (
    <AlertDialogTrigger asChild>
      <TooltipProvider>
        <Tooltip>
          <Comp {...compProps} onClick={e => {
            e.preventDefault()
            setOpen(true)
          }} />
          
          <TooltipContent className="bg-destructive">
            <p>Delete document</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </AlertDialogTrigger>    
  )
}

export function DeleteSavedDialogAlertContent({ id, title }: DeleteSavedDocProps) {
  const { toast } = useToast();
  const { docId } = useDocParams()
  const navigate = useNavigateMaybe()
  return (
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
            $docOfflineStore.setKey("enabled", false);
            if ($docOfflineStore.$persister.value) {
              // persister will be deleted 
              // because we disabled it
            } else {
              await deleteOfflineDoc(id)
            }
            toast({
              title: "Document deleted",
              description: title || id,
              // action: (
              //   <ToastAction altText="Goto schedule to undo">Undo</ToastAction>
              // ),
            })
            if (docId === id) {
              // active doc was deleted
              navigate?.('/')
            }
          }           
        }} className={buttonVariants({ variant: 'destructive'})} >Continue</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  )
}

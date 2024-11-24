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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip.tsx";

import { Button, buttonVariants } from "@/components/ui/button";
import { useState } from "react";
import type { DocMetadata } from "./store/doc-metadata";
import { TrashIcon } from "lucide-react";

export function DeleteSavedDialog({ id, title }: DocMetadata) {
  const [open, setOpen] = useState(false);
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
          <AlertDialogAction onClick={() => {
            console.log('submit')
          }} className={buttonVariants({ variant: 'destructive'})} >Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

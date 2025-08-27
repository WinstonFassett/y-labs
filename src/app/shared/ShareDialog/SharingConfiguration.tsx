import {
  Select,
  SelectItem,
  SelectLabel,
  SelectListBox,
  SelectPopover,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/aria-select";
import { CopyButton } from "@/components/ui/copy-button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { RoomConfigSchema } from "../store/doc-room-config";

interface SharingConfigurationProps {
  isSharing: boolean;
}

export function SharingConfiguration({ isSharing }: SharingConfigurationProps) {
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
              render={({ field }) => (
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
              )}
            />
            
            <FormField
              control={form.control}
              name="accessLevel"
              disabled={isSharing}
              render={({ field }) => (
                <FormItem>
                  <Select className="flex items-center justify-between"
                    {...field}               
                    isDisabled={isSharing}
                    onSelectionChange={field.onChange}
                    selectedKey={field.value}
                  >
                    <SelectLabel className="block flex-1">
                      Anyone with the link can{" "}
                      <span className="font-bold">{field.value === "edit" ? "edit" : "view"}</span>
                    </SelectLabel>
                    
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectPopover>
                      <SelectListBox>
                        <SelectItem id="view">View</SelectItem>
                        <SelectItem id="edit">Edit</SelectItem>
                      </SelectListBox>
                    </SelectPopover>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="encrypt"
              render={({ field }) => {
                const { value, onChange, ...rest } = field;

                return (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>
                      Require shared password
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
                >
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shared Password{isEncrypted && "*"}</FormLabel>
                        <FormControl>
                          <PasswordInput 
                            showCopyButton 
                            {...field} 
                            value={field.value ?? ""} 
                            readOnly={isSharing} 
                            type="text" 
                          />
                        </FormControl>
                        <FormDescription>
                          All participants must use this password to connect
                        </FormDescription>
                        <FormMessage />                          
                      </FormItem>
                    )}
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
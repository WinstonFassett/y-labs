import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

import { buttonVariants } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { useForm } from "react-hook-form";
import { useDocCollabStore } from "./useDocCollabStore";

export function PasswordRequiredDialog() {
  const { needsPasswordToConnect, $roomConfig, stopSharing } = useDocCollabStore(false)
  const form = useForm({
    defaultValues: {
      password: ''
    }
  })
  return (
    <AlertDialog open={needsPasswordToConnect}>
      <AlertDialogContent>
        <Form {...form}>
          <form className="space-y-2" onSubmit={form.handleSubmit(async (data) => {
            $roomConfig?.setKey('password', data.password)
          })}>
            
            <AlertDialogHeader>
              <AlertDialogTitle>Password Required</AlertDialogTitle>
              <AlertDialogDescription>
                <p>A password is required in order to connect sharing.</p>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <FormField
              control={form.control}
              name="password"   
              rules={{ required: 'Password is required' }}           
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Password*</FormLabel>
                    <FormControl>
                      <div>
                        <PasswordInput 
                          {...field}
                          value={field.value || ''}
                          type="text"                          
                          />
                      </div>
                    </FormControl>
                    <FormDescription />
                    <FormMessage />                          
                  </FormItem>
                );
              }}
            />       

            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                stopSharing?.()
              }}>Cancel</AlertDialogCancel>
              <AlertDialogAction type="submit" className={buttonVariants({ variant: 'default'})} >Connect</AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

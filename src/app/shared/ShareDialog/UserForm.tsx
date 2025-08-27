import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { forwardRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { $user } from "../store/local-user";

export const UserConfigSchema = z.object({
  username: z.string().min(1, { message: "Required" }),
  color: z.string().min(1, { message: "Required" }),
});

export const UserForm = forwardRef<HTMLFormElement, React.HTMLProps<HTMLFormElement>>(
  (props, ref) => {
    const form = useForm<z.infer<typeof UserConfigSchema>>({
      resolver: zodResolver(UserConfigSchema),
      mode: "onBlur",
    });

    useEffect(() => {
      return $user.subscribe(currentUser => {
        form.reset(currentUser) 
      })
    }, [form])

    const onSubmit = form.handleSubmit(
      (data) => {
        $user.set(data);
      },
      (errors) => {
        console.log({ errors });
      },
    );

    return (
      <Form {...form}>
        <div onBlur={onSubmit}>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    );
  },
);
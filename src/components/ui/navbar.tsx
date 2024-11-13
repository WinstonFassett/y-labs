import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Navbar = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex justify-between items-center", className)}
    {...props}
  />
));
Navbar.displayName = "Navbar";
export const NavbarContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex justify-between h-14 items-center", className)}
    {...props}
  />
));
NavbarContent.displayName = "NavbarContent";
export const NavbarBrand = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex justify-between items-center", className)}
    {...props}
  />
));
NavbarBrand.displayName = "NavbarBrand";

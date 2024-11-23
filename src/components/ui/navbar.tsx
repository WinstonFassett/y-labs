import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Navbar = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex justify-between",
      "gap-2 flex w-full h-auto data-[menu-open=true]:border-none inset-x-0 border-b border-divider backdrop-blur-lg data-[menu-open=true]:backdrop-blur-xl backdrop-saturate-150 bg-transparent max-w-3xl mx-auto",
      className)}
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

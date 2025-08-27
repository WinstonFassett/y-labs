import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface SharingToggleProps {
  isSharing: boolean;
  onToggle: (checked: boolean) => void;
}

export function SharingToggle({ isSharing, onToggle }: SharingToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <Label htmlFor="sharing-toggle">
        Sharing is {isSharing ? "on" : "off"}
      </Label>
      <Switch
        id="sharing-toggle"
        checked={isSharing}
        onCheckedChange={onToggle}
      />
    </div>
  );
}
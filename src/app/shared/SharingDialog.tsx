"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Share2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SharingDialog() {
  const [isSharing, setIsSharing] = useState(false);
  const [sharingUrl, setSharingUrl] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isSharing) {
      // In a real application, you would generate or fetch the actual sharing URL here
      setSharingUrl("https://example.com/share/abc123");
    } else {
      setSharingUrl("");
    }
  }, [isSharing]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(sharingUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Share Your Content</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <label
            htmlFor="sharing-toggle"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Sharing is {isSharing ? "on" : "off"}
          </label>
          <Switch
            id="sharing-toggle"
            checked={isSharing}
            onCheckedChange={setIsSharing}
            aria-label="Toggle sharing"
          />
        </div>
        <AnimatePresence>
          {isSharing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="flex items-center space-x-2 bg-muted p-2 rounded-md">
                <div className="flex-1 overflow-x-auto">
                  <code className="text-sm whitespace-nowrap">
                    {sharingUrl}
                  </code>
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopy}
                  aria-label={
                    isCopied ? "Copied to clipboard" : "Copy to clipboard"
                  }
                >
                  <AnimatePresence initial={false} mode="wait">
                    {isCopied ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Check className="h-4 w-4 text-green-500" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Copy className="h-4 w-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          disabled={!isSharing}
          onClick={() => alert("Share functionality would be implemented here")}
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share Now
        </Button>
      </CardFooter>
    </Card>
  );
}

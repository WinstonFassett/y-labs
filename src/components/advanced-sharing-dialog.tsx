import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { nanoid } from "nanoid"
import { Copy, Check, X, Eye, EyeOff, Users, Share2, StopCircle } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const CopyButton = ({ value, label }) => {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <Button
      size="icon"
      variant="outline"
      onClick={handleCopy}
      aria-label={isCopied ? "Copied" : `Copy ${label}`}
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
  )
}

const PasswordInput = ({ value, onChange, disabled, readOnly }) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="flex space-x-2">
      <div className="relative flex-1">
        <Input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
        />
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-0 top-0 h-full"
          onClick={() => setShowPassword(!showPassword)}
        >
          <AnimatePresence initial={false} mode="wait">
            {showPassword ? (
              <motion.div
                key="eyeoff"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <EyeOff className="h-4 w-4" />
              </motion.div>
            ) : (
              <motion.div
                key="eye"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Eye className="h-4 w-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </div>
      <CopyButton value={value} label="password" />
    </div>
  )
}

const UserList = () => {
  const users = [
    { id: 1, name: "Alice", image: "/placeholder.svg?height=32&width=32" },
    { id: 2, name: "Bob", image: "/placeholder.svg?height=32&width=32" },
    { id: 3, name: "Charlie", image: "/placeholder.svg?height=32&width=32" },
    { id: 4, name: "David", image: "/placeholder.svg?height=32&width=32" },
    { id: 5, name: "Eve", image: "/placeholder.svg?height=32&width=32" },
  ]

  return (
    <ScrollArea className="h-[180px] border rounded-md p-2">
      <div className="space-y-2">
        {users.map((user) => (
          <div key={user.id} className="flex items-center space-x-2">
            <Avatar>
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{user.name}</span>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

export function AdvancedSharingDialogComponent({ onClose }) {
  const [isSharing, setIsSharing] = useState(false)
  const [room, setRoom] = useState(nanoid(6))
  const [isEncrypted, setIsEncrypted] = useState(false)
  const [password, setPassword] = useState("")
  const [includePasswordInLink, setIncludePasswordInLink] = useState(false)
  const [accessLevel, setAccessLevel] = useState("edit")
  const [linkCopied, setLinkCopied] = useState(false)

  const handleCopyLink = async () => {
    const baseUrl = "https://example.com/share/"
    let shareUrl = `${baseUrl}${room}`
    if (isEncrypted && includePasswordInLink) {
      shareUrl += `#pwd=${encodeURIComponent(password)}`
    }
    await navigator.clipboard.writeText(shareUrl)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  return (
    <Card className="w-full max-w-lg overflow-hidde">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="flex items-start space-x-2">
          <Share2 className="h-6 w-6 mt-1" />
          <div>
            <CardTitle>Share Access</CardTitle>
            <CardDescription>Configure online sharing for realtime collaboration</CardDescription>
          </div>
        </div>
        {/* <Button variant="ghost" size="icon" onClick={onClose} className="mt-0">
          <X className="h-4 w-4" />
        </Button> */}
        {/* <Button variant="ghost" size="icon" onClick={onClose} className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>         */}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="sharing-toggle">Sharing is {isSharing ? "on" : "off"}</Label>
          <Switch
            id="sharing-toggle"
            checked={isSharing}
            onCheckedChange={setIsSharing}
          />
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`space-y-4 rounded-md bg-muted p-4`}>
                <div className="space-y-2">
                  <Label htmlFor="room">Room</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="room"
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      readOnly={isSharing}
                    />
                    <CopyButton value={room} label="room" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="encrypt">Encrypt communication</Label>
                  <Switch
                    id="encrypt"
                    checked={isEncrypted}
                    onCheckedChange={setIsEncrypted}
                    disabled={isSharing}
                  />
                </div>
                <AnimatePresence>
                  {isEncrypted && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <PasswordInput
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          readOnly={isSharing}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-password"
                          checked={includePasswordInLink}
                          onCheckedChange={setIncludePasswordInLink}
                          disabled={isSharing}
                        />
                        <Label htmlFor="include-password">Include password in sharing link</Label>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex items-center justify-between">
                  <Label htmlFor="access-level">Anyone with the link can</Label>
                  <Select
                    value={accessLevel}
                    onValueChange={setAccessLevel}
                    disabled={isSharing}
                  >
                    <SelectTrigger id="access-level" className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">View</SelectItem>
                      <SelectItem value="edit">Edit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TooltipTrigger>
            {isSharing && (
              <TooltipContent>
                <p>Stop sharing to edit configuration</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        <AnimatePresence>
          {isSharing && (
            <motion.div className="overflow-hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-2">
                <Label>Connected Users</Label>
                <UserList />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <AnimatePresence mode="wait">
          {isSharing && (
            <motion.div
              key="copy-link"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Button onClick={handleCopyLink} variant="outline" className="relative">
                <AnimatePresence mode="wait">
                  {linkCopied ? (
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
                <span className="ml-2">{linkCopied ? "Copied!" : "Copy Link"}</span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex-grow" />
        <AnimatePresence mode="wait">
          {isSharing ? (
            <motion.div
              key="stop-sharing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Button onClick={() => setIsSharing(false)} variant="destructive">
                <StopCircle className="mr-2 h-4 w-4" />
                Stop Sharing
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="share-now"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Button onClick={() => setIsSharing(true)}>
                <Share2 className="mr-2 h-4 w-4" />
                Share Now
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardFooter>
    </Card>
  )
}
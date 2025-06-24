'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

interface SettingsDialogProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export function SettingsDialog({ isOpen, setIsOpen }: SettingsDialogProps) {
  const { toast } = useToast()
  const [apiKey, setApiKey] = useState('')

  useEffect(() => {
    if (isOpen) {
      const storedKey = localStorage.getItem('gemini-api-key')
      if (storedKey) {
        setApiKey(storedKey)
      }
    }
  }, [isOpen])

  const handleSave = () => {
    localStorage.setItem('gemini-api-key', apiKey)
    setIsOpen(false)
    toast({
      title: 'API Key Saved',
      description: 'Your Gemini API key has been saved to your browser\'s local storage.',
    })
    // Optionally, refresh to make sure all components use the new key
    window.location.reload()
  }

  const handleClear = () => {
    localStorage.removeItem('gemini-api-key')
    setApiKey('')
    toast({
      title: 'API Key Cleared',
      description: 'Your Gemini API key has been removed.',
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Google Gemini API Key</DialogTitle>
          <DialogDescription>
            Configure your Google Gemini API key to enable AI-powered document analysis. 
            Your API key is stored securely in your browser and is never sent to our servers.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="api-key" className="text-right">
              Gemini API Key
            </Label>
            <Input
              id="api-key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="col-span-3"
              placeholder="Enter your Google AI Studio API Key"
              type="password"
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" onClick={handleClear}>Clear Key</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 

import { useState } from 'react';
import { User, demoUsers, currentUserId } from '@/data/demoData';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';

interface SwapRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetUser: User;
}

const SwapRequestDialog = ({ open, onOpenChange, targetUser }: SwapRequestDialogProps) => {
  const [selectedOfferedSkill, setSelectedOfferedSkill] = useState('');
  const [selectedWantedSkill, setSelectedWantedSkill] = useState('');
  const [message, setMessage] = useState('');

  const currentUser = demoUsers.find(u => u.id === currentUserId);

  const handleSubmit = () => {
    if (!selectedOfferedSkill || !selectedWantedSkill || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    // In a real app, this would make an API call
    toast.success(`Swap request sent to ${targetUser.name}!`);
    onOpenChange(false);
    
    // Reset form
    setSelectedOfferedSkill('');
    setSelectedWantedSkill('');
    setMessage('');
  };

  if (!currentUser) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Swap Request to {targetUser.name}</DialogTitle>
          <DialogDescription>
            Choose the skills you'd like to exchange and add a personal message.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="offered-skill">Your Skill to Offer</Label>
            <Select value={selectedOfferedSkill} onValueChange={setSelectedOfferedSkill}>
              <SelectTrigger>
                <SelectValue placeholder="Select a skill you can teach" />
              </SelectTrigger>
              <SelectContent>
                {currentUser.skillsOffered.map((skill) => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="wanted-skill">Skill You Want to Learn</Label>
            <Select value={selectedWantedSkill} onValueChange={setSelectedWantedSkill}>
              <SelectTrigger>
                <SelectValue placeholder="Select a skill you want to learn" />
              </SelectTrigger>
              <SelectContent>
                {targetUser.skillsOffered.map((skill) => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Add a personal message to introduce yourself and explain why you'd like to make this swap..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Send Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SwapRequestDialog;

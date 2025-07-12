
import { useState } from 'react';
import { demoSwapRequests, demoUsers, demoFeedback, currentUserId } from '@/data/demoData';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, MessageSquare, CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const Feedback = () => {
  const [selectedSwapId, setSelectedSwapId] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  // Get completed swaps that haven't been rated yet
  const completedSwaps = demoSwapRequests.filter(r => 
    r.status === 'completed' && 
    (r.fromUserId === currentUserId || r.toUserId === currentUserId) &&
    !demoFeedback.some(f => f.swapRequestId === r.id && f.fromUserId === currentUserId)
  );

  const getUserById = (id: string) => demoUsers.find(u => u.id === id);

  const handleSubmitFeedback = () => {
    if (!selectedSwapId || rating === 0 || !comment.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    // In a real app, this would make an API call
    toast.success('Feedback submitted successfully!');
    
    // Reset form
    setSelectedSwapId('');
    setRating(0);
    setComment('');
  };

  const renderStars = (currentRating: number, onClick?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-6 w-6 cursor-pointer transition-colors ${
              star <= currentRating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 hover:text-yellow-400'
            }`}
            onClick={() => onClick?.(star)}
          />
        ))}
      </div>
    );
  };

  const selectedSwap = demoSwapRequests.find(s => s.id === selectedSwapId);
  const otherUser = selectedSwap ? 
    getUserById(selectedSwap.fromUserId === currentUserId ? selectedSwap.toUserId : selectedSwap.fromUserId) 
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">Feedback</h1>
          <p className="text-muted-foreground">
            Rate and review your completed skill swaps.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Submit Feedback Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Submit Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {completedSwaps.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No completed swaps to rate.</p>
                  <p className="text-sm">Complete some skill swaps to leave feedback!</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="swap-select">Select Completed Swap</Label>
                    <Select value={selectedSwapId} onValueChange={setSelectedSwapId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a swap to rate" />
                      </SelectTrigger>
                      <SelectContent>
                        {completedSwaps.map((swap) => {
                          const otherUserId = swap.fromUserId === currentUserId ? swap.toUserId : swap.fromUserId;
                          const otherUserName = getUserById(otherUserId)?.name;
                          return (
                            <SelectItem key={swap.id} value={swap.id}>
                              {swap.skillOffered} ↔ {swap.skillWanted} with {otherUserName}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedSwap && otherUser && (
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={otherUser.profilePhoto} alt={otherUser.name} />
                          <AvatarFallback>{otherUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{otherUser.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Swap: {selectedSwap.skillOffered} ↔ {selectedSwap.skillWanted}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Rating</Label>
                    {renderStars(rating, setRating)}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="feedback-comment">Your Review</Label>
                    <Textarea
                      id="feedback-comment"
                      placeholder="Share your experience with this skill swap..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <Button 
                    onClick={handleSubmitFeedback}
                    className="w-full"
                    disabled={!selectedSwapId || rating === 0 || !comment.trim()}
                  >
                    Submit Feedback
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Previous Feedback */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Recent Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              {demoFeedback.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No feedback yet.</p>
                  <p className="text-sm">Feedback from your swaps will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {demoFeedback.map((feedback) => {
                    const fromUser = getUserById(feedback.fromUserId);
                    const toUser = getUserById(feedback.toUserId);
                    const swap = demoSwapRequests.find(s => s.id === feedback.swapRequestId);
                    
                    if (!fromUser || !toUser || !swap) return null;

                    return (
                      <div key={feedback.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={fromUser.profilePhoto} alt={fromUser.name} />
                              <AvatarFallback className="text-xs">
                                {fromUser.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{fromUser.name}</span>
                            <span className="text-sm text-muted-foreground">→</span>
                            <span className="text-sm">{toUser.name}</span>
                          </div>
                          {renderStars(feedback.rating)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Swap: {swap.skillOffered} ↔ {swap.skillWanted}
                        </p>
                        <p className="text-sm">{feedback.comment}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Feedback;

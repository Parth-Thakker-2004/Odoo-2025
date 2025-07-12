'use client'

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { demoUsers, demoSwapRequests, demoFeedback, currentUserId } from '@/data/demoData';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, MessageSquare, CheckCircle } from 'lucide-react';

type FeedbackType = {
  id: string;
  fromUserId: string;
  toUserId: string;
  swapRequestId: string;
  rating: number;
  comment: string;
  createdAt: string;
};

type SwapType = {
  id: string;
  fromUserId: string;
  toUserId: string;
  skillOffered: string;
  skillWanted: string;
  status: string; // Added status property
};

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackType[]>(
    demoFeedback.map(fb => ({
      ...fb,
      createdAt: typeof fb.createdAt === 'string' ? fb.createdAt : fb.createdAt.toISOString(),
    }))
  );
  const [completedSwaps, setCompletedSwaps] = useState<SwapType[]>(demoSwapRequests);
  const [selectedSwapId, setSelectedSwapId] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const getUserById = (id: string) => demoUsers.find(u => u.id === id);

  const handleSubmitFeedback = async () => {
    if (!selectedSwapId || rating === 0 || !comment.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    // Check if feedback already exists for the selected swap
    const existingFeedback = feedbacks.find(
      (feedback) => feedback.swapRequestId === selectedSwapId
    );

    if (existingFeedback) {
      toast.error('You have already submitted feedback for this swap');
      return;
    }

    // Simulate adding feedback to demo data
    const newFeedback: FeedbackType = {
      id: (feedbacks.length + 1).toString(),
      swapRequestId: selectedSwapId,
      fromUserId: currentUserId,
      toUserId: completedSwaps.find(s => s.id === selectedSwapId)?.toUserId || '',
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };

    setFeedbacks((prev) => [...prev, newFeedback]);
    toast.success('Feedback submitted successfully!');
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

  const selectedSwap = completedSwaps.find(s => s.id === selectedSwapId);
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
              {completedSwaps.filter(s => s.status === 'completed').length === 0 ? (
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
                        {completedSwaps.filter(s => s.status === 'completed').map((swap) => {
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

          {/* Recent Feedback */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Recent Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              {feedbacks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No feedback yet.</p>
                  <p className="text-sm">Feedback from your swaps will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedbacks.map((feedback) => {
                    const fromUser = getUserById(feedback.fromUserId);
                    const toUser = getUserById(feedback.toUserId);

                    return (
                      <div key={feedback.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={fromUser?.profilePhoto} alt={fromUser?.name} />
                              <AvatarFallback className="text-xs">
                                {fromUser?.name.split(' ').map((n) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{fromUser?.name}</span>
                            <span className="text-sm text-muted-foreground">→</span>
                            <span className="text-sm">{toUser?.name}</span>
                          </div>
                          {renderStars(feedback.rating)}
                        </div>
                        <p className="text-sm text-muted-foreground">{feedback.comment}</p>
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
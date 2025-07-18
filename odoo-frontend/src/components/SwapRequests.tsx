'use client'
import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Clock, Trash2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

const SwapRequests = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [userCache, setUserCache] = useState<{[key: string]: any}>({});

  // Fetch current user profile
  const fetchCurrentUserProfile = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.success && responseData.user) {
          setCurrentUserProfile(responseData.user);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Fetch swap requests from backend
  useEffect(() => {
    const fetchData = async () => {
      await fetchCurrentUserProfile();
      
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/swaps', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });
        
        if (response.ok) {
          const data = await response.json();
          setRequests(Array.isArray(data) ? data : []);
        } else {
          toast.error('Failed to load swap requests');
        }
      } catch {
        toast.error('Failed to load swap requests');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get current user ID from profile or fallback to demo
  const currentUserId = currentUserProfile?.id || currentUserProfile?._id;
  
  const sentRequests = requests.filter(r => r.requesterId === currentUserId);
  const receivedRequests = requests.filter(r => r.recipientId === currentUserId);

  // Fetch user data by ID (could be enhanced to fetch from API)
  const getUserById = (id: string) => {
    // For now, return a placeholder since we don't have user lookup API
    // In a real app, you'd fetch user data by ID from an API
    return {
      id,
      name: `User ${id.slice(-4)}`, // Show last 4 chars of ID
      profilePhoto: '',
    };
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`/api/swaps/${requestId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'accepted' }),
      });
      setRequests(prev => prev.map(req =>
        req._id === requestId ? { ...req, status: 'accepted' } : req
      ));
      toast.success('Swap request accepted!');
    } catch {
      toast.error('Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`/api/swaps/${requestId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'rejected' }),
      });
      setRequests(prev => prev.map(req =>
        req._id === requestId ? { ...req, status: 'rejected' } : req
      ));
      toast.success('Swap request rejected.');
    } catch {
      toast.error('Failed to reject request');
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`/api/swaps/${requestId}`, { 
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      setRequests(prev => prev.filter(req => req._id !== requestId));
      toast.success('Swap request deleted.');
    } catch {
      toast.error('Failed to delete request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const RequestCard = ({ request, isSent }: { request: any, isSent: boolean }) => {
    // Use the names from the request data if available, otherwise use placeholder
    const otherUser = {
      id: isSent ? request.recipientId : request.requesterId,
      name: isSent ? (request.recipientName || `User ${request.recipientId?.slice(-4)}`) : (request.requesterName || `User ${request.requesterId?.slice(-4)}`),
      profilePhoto: '', // Could be added to API response later
    };

    if (!otherUser) return null;

    return (
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherUser.profilePhoto} alt={otherUser.name} />
                <AvatarFallback>{otherUser.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{otherUser.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {new Date(request.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Badge className={getStatusColor(request.status)}>
              {request.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">
                {isSent ? 'You Offer:' : 'They Offer:'}
              </h4>
              <Badge variant="default">{request.skillOffered}</Badge>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">
                {isSent ? 'You Want:' : 'They Want:'}
              </h4>
              <Badge variant="secondary">{request.skillRequested}</Badge>
            </div>
          </div>
          
          {request.message && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Message:</h4>
              <p className="text-sm bg-muted p-3 rounded-md">{request.message}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {!isSent && request.status === 'pending' && (
              <>
                <Button
                  onClick={() => handleAcceptRequest(request._id)}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <CheckCircle className="h-4 w-4" />
                  Accept
                </Button>
                <Button
                  onClick={() => handleRejectRequest(request._id)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
              </>
            )}
            
            {isSent && request.status === 'pending' && (
              <Button
                onClick={() => handleDeleteRequest(request._id)}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}

            {request.status === 'accepted' && (
              <Badge variant="outline" className="flex items-center gap-1 w-fit">
                <MessageSquare className="h-3 w-3" />
                Ready to start swap!
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">Swap Requests</h1>
          <p className="text-muted-foreground">
            Manage your sent and received swap requests.
          </p>
        </div>

        <Tabs defaultValue="received" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="received" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Received ({receivedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Sent ({sentRequests.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="received" className="mt-6">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading...
              </div>
            ) : receivedRequests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No received requests yet.</p>
                <p className="text-sm">When others send you swap requests, they'll appear here.</p>
              </div>
            ) : (
              <div>
                {receivedRequests.map((request) => (
                  <RequestCard key={request._id} request={request} isSent={false} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="sent" className="mt-6">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading...
              </div>
            ) : sentRequests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No sent requests yet.</p>
                <p className="text-sm">Send swap requests to other users to get started!</p>
              </div>
            ) : (
              <div>
                {sentRequests.map((request) => (
                  <RequestCard key={request._id} request={request} isSent={true} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SwapRequests;

import { useState } from 'react';
import { demoSwapRequests, demoUsers, currentUserId } from '@/data/demoData';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Clock, Trash2, MessageSquare } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const SwapRequests = () => {
  const [requests, setRequests] = useState(demoSwapRequests);

  const sentRequests = requests.filter(r => r.fromUserId === currentUserId);
  const receivedRequests = requests.filter(r => r.toUserId === currentUserId);

  const getUserById = (id: string) => demoUsers.find(u => u.id === id);

  const handleAcceptRequest = (requestId: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'accepted' as const } : req
    ));
    toast.success('Swap request accepted!');
  };

  const handleRejectRequest = (requestId: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'rejected' as const } : req
    ));
    toast.success('Swap request rejected.');
  };

  const handleDeleteRequest = (requestId: string) => {
    setRequests(prev => prev.filter(req => req.id !== requestId));
    toast.success('Swap request deleted.');
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

  const RequestCard = ({ request, isSent }: { request: typeof demoSwapRequests[0], isSent: boolean }) => {
    const otherUser = getUserById(isSent ? request.toUserId : request.fromUserId);
    if (!otherUser) return null;

    return (
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherUser.profilePhoto} alt={otherUser.name} />
                <AvatarFallback>{otherUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
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
              <Badge variant="secondary">{request.skillWanted}</Badge>
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
                  onClick={() => handleAcceptRequest(request.id)}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <CheckCircle className="h-4 w-4" />
                  Accept
                </Button>
                <Button
                  onClick={() => handleRejectRequest(request.id)}
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
                onClick={() => handleDeleteRequest(request.id)}
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
            {receivedRequests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No received requests yet.</p>
                <p className="text-sm">When others send you swap requests, they'll appear here.</p>
              </div>
            ) : (
              <div>
                {receivedRequests.map((request) => (
                  <RequestCard key={request.id} request={request} isSent={false} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="sent" className="mt-6">
            {sentRequests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No sent requests yet.</p>
                <p className="text-sm">Send swap requests to other users to get started!</p>
              </div>
            ) : (
              <div>
                {sentRequests.map((request) => (
                  <RequestCard key={request.id} request={request} isSent={true} />
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

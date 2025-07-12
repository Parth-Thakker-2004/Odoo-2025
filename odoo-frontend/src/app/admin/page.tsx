'use client'
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Shield, Users, MessageSquare, Download, AlertTriangle, CheckCircle, XCircle, Ban } from 'lucide-react';
import { demoUsers, demoSwapRequests, demoFeedback } from '@/data/demoData';

const Admin = () => {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [banReason, setBanReason] = useState('');
  const [platformMessage, setPlatformMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [searchTerm, setSearchTerm] = useState('');

  const handleRejectSkill = (userId: any, skillType: 'offered' | 'wanted', skill: string) => {
    toast({
      title: "Skill Rejected",
      description: `Rejected "${skill}" from user ${userId}`,
    });
  };

  const handleBanUser = (userId: number) => {
    if (!banReason) {
      toast({
        title: "Error",
        description: "Please provide a reason for banning the user",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "User Banned",
      description: `User ${userId} has been banned: ${banReason}`,
      variant: "destructive",
    });
    setBanReason('');
  };

  const handleSendPlatformMessage = () => {
    if (!platformMessage) {
      toast({
        title: "Error",
        description: "Please enter a message to send",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Platform Message Sent",
      description: `${messageType.toUpperCase()}: ${platformMessage}`,
    });
    setPlatformMessage('');
  };

  const handleDownloadReport = (reportType: string) => {
    toast({
      title: "Report Generated",
      description: `${reportType} report is being downloaded...`,
    });
  };

  const getSwapStatusBadge = (status: string) => {
    const variants = {
      pending: 'default',
      accepted: 'default',
      rejected: 'destructive',
      cancelled: 'secondary'
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants] || 'default'}>{status}</Badge>;
  };

  const filteredUsers = demoUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.skillsOffered.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
    user.skillsWanted.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="swaps" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Swaps
            </TabsTrigger>
            <TabsTrigger value="messaging" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Messaging
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="moderation" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Moderation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <div className="flex gap-4">
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Skills Offered</TableHead>
                      <TableHead>Skills Wanted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.location}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.skillsOffered.map((skill, index) => (
                              <div key={index} className="flex items-center gap-1">
                                <Badge variant="outline">{skill}</Badge>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRejectSkill(user.id, 'offered', skill)}
                                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                >
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.skillsWanted.map((skill, index) => (
                              <div key={index} className="flex items-center gap-1">
                                <Badge variant="secondary">{skill}</Badge>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRejectSkill(user.id, 'wanted', skill)}
                                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                >
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setSelectedUser(user.id.toString())}
                            className="flex items-center gap-2"
                          >
                            <Ban className="h-4 w-4" />
                            Ban User
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {selectedUser && (
              <Card>
                <CardHeader>
                  <CardTitle>Ban User</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="banReason">Reason for Ban</Label>
                    <Textarea
                      id="banReason"
                      placeholder="Enter reason for banning this user..."
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={() => handleBanUser(parseInt(selectedUser))}
                    >
                      Confirm Ban
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedUser('');
                        setBanReason('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="swaps" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Swap Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>From User</TableHead>
                      <TableHead>To User</TableHead>
                      <TableHead>Offered Skill</TableHead>
                      <TableHead>Wanted Skill</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {demoSwapRequests.map((request) => {
                      const fromUser = demoUsers.find(u => u.id === request.fromUserId);
                      const toUser = demoUsers.find(u => u.id === request.toUserId);
                      return (
                        <TableRow key={request.id}>
                          <TableCell>{fromUser?.name}</TableCell>
                          <TableCell>{toUser?.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{request.skillOffered}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{request.skillWanted}</Badge>
                          </TableCell>
                          <TableCell>{getSwapStatusBadge(request.status)}</TableCell>
                          <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                View Details
                              </Button>
                              {request.status === 'pending' && (
                                <Button size="sm" variant="destructive">
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messaging" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform-wide Messaging</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="messageType">Message Type</Label>
                  <Select value={messageType} onValueChange={setMessageType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Information</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="feature">Feature Update</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="platformMessage">Message</Label>
                  <Textarea
                    id="platformMessage"
                    placeholder="Enter your platform-wide message..."
                    value={platformMessage}
                    onChange={(e) => setPlatformMessage(e.target.value)}
                  />
                </div>
                <Button onClick={handleSendPlatformMessage} className="w-full">
                  Send Platform Message
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Activity Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download comprehensive user activity data including registrations, profile updates, and engagement metrics.
                  </p>
                  <Button onClick={() => handleDownloadReport('User Activity')} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Feedback Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Export all user feedback and ratings to analyze platform satisfaction and areas for improvement.
                  </p>
                  <Button onClick={() => handleDownloadReport('Feedback Logs')} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Swap Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get detailed statistics on swap requests, success rates, popular skills, and platform usage trends.
                  </p>
                  <Button onClick={() => handleDownloadReport('Swap Statistics')} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{demoUsers.length}</div>
                    <div className="text-sm text-muted-foreground">Total Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{demoSwapRequests.length}</div>
                    <div className="text-sm text-muted-foreground">Total Swaps</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {demoSwapRequests.filter(r => r.status === 'accepted').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Successful Swaps</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{demoFeedback.length}</div>
                    <div className="text-sm text-muted-foreground">Feedback Entries</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="moderation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Moderation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Recent Feedback for Review</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Comment</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {demoFeedback.map((feedback) => {
                        const user = demoUsers.find(u => u.id === feedback.fromUserId);
                        return (
                          <TableRow key={feedback.id}>
                            <TableCell>{user?.name}</TableCell>
                            <TableCell>{feedback.rating}/5</TableCell>
                            <TableCell className="max-w-xs truncate">{feedback.comment}</TableCell>
                            <TableCell>{new Date(feedback.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="destructive">
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;

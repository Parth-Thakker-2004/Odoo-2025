'use client'
import { demoUsers, demoSwapRequests, currentUserId } from '@/data/demoData';
import Navigation from '@/components/Navigation';
import UserCard from '@/components/UserCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare, Star, TrendingUp } from 'lucide-react';
// import { Link } from 'react-router-dom';
import Link from 'next/link';

const Dashboard = () => {
  const currentUser = demoUsers.find(u => u.id === currentUserId);
  const myRequests = demoSwapRequests.filter(r => r.fromUserId === currentUserId || r.toUserId === currentUserId);
  const pendingRequests = myRequests.filter(r => r.status === 'pending');
  const completedSwaps = myRequests.filter(r => r.status === 'completed');
  
  // Show recent public users (excluding current user)
  const recentUsers = demoUsers
    .filter(u => u.id !== currentUserId && u.profileVisibility === 'public')
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Welcome to Skill Swap Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with others to share knowledge, learn new skills, and grow together.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{demoUsers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingRequests.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentUser?.rating || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Swaps</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedSwaps.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button asChild className="h-auto p-4 flex flex-col items-center gap-2">
                <Link href="/search">
                  <Users className="h-6 w-6" />
                  <span>Find Skills</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <Link href="/swap-requests">
                  <MessageSquare className="h-6 w-6" />
                  <span>My Requests</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <Link href="/feedback">
                  <Star className="h-6 w-6" />
                  <span>Leave Feedback</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <Link href="/my-profile">
                  <Users className="h-6 w-6" />
                  <span>My Profile</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Recent Users</h2>
            <Button asChild variant="outline">
              <Link href="/search">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
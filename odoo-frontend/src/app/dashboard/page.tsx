'use client'
import { demoUsers, demoSwapRequests, currentUserId } from '@/data/demoData';
import Navigation from '@/components/Navigation';
import UserCard from '@/components/UserCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare, Star, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const Dashboard = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [swaps, setSwaps] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingRequests: 0,
    completedSwaps: 0,
    feedbacks: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const token = localStorage.getItem('auth_token');
        let userId = null;
        if (token) {
          const profileResponse = await fetch('/api/auth/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            userId = profileData.user?._id;
            setCurrentUserId(userId);
            setCurrentUserProfile(profileData.user);
          }
        }

        // Fetch users
        const usersResponse = await fetch('/api/users');
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          const usersArray = usersData.data?.users || [];
          const formattedUsers = usersArray.map((u: any) => ({ ...u, id: u._id || u.id }));
          setUsers(formattedUsers);
          
          // Update stats - total users
          setStats(prev => ({ ...prev, totalUsers: formattedUsers.length }));
        }

        // Fetch swaps
        const swapsResponse = await fetch('/api/swaps');
        if (swapsResponse.ok) {
          const swapsData = await swapsResponse.json();
          setSwaps(swapsData);
          
          // Calculate swap stats for current user if we have userId
          if (userId) {
            const userSwaps = swapsData.filter((swap: any) => 
              swap.requesterId === userId || swap.recipientId === userId
            );
            const pending = userSwaps.filter((swap: any) => swap.status === 'pending').length;
            const completed = userSwaps.filter((swap: any) => swap.status === 'accepted').length;
            
            setStats(prev => ({ 
              ...prev, 
              pendingRequests: pending,
              completedSwaps: completed
            }));
          }
        }

        // TODO: Fetch feedback data when API is available
        // const feedbackResponse = await fetch('/api/feedback');
        // if (feedbackResponse.ok) {
        //   const feedbackData = await feedbackResponse.json();
        //   setStats(prev => ({ ...prev, feedbacks: feedbackData.length }));
        // }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Remove currentUserId dependency since we handle it inside the effect

  const handleRequestSwap = (recipientUser: any) => {
    if (!currentUserId) {
      // Handle not logged in
      return;
    }
    // This will be handled by UserCard component
  };

  // Show recent public users (excluding current user)
  const recentUsers = users
    .filter(u => u.id !== currentUserId && u.isPublic)
    .slice(0, 6); // Show more users like in search


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
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.totalUsers}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.pendingRequests}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Swaps</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.completedSwaps}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Feedback</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.feedbacks}
              </div>
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
              <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
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
          
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading users...</p>
            </div>
          ) : recentUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No users found.</p>
              <p className="text-sm">Check back later for new users to connect with.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentUsers.map((user) => (
                <UserCard 
                  key={user.id} 
                  user={user} 
                  onRequestSwap={() => handleRequestSwap(user)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
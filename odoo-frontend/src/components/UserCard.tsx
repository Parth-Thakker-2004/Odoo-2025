import { useState, useEffect } from 'react';
import { User, currentUserId, demoUsers } from '@/data/demoData';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MapPin, Clock, Star, Send, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface UserCardProps {
    user: User;
    showRequestButton?: boolean;
    onRequestSwap?: (user:User)=>void;
}

const UserCard = ({ user, showRequestButton = true }: UserCardProps) => {
    const [loading, setLoading] = useState(false);
    const [showSwapDialog, setShowSwapDialog] = useState(false);
    const [skillOffered, setSkillOffered] = useState('');
    const [skillRequested, setSkillRequested] = useState('');
    const [currentUserProfile, setCurrentUserProfile] = useState<User | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);

    // Fetch current user's profile from API
    const fetchCurrentUserProfile = async () => {
        setProfileLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                console.error('No auth token found');
                return;
            }

            const response = await fetch('/api/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const responseData = await response.json();
                // Handle the API response structure: { success: true, user: {...} }
                if (responseData.success && responseData.user) {
                    setCurrentUserProfile(responseData.user);
                } else {
                    console.error('Invalid API response structure');
                }
            } else {
                console.error('Failed to fetch profile');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setProfileLoading(false);
        }
    };

    // Fetch profile when component mounts or dialog opens
    useEffect(() => {
        if (showSwapDialog && !currentUserProfile) {
            fetchCurrentUserProfile();
        }
    }, [showSwapDialog]);

    // Get current user data - prefer API data over demo data
    const currentUser = currentUserProfile || demoUsers.find(u => u.id === currentUserId);

    const handleSendRequest = async () => {
        if (user.id === currentUserId) {
            toast.error("You can't send a request to yourself!");
            return;
        }

        if (!skillOffered || !skillRequested) {
            toast.error("Please select both skills");
            return;
        }

        // Get the actual user ID from the profile or fallback to demo ID
        const requesterId = currentUserProfile?.id || currentUserId;

        if (!currentUserProfile?.name) {
            toast.error('User profile not loaded. Please try again.');
            return;
        }

        setLoading(true);
        try {
            const requestData = {
                requester: requesterId,
                recipient: user.id,
                requesterId: requesterId,
                recipientId: user.id,
                requesterName: currentUserProfile.name,
                recipientName: user.name,
                skillOffered: skillOffered,
                skillRequested: skillRequested,
            };

            console.log('UserCard sending swap request data:', requestData);
            console.log('Current user profile:', currentUserProfile);
            console.log('Target user:', user);

            const res = await fetch('/api/swaps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData),
            });

            console.log('UserCard Response status:', res.status);
            const responseData = await res.json();
            console.log('UserCard Response data:', responseData);

            if (res.ok) {
                toast.success('Swap request sent!');
                setShowSwapDialog(false);
                setSkillOffered('');
                setSkillRequested('');
            } else {
                console.error('UserCard Error response:', responseData);
                toast.error(responseData.error || 'Failed to send swap request.');
            }
        } catch (error) {
            console.error('UserCard Error sending swap request:', error);
            toast.error('Failed to send swap request.');
        } finally {
            setLoading(false);
        }
    };

    const openSwapDialog = () => {
        setShowSwapDialog(true);
        setSkillOffered('');
        setSkillRequested('');
    };

    const isPrivate = user.profileVisibility === 'private';
 
    return (
        <Card className="w-full max-w-md hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={user.profilePhoto} alt={user.name} />
                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                            {user.name}
                            {isPrivate ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                        </CardTitle>
                        {user.location && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {user.location}
                            </p>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{user.rating}</span>
                    <span className="text-sm text-muted-foreground">({user.completedSwaps} swaps)</span>
                </div>
                <div>
                    <h4 className="text-sm font-medium mb-2">Skills Offered:</h4>
                    <div className="flex flex-wrap gap-1">
                        {user.skillsOffered.map((skill) => (
                            <Badge key={skill} variant="default" className="text-xs">
                                {skill}
                            </Badge>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="text-sm font-medium mb-2">Skills Wanted:</h4>
                    <div className="flex flex-wrap gap-1">
                        {user.skillsWanted.map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                            </Badge>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Availability:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                        {user.availability.map((time) => (
                            <Badge key={time} variant="outline" className="text-xs">
                                {time}
                            </Badge>
                        ))}
                    </div>
                </div>
            </CardContent>
            {showRequestButton && user.id !== currentUserId && (
                <CardFooter>
                    <Dialog open={showSwapDialog} onOpenChange={setShowSwapDialog}>
                        <DialogTrigger asChild>
                            <Button onClick={openSwapDialog} className="w-full" disabled={isPrivate}>
                                <Send className="h-4 w-4 mr-2" />
                                {isPrivate ? 'Private Profile' : 'Send Swap Request'}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="w-full max-w-none mx-4">
                            <DialogHeader>
                                <DialogTitle>Send Swap Request to {user.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="skillOffered">Skill You Offer</Label>
                                    <Select value={skillOffered} onValueChange={setSkillOffered}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={
                                                profileLoading 
                                                    ? "Loading your skills..." 
                                                    : currentUser?.skillsOffered?.length 
                                                        ? "Select a skill you offer" 
                                                        : "No skills found in your profile"
                                            } />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {currentUser?.skillsOffered?.map((skill) => (
                                                <SelectItem key={skill} value={skill}>
                                                    {skill}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="skillRequested">Skill You Want</Label>
                                    <Select value={skillRequested} onValueChange={setSkillRequested}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a skill you want" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {user.skillsOffered.map((skill) => (
                                                <SelectItem key={skill} value={skill}>
                                                    {skill}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex gap-2 pt-4">
                                    <Button 
                                        onClick={() => setShowSwapDialog(false)} 
                                        variant="outline" 
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        onClick={handleSendRequest} 
                                        className="flex-1"
                                        disabled={loading || !skillOffered || !skillRequested}
                                    >
                                        {loading ? 'Sending...' : 'Send Request'}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardFooter>
            )}
        </Card>
    );
};

export default UserCard;
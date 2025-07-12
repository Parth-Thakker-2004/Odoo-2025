import { useState } from 'react';
import { User, currentUserId } from '@/data/demoData';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Clock, Star, Send, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface UserCardProps {
    user: User;
    showRequestButton?: boolean;
    onRequestSwap?: (user:User)=>void;
}

const UserCard = ({ user, showRequestButton = true }: UserCardProps) => {
    const [loading, setLoading] = useState(false);

    const handleSendRequest = async () => {
        if (user.id === currentUserId) {
            toast.error("You can't send a request to yourself!");
            return;
        }

        // Prompt for skills
        const skillOffered = prompt("Enter the skill you offer:");
        const skillRequested = prompt("Enter the skill you want from this user:");

        if (!skillOffered || !skillRequested) return;

        setLoading(true);
        try {
            const res = await fetch('/api/swaps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requester: currentUserId,
                    recipient: user.id,
                    skillOffered,
                    skillRequested,
                }),
            });
            if (res.ok) {
                toast.success('Swap request sent!');
            } else {
                toast.error('Failed to send swap request.');
            }
        } catch {
            toast.error('Failed to send swap request.');
        } finally {
            setLoading(false);
        }
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
                    <Button onClick={handleSendRequest} className="w-full" disabled={isPrivate || loading}>
                        <Send className="h-4 w-4 mr-2" />
                        {isPrivate ? 'Private Profile' : loading ? 'Sending...' : 'Send Swap Request'}
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
};

export default UserCard;
'use client'
import { useState, useMemo, useEffect } from 'react';
import { demoUsers } from '@/data/demoData';
import Navigation from '@/components/Navigation';
import UserCard from '@/components/UserCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search as SearchIcon, Filter, MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';

const Search = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'offered' | 'wanted'>('all');
    const [showPrivate, setShowPrivate] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
    const [swapForm, setSwapForm] = useState({
        skillOffered: '',
        skillRequested: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Get current user ID from auth
        const getCurrentUser = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (token) {
                    const response = await fetch('/api/auth/profile', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setCurrentUserId(data.user?._id);
                        setCurrentUserProfile(data.user);
                    }
                }
            } catch (error) {
                console.error('Error getting current user:', error);
            }
        };

        // Fetch all users
        fetch('/api/users')
            .then(res => res.json())
            .then(data => {
                const usersArray = data.data?.users || [];
                setUsers(usersArray.map((u: any) => ({ ...u, id: u._id || u.id })));
            })
            .catch(error => {
                console.error('Error fetching users:', error);
                setUsers(demoUsers);
            });

        getCurrentUser();
    }, []);

    const handleRequestSwap = (recipientUser: any) => {
        if (!currentUserId) {
            toast.error('Please log in to send swap requests');
            return;
        }
        setSelectedUser(recipientUser);
        setSwapForm({ skillOffered: '', skillRequested: '', message: '' });
        setIsModalOpen(true);
    };

    const handleSubmitSwap = async () => {
        if (!swapForm.skillOffered.trim() || !swapForm.skillRequested.trim()) {
            toast.error('Please fill in both skills');
            return;
        }

        if (!currentUserProfile?.name) {
            toast.error('User profile not loaded. Please try again.');
            return;
        }

        if (!selectedUser?.name) {
            toast.error('Selected user data not available. Please try again.');
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('auth_token');
            const requestData = {
                requester: currentUserId,
                recipient: selectedUser.id,
                requesterId: currentUserId,
                recipientId: selectedUser.id,
                requesterName: currentUserProfile.name,
                recipientName: selectedUser.name,
                skillOffered: swapForm.skillOffered.trim(),
                skillRequested: swapForm.skillRequested.trim(),
                message: swapForm.message.trim()
            };

            console.log('Sending swap request data:', requestData);
            console.log('Current user profile:', currentUserProfile);
            console.log('Selected user:', selectedUser);

            const response = await fetch('/api/swaps', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestData),
            });

            console.log('Response status:', response.status);
            const responseData = await response.json();
            console.log('Response data:', responseData);

            if (response.ok) {
                toast.success('Swap request sent successfully!');
                setIsModalOpen(false);
                setSwapForm({ skillOffered: '', skillRequested: '', message: '' });
            } else {
                console.error('Error response:', responseData);
                toast.error(responseData.error || 'Failed to send swap request');
            }
        } catch (error) {
            console.error('Error sending swap request:', error);
            toast.error('Failed to send swap request');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredUsers = useMemo(() => {
        let filtered = users;

        // Filter by privacy setting
        if (!showPrivate) {
            filtered = filtered.filter(user => user.isPublic);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(user => {
                const searchLower = searchTerm.toLowerCase();
                const nameMatch = user.name.toLowerCase().includes(searchLower);
                const locationMatch = user.location?.toLowerCase().includes(searchLower);

                let skillMatch = false;
                if (filterType === 'all') {
                    skillMatch = [
                        ...(user.skillsOffered || []),
                        ...(user.skillsWanted || [])
                    ].some((skill: string) => skill.toLowerCase().includes(searchLower));
                } else if (filterType === 'offered') {
                    skillMatch = (user.skillsOffered || []).some((skill: string) =>
                        skill.toLowerCase().includes(searchLower)
                    );
                } else if (filterType === 'wanted') {
                    skillMatch = (user.skillsWanted || []).some((skill: string) =>
                        skill.toLowerCase().includes(searchLower)
                    );
                }

                return nameMatch || locationMatch || skillMatch;
            });
        }

        return filtered;
    }, [users, searchTerm, filterType, showPrivate]);

    const allSkills = useMemo(() => {
        const skills = new Set<string>();
        users.forEach(user => {
            (user.skillsOffered || []).forEach((skill: string) => skills.add(skill));
            (user.skillsWanted || []).forEach((skill: string) => skills.add(skill));
        });
        return Array.from(skills).sort();
    }, [users]);


    return (
        <div className="min-h-screen bg-background">
            <Navigation />
            <div className="max-w-6xl mx-auto p-6 space-y-6">
                <div className="text-center space-y-4">
                    <h1 className="text-3xl font-bold text-foreground">Find Skills</h1>
                    <p className="text-muted-foreground">
                        Search for users by name, location, or skills to find your perfect swap partner.
                    </p>
                </div>

                {/* Search Controls */}
                <div className="bg-card p-6 rounded-lg border space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search by name, location, or skills..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filterType} onValueChange={(value: 'all' | 'offered' | 'wanted') => setFilterType(value)}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Skills</SelectItem>
                                <SelectItem value="offered">Skills Offered</SelectItem>
                                <SelectItem value="wanted">Skills Wanted</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Popular Skills */}
                    <div>
                        <h3 className="text-sm font-medium mb-2">Popular Skills:</h3>
                        <div className="flex flex-wrap gap-2">
                            {allSkills.slice(0, 8).map((skill) => (
                                <Button
                                    key={skill}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSearchTerm(skill)}
                                    className="text-xs"
                                >
                                    {skill}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">
                            {filteredUsers.length} Users Found
                        </h2>
                    </div>

                    {filteredUsers.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No users found matching your search criteria.</p>
                            <p className="text-sm">Try adjusting your search terms or filters.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredUsers.map((user) => (
                                <UserCard
                                    key={user.id}
                                    user={user}
                                    onRequestSwap={() => handleRequestSwap(user)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Swap Request Modal */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                Request Skill Swap with {selectedUser?.name}
                            </DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="skillOffered">Skill You Offer</Label>
                                <Select 
                                    value={swapForm.skillOffered} 
                                    onValueChange={(value) => setSwapForm(prev => ({...prev, skillOffered: value}))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a skill you can teach" />
                                    </SelectTrigger>
                                    <SelectContent>                        {/* Get current user's skills offered from current user profile */}
                        {currentUserProfile?.skillsOffered?.map((skill: string) => (
                            <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                        )) || <SelectItem value="none">No skills available</SelectItem>}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="skillRequested">Skill You Want to Learn</Label>
                                <Select 
                                    value={swapForm.skillRequested} 
                                    onValueChange={(value) => setSwapForm(prev => ({...prev, skillRequested: value}))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a skill you want to learn" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {selectedUser?.skillsOffered?.map((skill: string) => (
                                            <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                                        )) || <SelectItem value="none">No skills available</SelectItem>}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">Message (Optional)</Label>
                                <Textarea
                                    id="message"
                                    placeholder="Add a personal message..."
                                    value={swapForm.message}
                                    onChange={(e) => setSwapForm(prev => ({...prev, message: e.target.value}))}
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleSubmitSwap} 
                                disabled={isSubmitting || !swapForm.skillOffered || !swapForm.skillRequested}
                                className="flex items-center gap-2"
                            >
                                <Send className="h-4 w-4" />
                                {isSubmitting ? 'Sending...' : 'Send Request'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default Search;
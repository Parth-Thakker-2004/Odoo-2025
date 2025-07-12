'use client'
import { useState, useMemo, useEffect } from 'react';
import { demoUsers } from '@/data/demoData';
import Navigation from '@/components/Navigation';
import UserCard from '@/components/UserCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search as SearchIcon, Filter } from 'lucide-react';

const Search = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'offered' | 'wanted'>('all');
    const [showPrivate, setShowPrivate] = useState(false);

    useEffect(() => {
        fetch('/api/users')
            .then(res => res.json())
            .then(data => {
                // Map _id to id for frontend compatibility
                setUsers(data.map((u: any) => ({ ...u, id: u._id })));
            });
    }, []);

    // TODO: Replace this with actual user ID from authentication/session
    const currentUserId = "demo-user-id";

    const handleRequestSwap = async (recipientUser: any) => {
        // You may want to show a modal to select skills, but here's a simple example:
        const skillOffered = prompt("Enter the skill you offer:");
        const skillRequested = prompt("Enter the skill you want from this user:");

        if (!skillOffered || !skillRequested) return;

        try {
            const res = await fetch('/api/swaps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requester: currentUserId, // You need to get this from auth/session
                    recipient: recipientUser.id,
                    skillOffered,
                    skillRequested,
                }),
            });
            if (res.ok) {
                alert('Swap request sent!');
            } else {
                alert('Failed to send swap request.');
            }
        } catch {
            alert('Failed to send swap request.');
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

                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <Button
                            variant={showPrivate ? "default" : "outline"}
                            size="sm"
                            onClick={() => setShowPrivate(!showPrivate)}
                        >
                            Show Private Profiles
                        </Button>
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
            </div>
        </div>
    );
};

export default Search;
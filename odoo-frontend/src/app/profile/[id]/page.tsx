'use client'
// import { useParams } from 'react-router-dom';
import { useParams } from 'next/navigation';
import { demoUsers, currentUserId } from '@/data/demoData';
import Navigation from '@/components/Navigation';
import UserCard from '@/components/UserCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, MapPin, Clock, Star, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const user = demoUsers.find(u => u.id === id);
  const isOwnProfile = id === currentUserId;
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(user || demoUsers[0]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto p-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">User not found</h1>
        </div>
      </div>
    );
  }

  const handleSaveProfile = () => {
    // In a real app, this would make an API call
    toast.success('Profile updated successfully!');
    setIsEditing(false);
  };

  const handleAddSkill = (type: 'offered' | 'wanted', skill: string) => {
    if (!skill.trim()) return;
    
    if (type === 'offered') {
      setEditData(prev => ({
        ...prev,
        skillsOffered: [...prev.skillsOffered, skill.trim()]
      }));
    } else {
      setEditData(prev => ({
        ...prev,
        skillsWanted: [...prev.skillsWanted, skill.trim()]
      }));
    }
  };

  const handleRemoveSkill = (type: 'offered' | 'wanted', skillToRemove: string) => {
    if (type === 'offered') {
      setEditData(prev => ({
        ...prev,
        skillsOffered: prev.skillsOffered.filter(skill => skill !== skillToRemove)
      }));
    } else {
      setEditData(prev => ({
        ...prev,
        skillsWanted: prev.skillsWanted.filter(skill => skill !== skillToRemove)
      }));
    }
  };

  if (!isOwnProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-foreground">{user.name}'s Profile</h1>
          </div>
          <div className="flex justify-center">
            <UserCard user={user} showRequestButton={true} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <Button
            onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Preview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Profile Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <UserCard user={isEditing ? editData : user} showRequestButton={false} />
              </CardContent>
            </Card>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={editData.profilePhoto} alt={editData.name} />
                    <AvatarFallback className="text-lg">
                      {editData.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button variant="outline" size="sm">
                      Change Photo
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={editData.name}
                      onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={editData.location || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="City, State"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="privacy"
                    checked={editData.profileVisibility === 'public'}
                    onCheckedChange={(checked) => 
                      setEditData(prev => ({ 
                        ...prev, 
                        profileVisibility: checked ? 'public' : 'private' 
                      }))
                    }
                    disabled={!isEditing}
                  />
                  <Label htmlFor="privacy" className="flex items-center gap-2">
                    {editData.profileVisibility === 'public' ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                    Public Profile
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Skills Offered */}
            <Card>
              <CardHeader>
                <CardTitle>Skills I Can Teach</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {editData.skillsOffered.map((skill) => (
                    <Badge
                      key={skill}
                      variant="default"
                      className="flex items-center gap-1"
                    >
                      {skill}
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveSkill('offered', skill)}
                          className="ml-1 text-xs hover:text-red-200"
                        >
                          ×
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill you can teach..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddSkill('offered', e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        handleAddSkill('offered', input.value);
                        input.value = '';
                      }}
                    >
                      Add
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills Wanted */}
            <Card>
              <CardHeader>
                <CardTitle>Skills I Want to Learn</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {editData.skillsWanted.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {skill}
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveSkill('wanted', skill)}
                          className="ml-1 text-xs hover:text-red-500"
                        >
                          ×
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill you want to learn..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddSkill('wanted', e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        handleAddSkill('wanted', input.value);
                        input.value = '';
                      }}
                    >
                      Add
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Availability */}
            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>When are you available for skill swaps?</Label>
                  <Textarea
                    value={editData.availability.join(', ')}
                    onChange={(e) => setEditData(prev => ({ 
                      ...prev, 
                      availability: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                    }))}
                    disabled={!isEditing}
                    placeholder="e.g., weekends, evenings, weekdays"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
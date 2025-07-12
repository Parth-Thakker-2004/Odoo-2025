'use client'
// import { useParams } from 'react-router-dom';
import { useParams } from 'next/navigation';
import { demoUsers, currentUserId } from '@/data/demoData';
import Navigation from '@/components/Navigation';
import UserCard from '@/components/UserCard';
import { SkillsMultiSelect } from '@/components/SkillsMultiSelect';
import { MultiSelect } from '@/components/MultiSelect';
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
import { useState, useEffect } from 'react';

interface CustomSkill {
  name: string;
  category: string;
  isCustom: true;
}

const availabilityOptions = [
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'mornings', label: 'Mornings' },
  { value: 'afternoons', label: 'Afternoons' },
  { value: 'evenings', label: 'Evenings' },
  { value: 'nights', label: 'Nights' },
  { value: 'flexible', label: 'Flexible' },
];

interface User {
  _id?: string;
  id: string;
  name: string;
  email?: string;
  location: string;
  profilePhoto?: string;
  skillsOffered: string[];
  skillsWanted: string[];
  availability: string[];
  isPublic: boolean;
  profileVisibility?: 'public' | 'private';
  rating?: number;
  completedSwaps?: number;
}

const Profile = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<User | null>(null);
  const [customSkillsOffered, setCustomSkillsOffered] = useState<CustomSkill[]>([]);
  const [customSkillsWanted, setCustomSkillsWanted] = useState<CustomSkill[]>([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Check if this is the current user's profile (requires auth)
        const token = localStorage.getItem('auth_token');
        if (token) {
          try {
            // Try to fetch from profile API first (for current user)
            const profileResponse = await fetch('/api/auth/profile', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              if (profileData.user && (profileData.user._id === id || profileData.user.id === id)) {
                // Convert backend user to frontend format
                const backendUser = profileData.user;
                const convertedUser: User = {
                  _id: backendUser._id,
                  id: backendUser._id || backendUser.id,
                  name: backendUser.name,
                  email: backendUser.email,
                  location: backendUser.location || '',
                  profilePhoto: backendUser.profilePhoto,
                  skillsOffered: backendUser.skillsOffered || [],
                  skillsWanted: backendUser.skillsWanted || [],
                  availability: backendUser.availability || [],
                  isPublic: backendUser.isPublic,
                  profileVisibility: backendUser.isPublic ? 'public' : 'private',
                  rating: 0, // Default for now
                  completedSwaps: 0 // Default for now
                };
                setUser(convertedUser);
                setEditData(convertedUser);
                setIsOwnProfile(true);
                setLoading(false);
                return;
              }
            }
          } catch (error) {
            console.log('Not current user profile, trying public fetch');
          }
        }
        
        // Try to fetch from public users API
        try {
          const publicUserResponse = await fetch(`/api/users/${id}`);
          if (publicUserResponse.ok) {
            const userData = await publicUserResponse.json();
            if (userData.user) {
              const backendUser = userData.user;
              const convertedUser: User = {
                _id: backendUser._id,
                id: backendUser.id || backendUser._id,
                name: backendUser.name,
                location: backendUser.location || '',
                profilePhoto: backendUser.profilePhoto,
                skillsOffered: backendUser.skillsOffered || [],
                skillsWanted: backendUser.skillsWanted || [],
                availability: backendUser.availability || [],
                isPublic: backendUser.isPublic,
                profileVisibility: backendUser.profileVisibility || 'public',
                rating: 0, // Default for now
                completedSwaps: 0 // Default for now
              };
              setUser(convertedUser);
              setEditData(convertedUser);
              setIsOwnProfile(false);
              setLoading(false);
              return;
            }
          } else if (publicUserResponse.status === 403) {
            toast.error('This profile is set to private');
          } else if (publicUserResponse.status === 404) {
            toast.error('User not found');
          }
        } catch (error) {
          console.error('Error fetching public user:', error);
        }
        
        // Fallback to demo data only if user is not found in database
        console.log('User not found in database, falling back to demo data for user ID:', id);
        const demoUser = demoUsers.find(u => u.id === id);
        if (demoUser) {
          const convertedUser: User = {
            ...demoUser,
            location: demoUser.location || '',
            isPublic: demoUser.profileVisibility === 'public',
            profileVisibility: demoUser.profileVisibility || 'public'
          };
          setUser(convertedUser);
          setEditData(convertedUser);
          setIsOwnProfile(id === currentUserId);
          console.log('Loaded demo user:', demoUser.name);
        } else {
          setUser(null);
          console.log('No user found with ID:', id);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto p-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">Loading profile...</h1>
        </div>
      </div>
    );
  }

  if (!user || !editData) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto p-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">User not found</h1>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    if (!editData || !isOwnProfile) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Please log in to update your profile');
        return;
      }

      const updatePayload: any = {
        name: editData.name,
        location: editData.location,
        profilePhoto: editData.profilePhoto,
        skillsOffered: editData.skillsOffered,
        skillsWanted: editData.skillsWanted,
        availability: editData.availability,
        isPublic: editData.isPublic
      };

      // Add custom skills if any
      if (customSkillsOffered.length > 0) {
        updatePayload.customSkillsOffered = customSkillsOffered;
      }
      if (customSkillsWanted.length > 0) {
        updatePayload.customSkillsWanted = customSkillsWanted;
      }

      console.log('Sending update payload:', updatePayload);
      
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatePayload),
      });

      const result = await response.json();
      console.log('Update response:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update profile');
      }

      // Update local state with returned data
      if (result.user) {
        const backendUser = result.user;
        const convertedUser: User = {
          _id: backendUser._id,
          id: backendUser._id || backendUser.id,
          name: backendUser.name,
          email: backendUser.email,
          location: backendUser.location || '',
          profilePhoto: backendUser.profilePhoto,
          skillsOffered: backendUser.skillsOffered || [],
          skillsWanted: backendUser.skillsWanted || [],
          availability: backendUser.availability || [],
          isPublic: backendUser.isPublic,
          profileVisibility: backendUser.isPublic ? 'public' : 'private',
          rating: 0, // Default for now
          completedSwaps: 0 // Default for now
        };
        setUser(convertedUser);
        setEditData(convertedUser);
      }

      toast.success(result.message || 'Profile updated successfully!');
      setIsEditing(false);
      
      // Reset custom skills after successful save
      setCustomSkillsOffered([]);
      setCustomSkillsWanted([]);

    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploadingPhoto(true);

    try {
      // Convert image to base64 for simple storage
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64String = e.target?.result as string;
        
        // Update editData with new profile photo
        setEditData(prev => prev ? {
          ...prev,
          profilePhoto: base64String
        } : null);

        toast.success('Photo uploaded! Don\'t forget to save your changes.');
        setUploadingPhoto(false);
      };
      
      reader.onerror = () => {
        toast.error('Failed to read image file');
        setUploadingPhoto(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Photo upload error:', error);
      toast.error('Failed to upload photo');
      setUploadingPhoto(false);
    }
  };

  const handleAddSkill = (type: 'offered' | 'wanted', skill: string) => {
    if (!skill.trim() || !editData) return;
    
    if (type === 'offered') {
      setEditData(prev => prev ? {
        ...prev,
        skillsOffered: [...prev.skillsOffered, skill.trim()]
      } : null);
    } else {
      setEditData(prev => prev ? {
        ...prev,
        skillsWanted: [...prev.skillsWanted, skill.trim()]
      } : null);
    }
  };

  const handleRemoveSkill = (type: 'offered' | 'wanted', skillToRemove: string) => {
    if (!editData) return;
    
    if (type === 'offered') {
      setEditData(prev => prev ? {
        ...prev,
        skillsOffered: prev.skillsOffered.filter(skill => skill !== skillToRemove)
      } : null);
    } else {
      setEditData(prev => prev ? {
        ...prev,
        skillsWanted: prev.skillsWanted.filter(skill => skill !== skillToRemove)
      } : null);
    }
  };

  // Convert our User type to the UserCard expected type
  const convertToUserCardUser = (userData: User): import('@/data/demoData').User => ({
    id: userData.id,
    name: userData.name,
    location: userData.location,
    profilePhoto: userData.profilePhoto,
    skillsOffered: userData.skillsOffered,
    skillsWanted: userData.skillsWanted,
    availability: userData.availability,
    profileVisibility: userData.profileVisibility || 'public',
    rating: userData.rating || 0,
    completedSwaps: userData.completedSwaps || 0
  });

  if (!isOwnProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-foreground">{user.name}'s Profile</h1>
          </div>
          <div className="flex justify-center">
            <UserCard user={convertToUserCardUser(user)} showRequestButton={true} />
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
                <UserCard user={convertToUserCardUser(isEditing ? editData! : user)} showRequestButton={false} />
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
                    <AvatarImage src={editData?.profilePhoto} alt={editData?.name} />
                    <AvatarFallback className="text-lg">
                      {editData?.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        style={{ display: 'none' }}
                        id="photo-upload"
                        disabled={uploadingPhoto}
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById('photo-upload')?.click()}
                        disabled={uploadingPhoto}
                      >
                        {uploadingPhoto ? 'Uploading...' : 'Change Photo'}
                      </Button>
                      {editData?.profilePhoto && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setEditData(prev => prev ? { ...prev, profilePhoto: '' } : null);
                            toast.success('Photo removed! Don\'t forget to save your changes.');
                          }}
                          disabled={uploadingPhoto}
                        >
                          Remove Photo
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={editData?.name || ''}
                      onChange={(e) => setEditData(prev => prev ? { ...prev, name: e.target.value } : null)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={editData?.location || ''}
                      onChange={(e) => setEditData(prev => prev ? { ...prev, location: e.target.value } : null)}
                      disabled={!isEditing}
                      placeholder="City, State"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="privacy"
                    checked={editData?.profileVisibility === 'public'}
                    onCheckedChange={(checked) => 
                      setEditData(prev => prev ? { 
                        ...prev, 
                        profileVisibility: checked ? 'public' : 'private',
                        isPublic: checked
                      } : null)
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
                {isEditing ? (
                  <SkillsMultiSelect 
                    selected={editData?.skillsOffered || []}
                    onChange={(selected: string[], customSkills: CustomSkill[]) => {
                      setEditData(prev => prev ? { ...prev, skillsOffered: selected } : null);
                      setCustomSkillsOffered(customSkills);
                    }}
                    placeholder="Select or add skills you can teach..."
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {editData?.skillsOffered.map((skill) => (
                      <Badge key={skill} variant="default">
                        {skill}
                      </Badge>
                    ))}
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
                {isEditing ? (
                  <SkillsMultiSelect 
                    selected={editData?.skillsWanted || []}
                    onChange={(selected: string[], customSkills: CustomSkill[]) => {
                      setEditData(prev => prev ? { ...prev, skillsWanted: selected } : null);
                      setCustomSkillsWanted(customSkills);
                    }}
                    placeholder="Select or add skills you want to learn..."
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {editData?.skillsWanted.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
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
                  {isEditing ? (
                    <MultiSelect 
                      options={availabilityOptions}
                      selected={editData?.availability || []}
                      onChange={(selected: string[]) => setEditData(prev => prev ? { 
                        ...prev, 
                        availability: selected
                      } : null)}
                      placeholder="Select your availability..."
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {editData?.availability.map((availability) => (
                        <Badge key={availability} variant="outline">
                          {availabilityOptions.find(opt => opt.value === availability)?.label || availability}
                        </Badge>
                      ))}
                    </div>
                  )}
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
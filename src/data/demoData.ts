
export interface User {
  id: string;
  name: string;
  location?: string;
  profilePhoto?: string;
  skillsOffered: string[];
  skillsWanted: string[];
  availability: string[];
  profileVisibility: 'public' | 'private';
  rating: number;
  completedSwaps: number;
}

export interface SwapRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  skillOffered: string;
  skillWanted: string;
  message: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface FeedbackEntry {
  id: string;
  swapRequestId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export const demoUsers: User[] = [
  {
    id: '1',
    name: 'Alex Chen',
    location: 'San Francisco, CA',
    profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    skillsOffered: ['Web Design', 'UI/UX Design', 'Figma'],
    skillsWanted: ['Python', 'Data Analysis'],
    availability: ['weekends', 'evenings'],
    profileVisibility: 'public',
    rating: 4.8,
    completedSwaps: 12
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    location: 'New York, NY',
    profilePhoto: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    skillsOffered: ['Cooking', 'Baking', 'Food Photography'],
    skillsWanted: ['Photography', 'Photo Editing'],
    availability: ['weekends'],
    profileVisibility: 'public',
    rating: 4.9,
    completedSwaps: 8
  },
  {
    id: '3',
    name: 'Michael Rodriguez',
    location: 'Austin, TX',
    skillsOffered: ['Python', 'Machine Learning', 'Data Science'],
    skillsWanted: ['Guitar', 'Music Production'],
    availability: ['evenings', 'weekdays'],
    profileVisibility: 'private',
    rating: 4.7,
    completedSwaps: 15
  },
  {
    id: '4',
    name: 'Emily Watson',
    location: 'Portland, OR',
    profilePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    skillsOffered: ['Photography', 'Photoshop', 'Lightroom'],
    skillsWanted: ['Web Design', 'Marketing'],
    availability: ['weekends', 'afternoons'],
    profileVisibility: 'public',
    rating: 4.6,
    completedSwaps: 10
  },
  {
    id: '5',
    name: 'David Kim',
    location: 'Seattle, WA',
    profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    skillsOffered: ['Excel', 'Data Visualization', 'Business Analysis'],
    skillsWanted: ['Spanish', 'Public Speaking'],
    availability: ['weekends'],
    profileVisibility: 'public',
    rating: 4.5,
    completedSwaps: 6
  },
  {
    id: '6',
    name: 'Lisa Chang',
    location: 'Los Angeles, CA',
    skillsOffered: ['Guitar', 'Music Theory', 'Songwriting'],
    skillsWanted: ['Video Editing', 'YouTube Marketing'],
    availability: ['evenings'],
    profileVisibility: 'private',
    rating: 4.9,
    completedSwaps: 11
  }
];

export const demoSwapRequests: SwapRequest[] = [
  {
    id: '1',
    fromUserId: '1',
    toUserId: '3',
    status: 'pending',
    skillOffered: 'Web Design',
    skillWanted: 'Python',
    message: 'Hi! I\'d love to learn Python from you in exchange for web design lessons.',
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    fromUserId: '2',
    toUserId: '4',
    status: 'accepted',
    skillOffered: 'Cooking',
    skillWanted: 'Photography',
    message: 'Would you like to trade cooking lessons for photography tips?',
    createdAt: new Date('2024-01-10')
  },
  {
    id: '3',
    fromUserId: '4',
    toUserId: '1',
    status: 'completed',
    skillOffered: 'Photography',
    skillWanted: 'UI/UX Design',
    message: 'I can teach you photography techniques for UX design help.',
    createdAt: new Date('2024-01-05'),
    completedAt: new Date('2024-01-12')
  },
  {
    id: '4',
    fromUserId: '5',
    toUserId: '6',
    status: 'rejected',
    skillOffered: 'Excel',
    skillWanted: 'Guitar',
    message: 'Excel training for guitar lessons?',
    createdAt: new Date('2024-01-08')
  }
];

export const demoFeedback: FeedbackEntry[] = [
  {
    id: '1',
    swapRequestId: '3',
    fromUserId: '4',
    toUserId: '1',
    rating: 5,
    comment: 'Alex was an amazing teacher! Very patient and knowledgeable about UX design.',
    createdAt: new Date('2024-01-13')
  },
  {
    id: '2',
    swapRequestId: '3',
    fromUserId: '1',
    toUserId: '4',
    rating: 5,
    comment: 'Emily\'s photography skills are incredible. Learned so much in our sessions!',
    createdAt: new Date('2024-01-13')
  }
];

// Current user ID for demo purposes
export const currentUserId = '1';

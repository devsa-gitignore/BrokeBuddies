// Mock data for HackFire platform

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  avatar?: string;
  hackScore: number;
  verified: boolean;
  documents?: {
    idCard?: string;
    aadhar?: string;
    selfie?: string;
  };
}

export interface Hackathon {
  id: string;
  name: string;
  hostedBy: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  round1Deadline: string;
  finalRoundDate: string;
  status: 'open' | 'ongoing' | 'closed';
  rules: string[];
  timeline: { date: string; event: string }[];
  sponsors: string[];
  bannerImage?: string;
}

export interface Team {
  id: string;
  hackathonId: string;
  name: string;
  members: { userId: string; name: string; email: string; avatar?: string }[];
  leaderId: string;
  problemId?: string;
  round1Submitted: boolean;
  round1Score?: number;
  shortlisted: boolean;
  mentorId?: string;
  finalSubmitted: boolean;
  finalScore?: number;
  rank?: number;
}

export interface Problem {
  id: string;
  hackathonId: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Mentor {
  id: string;
  hackathonId: string;
  name: string;
  photo?: string;
  linkedin: string;
  expertise: string;
}

export interface Submission {
  id: string;
  teamId: string;
  hackathonId: string;
  round: 1 | 2;
  pptUrl?: string;
  githubUrl?: string;
  demoUrl?: string;
  submittedAt: string;
}

export interface QRCode {
  id: string;
  hackathonId: string;
  type: 'entry' | 'breakfast' | 'lunch' | 'dinner';
  code: string;
  active: boolean;
}

export interface Attendance {
  id: string;
  hackathonId: string;
  userId: string;
  userName: string;
  timestamp: string;
  type: 'entry' | 'breakfast' | 'lunch' | 'dinner';
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface Broadcast {
  id: string;
  hackathonId: string;
  message: string;
  timestamp: string;
  sentBy: string;
}

// Mock Data
export const mockUsers: User[] = [
  {
    id: 'user1',
    name: 'Alex Johnson',
    email: 'alex@student.edu',
    role: 'student',
    hackScore: 850,
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
  },
  {
    id: 'admin1',
    name: 'Admin User',
    email: 'admin@college.edu',
    role: 'admin',
    hackScore: 0,
    verified: true,
  },
];

export const mockHackathons: Hackathon[] = [
  {
    id: 'hack1',
    name: 'InnovateTech 2026',
    hostedBy: 'MIT College of Engineering',
    description: 'Build innovative solutions for real-world problems using cutting-edge technology.',
    startDate: '2026-03-15T09:00:00',
    endDate: '2026-03-17T18:00:00',
    registrationDeadline: '2026-03-10T23:59:59',
    round1Deadline: '2026-03-14T23:59:59',
    finalRoundDate: '2026-03-17T16:00:00',
    status: 'open',
    rules: [
      'Teams must have 3-5 members',
      'All code must be original',
      'Submissions after deadline will not be accepted',
      'Code of conduct must be followed',
    ],
    timeline: [
      { date: '2026-03-10', event: 'Registration Closes' },
      { date: '2026-03-14', event: 'Round 1 Submission Deadline' },
      { date: '2026-03-15', event: 'Hackathon Begins' },
      { date: '2026-03-17', event: 'Final Presentation' },
    ],
    sponsors: ['TechCorp', 'InnovateLabs', 'CodeNation'],
    bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
  },
  {
    id: 'hack2',
    name: 'CodeStorm 2026',
    hostedBy: 'Stanford University',
    description: 'A 48-hour coding marathon focused on AI and Machine Learning solutions.',
    startDate: '2026-04-20T10:00:00',
    endDate: '2026-04-22T18:00:00',
    registrationDeadline: '2026-04-15T23:59:59',
    round1Deadline: '2026-04-18T23:59:59',
    finalRoundDate: '2026-04-22T16:00:00',
    status: 'open',
    rules: [
      'Open to all students',
      'Must use provided datasets',
      'AI ethics guidelines must be followed',
    ],
    timeline: [
      { date: '2026-04-15', event: 'Registration Closes' },
      { date: '2026-04-18', event: 'Idea Submission' },
      { date: '2026-04-20', event: 'Event Kickoff' },
    ],
    sponsors: ['AI Labs', 'DataTech'],
    bannerImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=400&fit=crop',
  },
  {
    id: 'hack3',
    name: 'HackTheChange 2025',
    hostedBy: 'IIT Bombay',
    description: 'Build solutions for social good and sustainability.',
    startDate: '2025-12-10T09:00:00',
    endDate: '2025-12-12T18:00:00',
    registrationDeadline: '2025-12-05T23:59:59',
    round1Deadline: '2025-12-08T23:59:59',
    finalRoundDate: '2025-12-12T16:00:00',
    status: 'closed',
    rules: ['Focus on social impact', 'Sustainable solutions preferred'],
    timeline: [],
    sponsors: ['GreenTech', 'EcoSolutions'],
    bannerImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop',
  },
];

export const mockProblems: Problem[] = [
  {
    id: 'prob1',
    hackathonId: 'hack1',
    title: 'Smart City Traffic Management',
    description: 'Design an AI-powered system to optimize traffic flow in urban areas.',
    difficulty: 'hard',
  },
  {
    id: 'prob2',
    hackathonId: 'hack1',
    title: 'Healthcare Appointment Scheduler',
    description: 'Build a platform to streamline hospital appointment booking.',
    difficulty: 'medium',
  },
  {
    id: 'prob3',
    hackathonId: 'hack1',
    title: 'Student Collaboration Platform',
    description: 'Create a tool for students to collaborate on projects remotely.',
    difficulty: 'easy',
  },
];

export const mockMentors: Mentor[] = [
  {
    id: 'mentor1',
    hackathonId: 'hack1',
    name: 'Dr. Sarah Mitchell',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    linkedin: 'https://linkedin.com/in/sarahmitchell',
    expertise: 'AI & Machine Learning',
  },
  {
    id: 'mentor2',
    hackathonId: 'hack1',
    name: 'Prof. James Chen',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    linkedin: 'https://linkedin.com/in/jameschen',
    expertise: 'Full Stack Development',
  },
  {
    id: 'mentor3',
    hackathonId: 'hack1',
    name: 'Emily Rodriguez',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    linkedin: 'https://linkedin.com/in/emilyrodriguez',
    expertise: 'Cloud Architecture',
  },
];

export const mockTeams: Team[] = [
  {
    id: 'team1',
    hackathonId: 'hack1',
    name: 'Code Crusaders',
    members: [
      {
        userId: 'user1',
        name: 'Alex Johnson',
        email: 'alex@student.edu',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      },
      {
        userId: 'user2',
        name: 'Maria Garcia',
        email: 'maria@student.edu',
        avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop',
      },
      {
        userId: 'user3',
        name: 'Raj Patel',
        email: 'raj@student.edu',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      },
    ],
    leaderId: 'user1',
    problemId: 'prob1',
    round1Submitted: true,
    round1Score: 85,
    shortlisted: true,
    mentorId: 'mentor1',
    finalSubmitted: false,
    rank: 1,
  },
];

export const mockNotifications: Notification[] = [
  {
    id: 'notif1',
    userId: 'user1',
    message: 'Round 1 results are out! You have been shortlisted.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: 'notif2',
    userId: 'user1',
    message: 'Registration for InnovateTech 2026 confirmed.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
];

// Helper functions
export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem('currentUser');
  return userJson ? JSON.parse(userJson) : null;
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('currentUser');
  }
};

export const getHackathonStatus = (hackathon: Hackathon): 'upcoming' | 'open' | 'ongoing' | 'closed' => {
  const now = new Date();
  const regDeadline = new Date(hackathon.registrationDeadline);
  const startDate = new Date(hackathon.startDate);
  const endDate = new Date(hackathon.endDate);

  if (now < regDeadline) return 'open';
  if (now >= startDate && now <= endDate) return 'ongoing';
  if (now > endDate) return 'closed';
  return 'upcoming';
};

export const getTimeRemaining = (deadline: string) => {
  const now = new Date().getTime();
  const target = new Date(deadline).getTime();
  const diff = target - now;

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    expired: false,
  };
};

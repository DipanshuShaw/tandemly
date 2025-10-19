
import type { User, Match, Message, Skill, TokenTransaction } from './types';

export const mockUsers: User[] = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  avatarUrl: `https://picsum.photos/seed/${i + 1}/200/200`,
  skills: ['React', 'TypeScript', 'Node.js', 'Spanish Fluency', 'Guitar Basics', 'Data Analysis'][i % 6].split(', '),
  bio: `Creative professional with a passion for learning and teaching. Experienced in modern web development and looking to exchange language skills.`,
  isOnline: i % 2 === 0,
  email: `user${i+1}@example.com`,
  phone: `+1 (555) 123-456${i}`,
  languages: ['English', 'Spanish', 'French', 'German', 'Mandarin', 'Japanese'][i % 6].split(', '),
}));

export const mockCurrentUser: User = {
    id: 0,
    name: "Alex Doe",
    avatarUrl: `https://picsum.photos/seed/currentuser/200/200`,
    skills: ["React Expert", "UI/UX Design"],
    bio: "Lead Frontend Engineer with 8 years of experience building scalable and beautiful web applications. Looking to learn Italian.",
    isOnline: true,
    email: 'alex.doe@example.com',
    phone: '+1 (555) 987-6543',
    languages: ['English', 'German'],
};

export const mockMatches: Match[] = [
  { id: 1, user: mockUsers[1], date: '2023-10-26', duration: '45 mins', status: 'completed' },
  { id: 2, user: mockUsers[3], date: '2023-10-24', duration: '1 hour', status: 'completed' },
  { id: 3, user: mockUsers[4], date: '2023-10-22', duration: '30 mins', status: 'completed' },
];

export const mockCurrentMatch: Match = {
    id: 99, user: mockUsers[0], date: '2023-10-27', duration: 'In Progress', status: 'in-progress'
};

export const mockMessages: Message[] = [
  { id: 1, userId: mockUsers[2].id, name: mockUsers[2].name, avatarUrl: mockUsers[2].avatarUrl, text: 'Hey, are you free to chat about React hooks tomorrow?', timestamp: '10:45 AM' },
  { id: 2, userId: mockUsers[5].id, name: mockUsers[5].name, avatarUrl: mockUsers[5].avatarUrl, text: 'Thanks for the session last week! It was super helpful.', timestamp: 'Yesterday' },
];

export const mockSkills: Skill[] = [
    {id: 1, name: "Advanced TypeScript"},
    {id: 2, name: "UI/UX Design Principles"},
    {id: 3, name: "Conversational Italian"},
    {id: 4, name: "Acoustic Guitar"},
];

export const mockTransactions: TokenTransaction[] = [
    {id: 1, type: 'purchase', amount: 50, date: '2023-10-20', description: 'Token Pack (50)'},
    {id: 2, type: 'usage', amount: -5, date: '2023-10-22', description: `Session with ${mockUsers[4].name}`},
    {id: 3, type: 'usage', amount: -10, date: '2023-10-24', description: `Session with ${mockUsers[3].name}`},
    {id: 4, type: 'usage', amount: -5, date: '2023-10-26', description: `Session with ${mockUsers[1].name}`},
];

export const mockReviews = [
    { id: 1, user: mockUsers[1], rating: 5, comment: "Fantastic partner! Very knowledgeable and patient. Highly recommend.", date: "2023-10-26" },
    { id: 2, user: mockUsers[3], rating: 4, comment: "Good session, learned a lot about data analysis. Could have been a bit more structured.", date: "2023-10-24" },
    { id: 3, user: mockUsers[4], rating: 5, comment: "An absolute pleasure to learn from. Very clear explanations.", date: "2023-10-22" },
]

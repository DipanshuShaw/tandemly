
export interface User {
  id: number;
  name: string;
  avatarUrl: string;
  skills: string[];
  bio: string;
  isOnline: boolean;
  email: string;
  phone: string;
  languages: string[];
}

export interface Match {
  id: number;
  user: User;
  date: string;
  duration: string;
  status: 'completed' | 'in-progress' | 'pending';
}

export interface Message {
    id: number;
    userId: number;
    name: string;
    avatarUrl: string;
    text: string;
    timestamp: string;
}

export interface Skill {
  id: number;
  name: string;
}

export interface TokenTransaction {
    id: number;
    type: 'purchase' | 'usage';
    amount: number;
    date: string;
    description: string;
}

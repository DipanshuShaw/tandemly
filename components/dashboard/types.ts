export interface SkillOffered {
  _id?: string;
  skill:
    | string
    | {
        _id: string;
        name: string;
        category: string;
      };

  tokenCost: number;
  proficiency: string;
}

export interface SkillWanted {
  _id?: string;
  skill:
    | string
    | {
        _id: string;
        name: string;
        category: string;
      };

  priority: string;
}

export interface User {
  _id: string;

  name: string;
  email: string;

  number: string;
  bio: string;

  profilePicture: string;
  address: string;

  languages: string[];

  tokens: number;

  rating: number;
  completedSessions: number;
  reliabilityScore: number;

  skillsOffered: SkillOffered[];
  skillsWanted: SkillWanted[];

  activeLearning: string[];
  activeTeaching: string[];

  createdAt?: string;
  updatedAt?: string;
}

export interface MatchRecommendation {
  user: User;

  matchScore: number;

  reasons: string[];
}

export interface Match {
  _id: string;

  learner: string;
  teacher: string;

  learningSkill: string;
  teachingSkill: string;

  status:
    | "pending"
    | "active"
    | "completed"
    | "cancelled";

  chatEnabled: boolean;

  startedAt: string;
  endedAt?: string;
}

export interface MatchRequest {
  _id: string;

  sender: User;
  receiver: User;

  teachSkill: string;
  learnSkill: string;

  status:
    | "pending"
    | "accepted"
    | "rejected";

  createdAt: string;
}

export interface Message {
  _id: string;

  sender: string;
  receiver: string;

  content: string;

  createdAt: string;
}

export interface TokenTransaction {
  _id: string;

  type:
    | "earn"
    | "spend"
    | "purchase";

  amount: number;

  description: string;

  createdAt: string;
}
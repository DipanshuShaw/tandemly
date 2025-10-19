"use client";
import React from 'react';
import { mockMatches } from './data';
import type { Match } from './types';

const MatchHistoryItem: React.FC<{ match: Match }> = ({ match }) => (
    <li className="flex items-center justify-between p-4 bg-surface rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-4">
            <img src={match.user.avatarUrl} alt={match.user.name} className="w-12 h-12 rounded-full object-cover" />
            <div>
                <p className="font-semibold text-text-primary">{match.user.name}</p>
                <p className="text-sm text-text-secondary">{match.date} &middot; {match.duration}</p>
            </div>
        </div>
        <button className="px-4 py-2 text-sm font-medium bg-primary-light text-primary-dark-text rounded-lg hover:opacity-80 transition-opacity">
            View Chat
        </button>
    </li>
);


const MatchHistory: React.FC = () => {
  return (
    <div>
        <h2 className="text-3xl font-bold text-text-primary mb-6">Match History</h2>
        <ul className="space-y-4">
            {mockMatches.map(match => (
                <MatchHistoryItem key={match.id} match={match} />
            ))}
        </ul>
    </div>
  );
};

export default MatchHistory;
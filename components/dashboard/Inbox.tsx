"use client";
import React from 'react';
import { mockMessages } from './data';
import type { Message } from './types';

const ConversationItem: React.FC<{ message: Message }> = ({ message }) => (
    <li className="flex items-center p-4 bg-surface rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 border-transparent hover:border-primary">
        <img src={message.avatarUrl} alt={message.name} className="w-14 h-14 rounded-full object-cover" />
        <div className="flex-1 ml-4">
            <div className="flex justify-between items-baseline">
                <p className="font-semibold text-text-primary">{message.name}</p>
                <p className="text-xs text-text-secondary">{message.timestamp}</p>
            </div>
            <p className="text-sm text-text-secondary truncate">{message.text}</p>
        </div>
    </li>
);

const Inbox: React.FC = () => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-text-primary mb-6">Inbox</h2>
      <ul className="space-y-4">
        {mockMessages.map(message => (
          <ConversationItem key={message.id} message={message} />
        ))}
      </ul>
    </div>
  );
};

export default Inbox;
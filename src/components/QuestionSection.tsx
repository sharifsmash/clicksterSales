import React from 'react';
import mockData from '../mockdata.json'; // Adjust the path as necessary
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface QuestionSectionProps {
  question: string;
}

const QuestionSection: React.FC<QuestionSectionProps> = ({ question }) => {
  // Function to generate a response based on the question
  const generateResponse = () => {
    if (question.toLowerCase().includes('os breakdown')) {
      return (
        <div>
          <h3 className="font-semibold mb-2">OS Breakdown for All Campaigns:</h3>
          <ul className="space-y-1">
            {mockData.campaigns.flatMap(campaign => 
              campaign.by_os.map((item: any) => (
                <li key={`${campaign.id}-${item.name}`} className="text-sm">
                  {campaign.name} - {item.name}: {item.clicks} clicks, {item.cr.toFixed(2)}% CR
                </li>
              ))
            )}
          </ul>
        </div>
      );
    }
    // Add more conditions for different types of questions
    return <p>I'm sorry, I don't have an answer for that question.</p>;
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg mt-4 space-y-4">
      <div className="flex items-start space-x-2">
        <Avatar className="w-8 h-8">
          <AvatarImage src="/assets/user-avatar.png" alt="User" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div className="flex-1 bg-white p-3 rounded-lg shadow">
          <p className="text-sm font-medium">You</p>
          <p className="text-sm">{question}</p>
        </div>
      </div>
      <div className="flex items-start space-x-2">
        <Avatar className="w-8 h-8">
          <AvatarImage src="/assets/ai-avatar.png" alt="AI" />
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
        <div className="flex-1 bg-blue-100 p-3 rounded-lg shadow">
          <p className="text-sm font-medium">AI Assistant</p>
          <div className="text-sm">{generateResponse()}</div>
        </div>
      </div>
    </div>
  );
};

export default QuestionSection;
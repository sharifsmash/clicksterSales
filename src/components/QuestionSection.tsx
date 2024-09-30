import React from 'react';
import mockData from '../mockdata.json'; // Adjust the path as necessary

interface QuestionSectionProps {
  question: string; // New prop to accept the question
}

const QuestionSection: React.FC<QuestionSectionProps> = ({ question }) => {
  // Function to generate a response based on the question
  const generateResponse = () => {
    if (question.toLowerCase().includes('os breakdown')) {
      return (
        <div>
          <h3>OS Breakdown for All Campaigns:</h3>
          <ul>
            {mockData.campaigns.flatMap(campaign => 
              campaign.by_os.map((item: any) => (
                <li key={`${campaign.id}-${item.name}`}>
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
    <div className="bg-gray-100 p-4 rounded-lg mt-4">
      <h2 className="text-xl font-bold mb-2">Question: {question}</h2>
      <div className="mt-2">{generateResponse()}</div>
    </div>
  );
};

export default QuestionSection;
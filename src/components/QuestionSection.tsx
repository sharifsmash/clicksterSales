import React from 'react';
import mockData from '../mockdata.json'; // Adjust the path as necessary

interface Question {
  name: string; // Assuming the structure based on your example
  clicks: number;
  offerClicks: number;
  ctr: number;
  // Add other fields as necessary
}

interface QuestionSectionProps {
  question: string; // New prop to accept the question
}

const QuestionSection: React.FC<QuestionSectionProps> = ({ question }) => {
  const filteredData = mockData.by_os.filter(item => 
    item.name.toLowerCase().includes(question.toLowerCase())
  );

  return (
    <div>
      <h2>Questions</h2>
      {filteredData.length > 0 ? (
        filteredData.map((item: Question, index: number) => (
          <div key={index}>
            <h3>{item.name}</h3>
            <p>Clicks: {item.clicks}</p>
            <p>Offer Clicks: {item.offerClicks}</p>
            <p>CTR: {item.ctr}%</p>
            {/* Add other fields as necessary */}
          </div>
        ))
      ) : (
        <p>No results found for your question.</p>
      )}
    </div>
  );
};

export default QuestionSection;
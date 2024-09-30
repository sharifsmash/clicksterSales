import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { FaPercent, FaMousePointer, FaDollarSign, FaChartLine } from 'react-icons/fa';
import mockData from '../mockdata.json';

// Update the import statement
interface CampaignData {
  id: string;
  name: string;
  owner: string;
  clicks: number;
  offerClicks: number;
  ctr: number;
  cvrs: number;
  cr: number;
  revenue: number;
  spent: number;
  profit: number;
  roi: number;
  epc: number;
  cpc: number;
  ecpa: number;
  avgPayout: number;
  by_os: {
    name: string;
    clicks: number;
    offerClicks: number;
    ctr: number;
    cvrs: number;
    cr: number;
    revenue: number;
    spent: number;
    profit: number;
    roi: number;
    epc: number;
    cpc: number;
    ecpa: number;
    avgPayout: number;
  }[];
  by_region: {
    name: string;
    clicks: number;
    offerClicks: number;
    ctr: number;
    cvrs: number;
    cr: number;
    revenue: number;
    spent: number;
    profit: number;
    roi: number;
    epc: number;
    cpc: number;
    ecpa: number;
    avgPayout: number;
  }[];
}

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

interface DataChatAppProps {
  onSearchComplete: (result: string) => void;
}

const DataChatApp: React.FC<DataChatAppProps> = ({ onSearchComplete }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedHeight, setExpandedHeight] = useState('60px');
  const inputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (input.trim()) {
      setIsLoading(true);
      const newMessage = { text: input, sender: 'user' as const };
      setMessages(prev => [...prev, newMessage]);
      setInput('');
      // Simulated response
      setTimeout(() => {
        const response = generateResponse(input, mockData.campaigns);
        const newBotMessage = { text: response, sender: 'bot' as const };
        setMessages(prev => [...prev, newBotMessage]);
        setIsLoading(false);
        onSearchComplete(response);
        
        // Calculate new height based on content
        const newHeight = Math.min((messages.length + 2) * 60, 700); // 60px per message, max 700px
        setExpandedHeight(`${newHeight}px`);
      }, 1000);
    }
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US');
  };

  const generateResponse = (input: string, campaigns: CampaignData[]): string => {
    const lowercaseInput = input.toLowerCase();
    
    if (lowercaseInput.includes('turn off') && lowercaseInput.includes('losing money') && lowercaseInput.includes('region')) {
      let response = "Here are the regions that are losing money and should be considered for turning off:\n\n";
      let hasLosingRegions = false;

      campaigns.forEach(campaign => {
        const losingRegions = campaign.by_region.filter(region => region.profit < 0);
        if (losingRegions.length > 0) {
          hasLosingRegions = true;
          response += `${campaign.name} campaign:\n`;
          losingRegions.forEach(region => {
            response += `- ${region.name}: Profit: $${formatNumber(region.profit)}, ROI: ${region.roi.toFixed(2)}%\n`;
          });
          response += '\n';
        }
      });

      if (!hasLosingRegions) {
        return "Good news! There are no regions currently losing money across all campaigns.";
      }

      return response.trim();
    }
    
    if (lowercaseInput.includes('regional') || lowercaseInput.includes('region') || lowercaseInput.includes('location')) {
      let response = "Here's the regional information for each campaign:\n\n";
      
      campaigns.forEach(campaign => {
        response += `${campaign.name} campaign:\n`;
        campaign.by_region.forEach(region => {
          response += `- ${region.name}: ${formatNumber(region.clicks)} clicks, ${region.cr.toFixed(2)}% CR, $${formatNumber(region.revenue)} revenue\n`;
        });
        response += '\n';
      });
      
      return response.trim();
    }
    
    if (lowercaseInput.includes('os') || lowercaseInput.includes('operating system')) {
      return `For the ${campaigns[0].name} campaign, here's the OS breakdown:\n\n` +
        campaigns[0].by_os.map(os => 
          `${os.name}: ${formatNumber(os.clicks)} clicks, ${os.cr.toFixed(2)}% CR, $${formatNumber(os.revenue)} revenue`
        ).join('\n');
    }
    
    if (lowercaseInput.includes('performance') || lowercaseInput.includes('overview')) {
      return `Here's an overview of the ${campaigns[0].name} campaign:\n\n` +
        `Clicks: ${formatNumber(campaigns[0].clicks)}\n` +
        `CTR: ${campaigns[0].ctr.toFixed(2)}%\n` +
        `Conversions: ${formatNumber(campaigns[0].cvrs)}\n` +
        `CR: ${campaigns[0].cr.toFixed(2)}%\n` +
        `Revenue: $${formatNumber(campaigns[0].revenue)}\n` +
        `Spent: $${formatNumber(campaigns[0].spent)}\n` +
        `Profit: $${formatNumber(campaigns[0].profit)}\n` +
        `ROI: ${campaigns[0].roi.toFixed(2)}%\n` +
        `EPC: $${campaigns[0].epc.toFixed(2)}\n` +
        `CPC: $${campaigns[0].cpc.toFixed(2)}\n` +
        `eCPA: $${campaigns[0].ecpa.toFixed(2)}\n` +
        `Avg. Payout: $${campaigns[0].avgPayout.toFixed(2)}`;
    }
    
    if (lowercaseInput.includes('best') || lowercaseInput.includes('top')) {
      if (lowercaseInput.includes('os') || lowercaseInput.includes('operating system')) {
        const bestOS = campaigns[0].by_os.reduce((prev, current) => (current.revenue > prev.revenue) ? current : prev);
        return `The best performing OS for the ${campaigns[0].name} campaign is ${bestOS.name}:\n\n` +
               `Clicks: ${formatNumber(bestOS.clicks)}\n` +
               `CR: ${bestOS.cr.toFixed(2)}%\n` +
               `Revenue: $${formatNumber(bestOS.revenue)}`;
      }
      if (lowercaseInput.includes('region') || lowercaseInput.includes('location')) {
        const bestRegion = campaigns[0].by_region.reduce((prev, current) => (current.revenue > prev.revenue) ? current : prev);
        return `The best performing region for the ${campaigns[0].name} campaign is ${bestRegion.name}:\n\n` +
               `Clicks: ${formatNumber(bestRegion.clicks)}\n` +
               `CR: ${bestRegion.cr.toFixed(2)}%\n` +
               `Revenue: $${formatNumber(bestRegion.revenue)}`;
      }
    }
    
    return "I'm sorry, I couldn't understand your query. You can ask about regions losing money, OS breakdown, regional performance, overall campaign performance, or the best performing OS/region.";
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const renderMessage = (message: Message, index: number) => (
    <div key={index} className="flex mb-4">
      <div className={`flex items-start space-x-2 ${message.sender === 'user' ? 'ml-auto' : 'mr-auto'}`} style={{maxWidth: message.sender === 'user' ? '33%' : '66%'}}>
        {message.sender === 'user' && (
          <div className={`p-3 rounded-lg shadow bg-primary text-primary-foreground`}>
            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
          </div>
        )}
        <Avatar className="w-8 h-8">
          <AvatarImage src={message.sender === 'user' ? "/assets/user-avatar.png" : "/assets/ai-avatar.png"} alt={message.sender === 'user' ? "User" : "AI"} />
          <AvatarFallback>{message.sender === 'user' ? "U" : "AI"}</AvatarFallback>
        </Avatar>
        {message.sender === 'bot' && (
          <div className={`p-3 rounded-lg shadow bg-muted`}>
            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl">
      <div ref={chatRef}>
        <Card className={`transition-all duration-300 ease-in-out h-[600px]`}>
          <CardContent className="p-4 h-full flex flex-col">
            <ScrollArea className="flex-grow mb-4">
              {messages.map((message, index) => renderMessage(message, index))}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="flex items-start space-x-2 max-w-[66%]">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/assets/ai-avatar.png" alt="AI" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div className="p-3 rounded-lg shadow bg-muted">
                      <p className="text-sm">Analyzing...</p>
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>
            <div className="flex space-x-2">
              <Input
                ref={inputRef}
                className="flex-grow"
                placeholder="Ask about campaign data or marketing KPIs..."
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
              />
              <Button onClick={handleSend} disabled={isLoading}>Send</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataChatApp;
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
  onSearchComplete: (responseData: ResponseData) => void;
}

// Add these new interfaces
interface AggregatedData {
  clicks: number;
  cvrs: number;
  revenue: number;
  spent: number;
  profit: number;
  conversionRate: number;
  clickThroughRate: number;
  costPerClick: number;
  roas: number;
  avgPayout: number;
}

interface ResponseData {
  response: string;
  aggregatedData: AggregatedData;
  campaignName?: string;
  dataType?: 'all' | 'regional' | 'os';
  chartData?: { name: string; value: number; avgPayout: number }[];
}

const DataChatApp: React.FC<DataChatAppProps> = ({ onSearchComplete }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHeight, setChatHeight] = useState('30px'); // Start with a 30px height
  const inputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const calculateAggregatedData = (campaigns: CampaignData[]) => {
    const aggregatedData = campaigns.reduce((acc, campaign) => {
      acc.clicks += campaign.clicks;
      acc.offerClicks += campaign.offerClicks;
      acc.cvrs += campaign.cvrs;
      acc.revenue += campaign.revenue;
      acc.spent += campaign.spent;
      acc.profit += campaign.profit;
      return acc;
    }, { clicks: 0, offerClicks: 0, cvrs: 0, revenue: 0, spent: 0, profit: 0 });

    const ctr = (aggregatedData.offerClicks / aggregatedData.clicks) * 100;
    const cr = (aggregatedData.cvrs / aggregatedData.clicks) * 100;
    const roi = (aggregatedData.profit / aggregatedData.spent) * 100;
    const cpc = aggregatedData.spent / aggregatedData.clicks;
    const avgPayout = aggregatedData.revenue / aggregatedData.cvrs;

    return {
      clicks: aggregatedData.clicks,
      cvrs: aggregatedData.cvrs,
      revenue: aggregatedData.revenue,
      spent: aggregatedData.spent,
      profit: aggregatedData.profit,
      conversionRate: cr,
      clickThroughRate: ctr,
      costPerClick: cpc,
      roas: roi,
      avgPayout: avgPayout
    };
  };

  const generateResponse = (input: string, campaigns: CampaignData[]): ResponseData => {
    const lowercaseInput = input.toLowerCase();
    let aggregatedData: AggregatedData;
    let response = "";
    let campaignName: string | undefined;
    let dataType: 'all' | 'regional' | 'os' = 'all';
    let chartData: { name: string; value: number; avgPayout: number }[] | undefined;

    if (lowercaseInput.includes('regional') || lowercaseInput.includes('region') || lowercaseInput.includes('location')) {
      campaignName = getCampaignName(lowercaseInput, campaigns);
      const campaign = campaigns.find(c => c.name.toLowerCase() === campaignName?.toLowerCase()) || campaigns[0];
      aggregatedData = calculateAggregatedData([campaign]);
      dataType = 'regional';
      chartData = campaign.by_region.map(region => ({ 
        name: region.name, 
        value: region.revenue,
        avgPayout: region.avgPayout
      }));
      
      response = `Regional data for ${campaignName} campaign:\n\n`;
      campaign.by_region.forEach(region => {
        response += `- ${region.name}: ${formatNumber(region.clicks)} clicks, ${region.cr.toFixed(2)}% CR, $${formatNumber(region.revenue)} revenue, $${formatNumber(region.profit)} profit\n`;
      });
    } else if (lowercaseInput.includes('os') || lowercaseInput.includes('operating system')) {
      campaignName = getCampaignName(lowercaseInput, campaigns);
      const campaign = campaigns.find(c => c.name.toLowerCase() === campaignName?.toLowerCase()) || campaigns[0];
      aggregatedData = calculateAggregatedData([campaign]);
      dataType = 'os';
      chartData = campaign.by_os.map(os => ({ 
        name: os.name, 
        value: os.revenue,
        avgPayout: os.avgPayout
      }));
      
      response = `OS breakdown for ${campaignName} campaign:\n\n`;
      campaign.by_os.forEach(os => {
        response += `${os.name}: ${formatNumber(os.clicks)} clicks, ${os.cr.toFixed(2)}% CR, $${formatNumber(os.revenue)} revenue, $${formatNumber(os.profit)} profit\n`;
      });
    } else {
      aggregatedData = calculateAggregatedData(campaigns);
      chartData = campaigns.map(campaign => ({
        name: campaign.name,
        value: campaign.revenue,
        avgPayout: campaign.avgPayout
      }));
      
      response = `Overview of all campaigns:\n\n` +
        `Clicks: ${formatNumber(aggregatedData.clicks, true)}\n` +
        `CTR: ${formatNumber(aggregatedData.clickThroughRate)}%\n` +
        `Conversions: ${formatNumber(aggregatedData.cvrs, true)}\n` +
        `CR: ${formatNumber(aggregatedData.conversionRate)}%\n` +
        `Revenue: ${formatNumberWithColor(aggregatedData.revenue, '$')}\n` +
        `Spent: ${formatNumberWithColor(-aggregatedData.spent, '$')}\n` +
        `Profit: ${formatNumberWithColor(aggregatedData.profit, '$')}\n` +
        `ROI: ${formatNumberWithColor(aggregatedData.roas)}%\n` +
        `CPC: ${formatNumberWithColor(-aggregatedData.costPerClick, '$')}\n` +
        `Avg. Payout: ${formatNumberWithColor(aggregatedData.avgPayout, '$')}`;
    }

    return { response, aggregatedData, campaignName, dataType, chartData };
  };

  const handleSend = async () => {
    if (input.trim()) {
      setIsLoading(true);
      const newMessage = { text: input, sender: 'user' as const };
      setMessages(prev => [...prev, newMessage]);
      setInput('');
      
      setTimeout(() => {
        const responseData = generateResponse(input, mockData.campaigns);
        const newBotMessage = { text: responseData.response, sender: 'bot' as const };
        setMessages(prev => [...prev, newBotMessage]);
        setIsLoading(false);
        
        onSearchComplete(responseData);

        // Increase the chat height as messages are added
        const newHeight = Math.min((messages.length + 2) * 60, 700);
        setChatHeight(`${newHeight}px`);
      }, 1000);
    }
  };

  const formatNumber = (num: number, isInteger: boolean = false): string => {
    return isInteger
      ? Math.round(num).toLocaleString('en-US')
      : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatNumberWithColor = (num: number, prefix: string = '', isInteger: boolean = false): string => {
    const formattedNum = formatNumber(Math.abs(num), isInteger);
    const color = num >= 0 ? 'green' : 'red';
    return `<span style="color: ${color}">${prefix}${formattedNum}</span>`;
  };

  const getCampaignName = (input: string, campaigns: CampaignData[]): string => {
    const lowercaseInput = input.toLowerCase();
    for (const campaign of campaigns) {
      if (lowercaseInput.includes(campaign.name.toLowerCase())) {
        return campaign.name;
      }
    }
    return campaigns[0].name; // Default to the first campaign if no match is found
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
          <div className={`p-3 rounded-lg shadow bg-gradient-to-r from-purple-400 to-blue-500 text-white`}>
            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
          </div>
        )}
        <Avatar className="w-8 h-8">
          <AvatarImage src={message.sender === 'user' ? "/assets/user-avatar.png" : "/assets/ai-avatar.png"} alt={message.sender === 'user' ? "User" : "AI"} />
          <AvatarFallback>{message.sender === 'user' ? "U" : "AI"}</AvatarFallback>
        </Avatar>
        {message.sender === 'bot' && (
          <div className={`p-3 rounded-lg shadow bg-gray-100`}> {/* Changed from bg-white to bg-gray-100 */}
            <p className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: message.text }}></p>
          </div>
        )}
      </div>
    </div>
  );

  const handleConversationStarter = (starter: string) => {
    setInput(starter);
    handleSend();
  };

  return (
    <div className="w-full max-w-4xl">
      <div ref={chatRef}>
        <Card className={`transition-all duration-300 ease-in-out h-[${chatHeight}] overflow-hidden bg-white`}>
          <CardContent className="p-4 h-full flex flex-col">
            <ScrollArea className="flex-grow mb-4 pr-4">
              <div className="space-y-4">
                {messages.map((message, index) => renderMessage(message, index))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2 max-w-[66%]">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="/assets/ai-avatar.png" alt="AI" />
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                      <div className="p-3 rounded-lg shadow bg-gray-200"> {/* Changed from bg-gray-100 to bg-gray-200 */}
                        <p className="text-sm">Analyzing...</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
      <div className="mt-4 flex space-x-4 justify-center">
        <button
          onClick={() => handleConversationStarter("Regional data per campaign")}
          className="px-4 py-2 border border-purple-500 text-purple-500 rounded-md hover:bg-purple-50 transition-colors duration-300"
        >
          Regional data per campaign
        </button>
        <button
          onClick={() => handleConversationStarter("OS by campaign")}
          className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 transition-colors duration-300"
        >
          OS by campaign
        </button>
      </div>
    </div>
  );
};

export default DataChatApp;
import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { FaPercent, FaMousePointer, FaDollarSign, FaChartLine } from 'react-icons/fa';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat';
import { db, auth } from '../firebase';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

// Update the import statement
interface OSData {
  os: string;
  metrics: MetricsData;
}

interface RegionData {
  region: string;
  metrics: MetricsData;
}

interface MetricsData {
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
}

interface CampaignData {
  id: string;
  name: string;
  owner: string;
  metrics: MetricsData;
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
  const [chatHeight, setChatHeight] = useState('30px');
  const inputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true // Add this if you're calling the API from the browser
  });

  const calculateAggregatedData = (data: any): AggregatedData => {
    if (!data || !data.metrics) {
      console.error("Invalid data structure for aggregatedData calculation:", data);
      return {
        clicks: 0,
        cvrs: 0,
        revenue: 0,
        spent: 0,
        profit: 0,
        conversionRate: 0,
        clickThroughRate: 0,
        costPerClick: 0,
        roas: 0,
        avgPayout: 0
      };
    }

    const metrics = data.metrics;
    const revenue = metrics.revenue || 0;
    const spent = metrics.spent || 0;
    
    return {
      clicks: metrics.clicks || 0,
      cvrs: metrics.cvrs || 0,
      revenue: revenue,
      spent: spent,
      profit: metrics.profit || 0,
      conversionRate: metrics.cr || 0,
      clickThroughRate: metrics.ctr || 0,
      costPerClick: metrics.cpc || 0,
      roas: spent > 0 ? (revenue / spent) * 100 : 0, // Calculate ROAS as a percentage
      avgPayout: metrics.avgPayout || 0
    };
  };

  const fetchOverallStats = async () => {
    try {
      console.log("Fetching overall stats...");
      const q = query(collection(db, 'overall_stats'), orderBy('dateRange', 'desc'), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        console.log("Fetched overall stats:", data);
        return data;
      }
      console.log("No overall stats found");
      return null;
    } catch (error) {
      console.error("Error fetching overall stats:", error);
      throw error;
    }
  };

  const fetchCampaigns = async (): Promise<CampaignData[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, 'campaigns'));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CampaignData));
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      throw error;
    }
  };

  const fetchCampaignOSData = async (campaignId: string): Promise<OSData[]> => {
    const q = query(collection(db, 'campaign_os_data'), where('campaignId', '==', campaignId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as OSData);
  };

  const fetchCampaignRegionData = async (campaignId: string): Promise<RegionData[]> => {
    const q = query(collection(db, 'campaign_region_data'), where('campaignId', '==', campaignId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as RegionData);
  };

  const validateData = (data: AggregatedData): AggregatedData => {
    return {
      ...data,
      clickThroughRate: Math.min(data.clickThroughRate, 100), // Cap CTR at 100%
      conversionRate: Math.min(data.conversionRate, 100), // Cap conversion rate at 100%
      roas: data.roas >= 0 ? data.roas : 0, // Ensure ROAS is non-negative
    };
  };

  const getChatGPTResponse = async (input: string): Promise<ResponseData> => {
    try {
      const overallStats = await fetchOverallStats();
      const campaigns = await fetchCampaigns();
      
      let campaignName: string | undefined;
      let dataType: 'all' | 'regional' | 'os' = 'all';
      let specificData: OSData[] | RegionData[] | null = null;

      if (input.toLowerCase().includes('os') || input.toLowerCase().includes('operating system')) {
        dataType = 'os';
        campaignName = getCampaignName(input, campaigns);
        specificData = await fetchCampaignOSData(campaignName);
      } else if (input.toLowerCase().includes('region') || input.toLowerCase().includes('location')) {
        dataType = 'regional';
        campaignName = getCampaignName(input, campaigns);
        specificData = await fetchCampaignRegionData(campaignName);
      }

      const aggregatedData = calculateAggregatedData(overallStats);
      const validatedData = validateData(aggregatedData);

      const messages: ChatCompletionMessageParam[] = [
        { role: "system", content: "You are a helpful assistant that analyzes marketing campaign data. Please provide insights based on the data provided, and be cautious of potential data inconsistencies." },
        { role: "user", content: `
          Overall campaign data: ${JSON.stringify(validatedData)}
          ${campaignName ? `Specific campaign: ${campaignName}` : ''}
          ${dataType !== 'all' ? `Data type: ${dataType}` : ''}
          ${specificData ? `Specific data: ${JSON.stringify(specificData)}` : ''}
          
          User query: "${input}"
          
          Provide a detailed analysis of the data, addressing the user's query. Include relevant metrics, insights, and recommendations based on the data provided. If you notice any unusual values, please highlight these and suggest possible explanations.
        `}
      ];

      console.log("Sending request to OpenAI API...");
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: messages,
        max_tokens: 500,
      });
      console.log("Received response from OpenAI API:", response);

      const gptResponse = response.choices[0].message.content?.trim() || "I'm sorry, I couldn't generate a response.";

      return {
        response: gptResponse,
        aggregatedData: aggregatedData,
        campaignName: campaignName,
        dataType: dataType,
        chartData: specificData ? specificData.map(item => ({
          name: 'os' in item ? item.os : item.region,
          value: item.metrics.revenue,
          avgPayout: item.metrics.avgPayout
        })) : campaigns.map(campaign => ({
          name: campaign.name,
          value: campaign.metrics.revenue,
          avgPayout: campaign.metrics.avgPayout
        }))
      };
    } catch (error) {
      console.error("Error in getChatGPTResponse:", error);
      throw error;
    }
  };

  const handleSend = async () => {
    if (input.trim()) {
      setIsLoading(true);
      const newMessage = { text: input, sender: 'user' as const };
      setMessages(prev => [...prev, newMessage]);
      setInput('');
      
      try {
        const responseData = await getChatGPTResponse(input);
        const newBotMessage = { text: responseData.response, sender: 'bot' as const };
        setMessages(prev => [...prev, newBotMessage]);
        onSearchComplete(responseData);

        const newHeight = Math.min((messages.length + 2) * 60, 700);
        setChatHeight(`${newHeight}px`);
      } catch (error) {
        console.error("Error getting ChatGPT response:", error);
        let errorMessage = "I'm sorry, there was an error processing your request.";
        if (error instanceof Error) {
          errorMessage += ` Error details: ${error.message}`;
        }
        const errorBotMessage = { text: errorMessage, sender: 'bot' as const };
        setMessages(prev => [...prev, errorBotMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatNumber = (num: number, isInteger: boolean = false): string => {
    return isInteger
      ? Math.round(num).toLocaleString('en-US')
      : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatNumberWithColor = (num: number, prefix: string = ''): string => {
    const formattedNum = formatNumber(Math.abs(num));
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
    <div key={index} className={`flex mb-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start space-x-2 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`} style={{maxWidth: '66%'}}>
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={message.sender === 'user' ? "/assets/user-avatar.png" : "/assets/ai-avatar.png"} alt={message.sender === 'user' ? "User" : "AI"} />
          <AvatarFallback>{message.sender === 'user' ? "U" : "AI"}</AvatarFallback>
        </Avatar>
        <div className={`p-3 rounded-lg shadow ${message.sender === 'user' ? 'bg-gradient-to-r from-purple-400 to-blue-500 text-white' : 'bg-gray-100'}`}>
          <p className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: message.text }}></p>
        </div>
      </div>
    </div>
  );

  const handleConversationStarter = (starter: string) => {
    setInput(starter);
    handleSend();
  };

  useEffect(() => {
    const signInAnon = async () => {
      try {
        const userCredential = await signInAnonymously(auth);
        console.log("Signed in anonymously", userCredential.user);
      } catch (error) {
        console.error("Error signing in anonymously:", error);
        if (error instanceof Error) {
          console.error("Error name:", error.name);
          console.error("Error message:", error.message);
          console.error("Error stack:", error.stack);
        }
      }
    };
    signInAnon();
  }, []);

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
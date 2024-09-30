import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectItem } from "./ui/select";
import { Switch } from "./ui/switch";
// Update the import statement
import { FaSun, FaMoon, FaPercent, FaMousePointer, FaDollarSign, FaChartLine, FaUsers } from 'react-icons/fa';
import mockData from '../mockdata.json';

// Update the CampaignData interface
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

const mockApiService = {
  getCampaignData: (): Promise<CampaignData[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockData.campaigns);
      }, 500);
    });
  }
};

const DataChatApp: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const campaignData = await mockApiService.getCampaignData();
        setCampaigns(campaignData);
        setSelectedCampaign(campaignData[0]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();

    const handleScroll = () => {
      if (chatRef.current) {
        const chatTop = chatRef.current.getBoundingClientRect().top;
        setIsSticky(chatTop <= 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const handleSend = async () => {
    if (input.trim()) {
      setIsLoading(true);
      setMessages(prev => [...prev, { text: input, sender: 'user' }]);
      setInput('');
      // Simulated response
      setTimeout(() => {
        const response = generateResponse(input, selectedCampaign);
        setMessages(prev => [...prev, { text: response, sender: 'bot' }]);
        setIsLoading(false);
      }, 1000);
    }
  };

  // Add this function to generate responses based on user input and selected campaign
  const generateResponse = (input: string, campaign: CampaignData | null): string => {
    if (!campaign) return "Please select a campaign first.";

    const lowercaseInput = input.toLowerCase();
    
    if (lowercaseInput.includes('os') || lowercaseInput.includes('operating system')) {
      return `For the ${campaign.name} campaign, here's the OS breakdown:\n\n` +
        campaign.by_os.map(os => `${os.name}: ${os.clicks} clicks, ${os.cr.toFixed(2)}% CR, $${os.revenue.toFixed(2)} revenue`).join('\n');
    }
    
    if (lowercaseInput.includes('region') || lowercaseInput.includes('location')) {
      return `For the ${campaign.name} campaign, here's the regional breakdown:\n\n` +
        campaign.by_region.map(region => `${region.name}: ${region.clicks} clicks, ${region.cr.toFixed(2)}% CR, $${region.revenue.toFixed(2)} revenue`).join('\n');
    }
    
    if (lowercaseInput.includes('performance') || lowercaseInput.includes('overview')) {
      return `Here's an overview of the ${campaign.name} campaign:\n\n` +
        `Clicks: ${campaign.clicks}\n` +
        `CTR: ${campaign.ctr.toFixed(2)}%\n` +
        `Conversions: ${campaign.cvrs}\n` +
        `CR: ${campaign.cr.toFixed(2)}%\n` +
        `Revenue: $${campaign.revenue.toFixed(2)}\n` +
        `Profit: $${campaign.profit.toFixed(2)}\n` +
        `ROI: ${campaign.roi.toFixed(2)}%`;
    }
    
    return "I'm sorry, I couldn't understand your query. You can ask about OS breakdown, regional performance, or overall campaign performance.";
  };

  const handleInputFocus = () => {
    setIsExpanded(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCampaignChange = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (campaign) {
      setSelectedCampaign(campaign);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className={`container mx-auto p-4 min-h-screen flex flex-col items-center justify-start pt-10 ${isDarkMode ? 'dark' : ''}`}>
      <div className="w-full max-w-2xl flex justify-end mb-4">
        <div className="flex items-center space-x-2">
          <FaSun className="h-4 w-4" />
          <Switch checked={isDarkMode} onChange={toggleDarkMode} />
          <FaMoon className="h-4 w-4" />
        </div>
      </div>
      <div ref={chatRef} className={`w-full max-w-2xl ${isSticky ? 'sticky top-0 z-10 bg-background pt-4' : ''}`}>
        <Card className={`transition-all duration-300 ease-in-out ${isExpanded ? 'h-[60vh]' : 'h-16'}`}>
          <CardContent className="p-0 h-full flex flex-col">
            {isExpanded && (
              <ScrollArea className="flex-grow p-4">
                {messages.map((message, index) => (
                  <div key={index} className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    <span className={`inline-block p-2 rounded-lg ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      {message.text}
                    </span>
                  </div>
                ))}
                {isLoading && (
                  <div className="text-left">
                    <span className="inline-block p-2 rounded-lg bg-muted">Analyzing...</span>
                  </div>
                )}
              </ScrollArea>
            )}
            <div className="p-4 flex space-x-2">
              <Input
                ref={inputRef}
                className={`flex-grow transition-all duration-300 ease-in-out ${!isExpanded && !isSticky ? 'shadow-[0_0_15px_rgba(59,130,246,0.5)]' : ''}`}
                placeholder="Ask about campaign data or marketing KPIs..."
                value={input}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onKeyPress={handleKeyPress}
              />
              <Button onClick={handleSend} disabled={isLoading}>Send</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="w-full max-w-2xl mt-8">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Campaign Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={handleCampaignChange} value={selectedCampaign?.id}>
              {campaigns.map(campaign => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.name} ({campaign.owner})
                </SelectItem>
              ))}
            </Select>
          </CardContent>
        </Card>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <FaPercent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedCampaign?.cr.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground">of total clicks</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Click-Through Rate</CardTitle>
              <FaMousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedCampaign?.ctr.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground">of total impressions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cost Per Click</CardTitle>
              <FaDollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${selectedCampaign?.cpc.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">average cost</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ROI</CardTitle>
              <FaChartLine className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedCampaign?.roi.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground">return on investment</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Payout</CardTitle>
              <FaDollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${selectedCampaign?.avgPayout.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">per conversion</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">EPC</CardTitle>
              <FaUsers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${selectedCampaign?.epc.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">earnings per click</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[200px] bg-gray-200 flex items-center justify-center">
                Chart Placeholder
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Cost vs. Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[200px] bg-gray-200 flex items-center justify-center">
                Chart Placeholder
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DataChatApp;
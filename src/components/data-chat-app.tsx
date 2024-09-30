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

// Define types for the campaign data
interface CampaignData {
  id: string;
  name: string;
  owner: string;
  data: {
    conversionRate: number;
    ctr: number;
    cpc: number;
    roas: number;
    aov: number;
    clv: number;
    cpa: number;
    impressions: number;
    clicks: number;
    conversions: number;
  };
}

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

const mockApiService = {
  getCampaignData: (): Promise<CampaignData[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { 
            id: 'campaign1', 
            name: 'Summer Fitness Challenge', 
            owner: 'You',
            data: { 
              conversionRate: 4.2, 
              ctr: 3.1, 
              cpc: 0.85, 
              roas: 5.2, 
              aov: 95, 
              clv: 280, 
              cpa: 22,
              impressions: 150000,
              clicks: 4650,
              conversions: 195
            } 
          },
          { 
            id: 'campaign2', 
            name: 'Wellness Webinar Series', 
            owner: 'Marc',
            data: { 
              conversionRate: 5.5, 
              ctr: 3.8, 
              cpc: 0.72, 
              roas: 6.1, 
              aov: 110, 
              clv: 320, 
              cpa: 20,
              impressions: 200000,
              clicks: 7600,
              conversions: 418
            } 
          },
          { 
            id: 'campaign3', 
            name: 'New Year New You', 
            owner: 'You',
            data: { 
              conversionRate: 6.1, 
              ctr: 4.2, 
              cpc: 0.90, 
              roas: 5.8, 
              aov: 125, 
              clv: 350, 
              cpa: 24,
              impressions: 250000,
              clicks: 10500,
              conversions: 640
            } 
          },
        ]);
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
        setMessages(prev => [...prev, { text: "I'm analyzing your query. Here's what I found in the selected campaign data...", sender: 'bot' }]);
        setIsLoading(false);
      }, 1000);
    }
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
              <div className="text-2xl font-bold">{selectedCampaign?.data.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">of total clicks</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Click-Through Rate</CardTitle>
              <FaMousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedCampaign?.data.ctr}%</div>
              <p className="text-xs text-muted-foreground">of total impressions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cost Per Click</CardTitle>
              <FaDollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${selectedCampaign?.data.cpc}</div>
              <p className="text-xs text-muted-foreground">average cost</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ROAS</CardTitle>
              <FaChartLine className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedCampaign?.data.roas}x</div>
              <p className="text-xs text-muted-foreground">return on ad spend</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
              <FaDollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${selectedCampaign?.data.aov}</div>
              <p className="text-xs text-muted-foreground">per conversion</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customer LTV</CardTitle>
              <FaUsers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${selectedCampaign?.data.clv}</div>
              <p className="text-xs text-muted-foreground">lifetime value</p>
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
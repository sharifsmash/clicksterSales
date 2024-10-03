import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { FaPercent, FaMousePointer, FaDollarSign, FaChartLine, FaTrophy } from 'react-icons/fa';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat';
import { db, auth } from '../firebase';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import mockData from '../mockdata.json';
import { Trash2, Maximize2, BarChart2 } from 'lucide-react';
import { RiRobot2Line } from "react-icons/ri";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import offerRegionData from '../offerRegion.json';

// Update the import statement
interface OSData {
  os: string;
  campaignId: string;
  metrics: MetricsData;
}

interface RegionData {
  region: string;
  campaignId: string;
  offerId: string;
  metrics: MetricsData;
}

interface MetricsData {
  clicks: number;
  offerClicks: number;
  ctr: number;
  cr: number;
  revenue: number;
  spent: number;
  profit: number;
  roi: number;
  epc: number;
  cpc: number;
  ecpa: number;
  avgPayout: number;
  cvrs: number;
  name: string;
}

// Update the CampaignData interface to include by_offer
interface CampaignData {
  id: string;
  name: string;
  owner: string;
  metrics: MetricsData;
  by_offer?: {
    [offerId: string]: MetricsData[];
  };
}

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

interface DataChatAppProps {
  onSearchComplete: (responseData: ResponseData, formatNumber: (num: number, isInteger?: boolean) => string) => void;
  showResults: boolean;
  setShowChartModal: React.Dispatch<React.SetStateAction<boolean>>;
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
  // Add the new properties
  avgConversionRate?: number;
  avgClickThroughRate?: number;
  avgCostPerClick?: number;
  avgROAS?: number;
  totalProfit?: number;
  totalRevenue?: number;  // Add this line
  totalCost?: number;     // Add this line
  avgCPA?: number;
  roi?: number;
}

interface ResponseData {
  response: string;
  aggregatedData: AggregatedData;
  campaignName?: string;
  dataType?: 'all' | 'regional' | 'os';
  chartData?: { name: string; value: number; avgPayout: number }[];
  cardData?: {
    title: string;
    metrics: {
      label: string;
      value: string | number;
    }[];
  }[];
}

// Add this interface at the top of the file
interface Region {
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
}

// Update the return type of getBestOfferPerRegionByEPC
const getBestOfferPerRegionByEPC = (data: any): { [key: string]: { offer: string; epc: number; metrics: MetricsData }[] } => {
  const regionOffers: { [key: string]: { offer: string; epc: number; metrics: MetricsData }[] } = {};

  data.campaigns
    .filter((campaign: any) => campaign.name === 'Auto Insurance')
    .forEach((campaign: any) => 
      Object.entries(campaign.by_offer || {}).forEach(([offerId, regions]) =>
        (regions as MetricsData[]).forEach((region: MetricsData) => {
          if (!regionOffers[region.name]) {
            regionOffers[region.name] = [];
          }
          regionOffers[region.name].push({ offer: offerId, epc: region.epc, metrics: region });
        })
      )
    );

  // Sort offers for each region by EPC in descending order
  Object.keys(regionOffers).forEach(region => {
    regionOffers[region].sort((a, b) => b.epc - a.epc);
  });

  return regionOffers;
};

const DataChatApp: React.FC<DataChatAppProps> = ({ onSearchComplete, showResults, setShowChartModal }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHeight, setChatHeight] = useState('auto');
  const inputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const [firestoreData, setFirestoreData] = useState<any>(null);
  const [isDataCollapsibleOpen, setIsDataCollapsibleOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [loadingDots, setLoadingDots] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

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
        avgPayout: 0,
        avgCPA: 0,
        roi: 0
      };
    }

    const metrics = data.metrics;
    const revenue = metrics.revenue || 0;
    const spent = metrics.spent || 0;
    const conversions = metrics.cvrs || 0;
    
    return {
      clicks: metrics.clicks || 0,
      cvrs: metrics.cvrs || 0,
      revenue: revenue,
      spent: spent,
      profit: metrics.profit || 0,
      conversionRate: metrics.cr || 0,
      clickThroughRate: metrics.ctr || 0,
      costPerClick: metrics.cpc || 0,
      roas: spent > 0 ? (revenue / spent) * 100 : 0,
      avgPayout: metrics.avgPayout || 0,
      avgCPA: conversions > 0 ? spent / conversions : 0,
      roi: spent > 0 ? ((revenue - spent) / spent) * 100 : 0
    };
  };

  const getOverallStats = () => {
    return {
      metrics: mockData.total
    };
  };

  const getCampaigns = (): CampaignData[] => {
    return mockData.campaigns.map(campaign => ({
      id: campaign.id,
      name: campaign.name,
      owner: campaign.owner,
      metrics: campaign
    }));
  };

  const getCampaignRegionData = (campaignId: string): RegionData[] => {
    const campaign = mockData.campaigns.find(c => c.id === campaignId);
    if (!campaign || !campaign.by_offer) return [];

    return Object.entries(campaign.by_offer).flatMap(([offerId, regions]) =>
      (regions as MetricsData[]).map(region => ({
        region: region.name,
        campaignId: campaignId,
        offerId: offerId,
        metrics: region
      }))
    );
  };

  const validateData = (data: AggregatedData): AggregatedData => {
    return {
      ...data,
      clickThroughRate: Math.min(data.clickThroughRate, 100), // Cap CTR at 100%
      conversionRate: Math.min(data.conversionRate, 100), // Cap conversion rate at 100%
      roas: data.roas >= 0 ? data.roas : 0, // Ensure ROAS is non-negative
    };
  };

  const processUserInput = (input: string): ResponseData => {
    const campaigns = getCampaigns();
    const overallStats = getOverallStats();
    let campaignName: string | undefined;
    let dataType: 'all' | 'regional' | 'os' = 'all';
    let specificData: (OSData | RegionData)[] | null = null;

    // Remove or comment out this entire block
    // if (input.toLowerCase().includes('os') || input.toLowerCase().includes('operating system')) {
    //   dataType = 'os';
    //   campaignName = getCampaignName(input, campaigns);
    //   if (campaignName) {
    //     const campaign = campaigns.find(c => c.name.toLowerCase() === campaignName?.toLowerCase());
    //     if (campaign) {
    //       specificData = getCampaignOSData(campaign.id);
    //     }
    //   }
    // } else 
    if (input.toLowerCase().includes('region') || input.toLowerCase().includes('location')) {
      dataType = 'regional';
      campaignName = getCampaignName(input, campaigns);
      if (campaignName) {
        const campaign = campaigns.find(c => c.name.toLowerCase() === campaignName?.toLowerCase());
        if (campaign) {
          specificData = getCampaignRegionData(campaign.id);
        }
      }
    }

    const aggregatedData = calculateAggregatedData(overallStats);
    const validatedData = validateData(aggregatedData);

    let response = `Here's a summary of the ${campaignName ? `${campaignName} campaign` : 'overall'} data:\n\n`;
    response += `Clicks: ${formatNumber(validatedData.clicks, true)}\n`;
    response += `Conversions: ${formatNumber(validatedData.cvrs, true)}\n`;
    response += `Revenue: $${formatNumber(validatedData.revenue)}\n`;
    response += `Spent: $${formatNumber(validatedData.spent)}\n`;
    response += `Profit: $${formatNumber(validatedData.profit)}\n`;
    response += `Conversion Rate: ${formatNumber(validatedData.conversionRate)}%\n`;
    response += `Click-Through Rate: ${formatNumber(validatedData.clickThroughRate)}%\n`;
    response += `Cost Per Click: $${formatNumber(validatedData.costPerClick)}\n`;
    response += `ROAS: ${formatNumber(validatedData.roas)}%\n`;
    response += `Average Payout: $${formatNumber(validatedData.avgPayout)}\n`;

    if (specificData) {
      response += `\nRegional breakdown:\n`;
      specificData.forEach(item => {
        response += `\n${(item as RegionData).region} (Offer: ${(item as RegionData).offerId}):\n`;
        response += `  Clicks: ${formatNumber(item.metrics.clicks, true)}\n`;
        response += `  Revenue: $${formatNumber(item.metrics.revenue)}\n`;
        response += `  Profit: $${formatNumber(item.metrics.profit)}\n`;
      });
    }

    console.log("Processed input:", {
      response,
      aggregatedData: validatedData,
      campaignName,
      dataType,
      chartData: specificData ? specificData.map(item => ({
        name: `${(item as RegionData).region} (${(item as RegionData).offerId})`,
        value: item.metrics.revenue || 0,
        avgPayout: item.metrics.avgPayout || 0
      })) : campaigns.map(campaign => ({
        name: campaign.name,
        value: campaign.metrics.revenue || 0,
        avgPayout: campaign.metrics.avgPayout || 0
      }))
    });

    return {
      response,
      aggregatedData: validatedData,
      campaignName,
      dataType,
      chartData: specificData ? specificData.map(item => ({
        name: `${(item as RegionData).region} (${(item as RegionData).offerId})`,
        value: item.metrics.revenue || 0,
        avgPayout: item.metrics.avgPayout || 0
      })) : campaigns.map(campaign => ({
        name: campaign.name,
        value: campaign.metrics.revenue || 0,
        avgPayout: campaign.metrics.avgPayout || 0
      }))
    };
  };

  const handleSend = async () => {
    if (input.trim()) {
      setIsLoading(true);
      const newMessage = { text: input, sender: 'user' as const };
      setMessages(prev => [...prev, newMessage]);
      setInput('');
      
      try {
        console.log("Processing user input:", input);
        const responseData = processUserInput(input);
        console.log("Response data:", responseData);
        const newBotMessage = { text: responseData.response, sender: 'bot' as const };
        setMessages(prev => [...prev, newBotMessage]);
        onSearchComplete(responseData, formatNumber);

        updateChatHeight();
      } catch (error) {
        console.error("Error processing user input:", error);
        const errorMessage = "I'm sorry, there was an error processing your request.";
        const errorBotMessage = { text: errorMessage, sender: 'bot' as const };
        setMessages(prev => [...prev, errorBotMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const updateChatHeight = () => {
    if (scrollAreaRef.current && messages.length > 0) {
      const scrollHeight = scrollAreaRef.current.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight + 60, 60), 700); // Minimum 60px (input height + padding), maximum 700px
      setChatHeight(`${newHeight}px`);
      
      // Scroll to bottom
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    } else {
      setChatHeight('auto');
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

  const getCampaignName = (input: string, campaigns: CampaignData[]): string | undefined => {
    const lowercaseInput = input.toLowerCase();
    for (const campaign of campaigns) {
      if (lowercaseInput.includes(campaign.name.toLowerCase())) {
        return campaign.name;
      }
    }
    return undefined; // Return undefined if no match is found
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

  const handleConversationStarter = (starter: string) => {
    if (starter === "What Regions for Auto Insurance have earned 25% ROI or better in the last 30 days?") {
      setIsLoading(true);
      setMessages(prev => [...prev, { text: starter, sender: 'user' as const }]);

      setTimeout(() => {
        const highROIRegions = getRegionsWithHighROI(mockData);
        let response = highROIRegions.length > 0
          ? `The regions for <u><i>Auto Insurance</i></u> that have earned <u><i>25% ROI</i></u> or better in the last <u><i>30 days</i></u> are:\n${highROIRegions.map((region: Region) => `• <b>${region.name}</b> - ROI: ${formatNumber(region.roi)}%, Profit: $${formatNumber(region.profit)}`).join('\n')}\n\n`
          : "No regions for <u><i>Auto Insurance</i></u> have earned <u><i>25% ROI</i></u> or better in the last <u><i>30 days</i></u>.";

        if (highROIRegions.length > 0) {
          const totalProfit = highROIRegions.reduce((sum, region) => sum + region.profit, 0);
          const avgConversionRate = highROIRegions.reduce((sum, region) => sum + region.cr, 0) / highROIRegions.length;
          const avgCostPerClick = highROIRegions.reduce((sum, region) => sum + region.cpc, 0) / highROIRegions.length;
          const avgROAS = highROIRegions.reduce((sum, region) => sum + (region.revenue / region.spent * 100), 0) / highROIRegions.length;
          const avgPayout = highROIRegions.reduce((sum, region) => sum + region.avgPayout, 0) / highROIRegions.length;
          const avgClickThroughRate = highROIRegions.reduce((sum, region) => sum + region.ctr, 0) / highROIRegions.length;
          const totalRevenue = highROIRegions.reduce((sum, region) => sum + region.revenue, 0);
          const totalCost = highROIRegions.reduce((sum, region) => sum + region.spent, 0);
          const totalConversions = highROIRegions.reduce((sum, region) => sum + region.cvrs, 0);
          const avgCPA = totalCost / totalConversions;
          const roi = ((totalRevenue - totalCost) / totalCost) * 100;

          response += `Total Profit for these regions: $${formatNumber(totalProfit)}\n\n`;
          response += `Averages for these regions:\n`;
          response += `• Avg. Conversion Rate: ${formatNumber(avgConversionRate)}%\n`;
          response += `• Avg. Cost Per Click: $${formatNumber(avgCostPerClick)}\n`;
          response += `• Avg. ROAS: ${formatNumber(avgROAS)}%\n`;
          response += `• Avg. Payout: $${formatNumber(avgPayout)}\n`;
          response += `• Avg. Click-Through Rate: ${formatNumber(avgClickThroughRate)}%\n`;
          response += `• Avg. CPA: $${formatNumber(avgCPA)}\n`;
          response += `• ROI: ${formatNumber(roi)}%`;

          setMessages(prev => [...prev, { text: response, sender: 'bot' as const }]);
          
          const chartData = highROIRegions.map((region: Region) => ({
            name: region.name,
            value: region.roi,
            avgPayout: region.avgPayout
          }));

          onSearchComplete({
            response,
            aggregatedData: {
              conversionRate: avgConversionRate,
              clickThroughRate: avgClickThroughRate,
              costPerClick: avgCostPerClick,
              roas: avgROAS,
              avgPayout: avgPayout,
              profit: totalProfit,
              clicks: highROIRegions.reduce((sum, region) => sum + region.clicks, 0),
              cvrs: totalConversions,
              revenue: totalRevenue,
              spent: totalCost,
              avgCPA: avgCPA,
              roi: roi,
              avgConversionRate: avgConversionRate,
              avgClickThroughRate: avgClickThroughRate,
              avgCostPerClick: avgCostPerClick,
              avgROAS: avgROAS,
              totalProfit: totalProfit,
            },
            campaignName: 'Auto Insurance',
            dataType: 'regional',
            chartData
          }, formatNumber);
        }

        setIsLoading(false);
      }, 2000);
    } else if (starter === "What Regions for Auto Insurance have lost $100 or more and have a negative ROI?") {
      setIsLoading(true);
      setMessages(prev => [...prev, { text: starter, sender: 'user' as const }]);

      setTimeout(() => {
        const negativeROIRegions = getRegionsWithNegativeROI(mockData);
        let response = negativeROIRegions.length > 0
          ? `The regions for <u><i>Auto Insurance</i></u> that have lost <u><i>$100 or more</i></u> and have a <u><i>negative ROI</i></u> are:\n${negativeROIRegions.map((region: Region) => `• <b>${region.name}</b> - ROI: ${formatNumber(region.roi)}%, Profit: $${formatNumber(region.profit)}`).join('\n')}\n\n`
          : "No regions for <u><i>Auto Insurance</i></u> have lost <u><i>$100 or more</i></u> and have a <u><i>negative ROI</i></u>.";

        if (negativeROIRegions.length > 0) {
          const totalProfit = negativeROIRegions.reduce((sum, region) => sum + region.profit, 0);
          const avgConversionRate = negativeROIRegions.reduce((sum, region) => sum + region.cr, 0) / negativeROIRegions.length;
          const avgCostPerClick = negativeROIRegions.reduce((sum, region) => sum + region.cpc, 0) / negativeROIRegions.length;
          const avgROAS = negativeROIRegions.reduce((sum, region) => sum + (region.revenue / region.spent * 100), 0) / negativeROIRegions.length;
          const avgPayout = negativeROIRegions.reduce((sum, region) => sum + region.avgPayout, 0) / negativeROIRegions.length;
          const avgClickThroughRate = negativeROIRegions.reduce((sum, region) => sum + region.ctr, 0) / negativeROIRegions.length;
          const totalRevenue = negativeROIRegions.reduce((sum, region) => sum + region.revenue, 0);
          const totalCost = negativeROIRegions.reduce((sum, region) => sum + region.spent, 0);
          const totalConversions = negativeROIRegions.reduce((sum, region) => sum + region.cvrs, 0);
          const avgCPA = totalCost / totalConversions;
          const roi = ((totalRevenue - totalCost) / totalCost) * 100;

          response += `Total Profit for these regions: $${formatNumber(totalProfit)}\n\n`;
          response += `Averages for these regions:\n`;
          response += `• Avg. Conversion Rate: ${formatNumber(avgConversionRate)}%\n`;
          response += `• Avg. Cost Per Click: $${formatNumber(avgCostPerClick)}\n`;
          response += `• Avg. ROAS: ${formatNumber(avgROAS)}%\n`;
          response += `• Avg. Payout: $${formatNumber(avgPayout)}\n`;
          response += `• Avg. Click-Through Rate: ${formatNumber(avgClickThroughRate)}%\n`;
          response += `• Avg. CPA: $${formatNumber(avgCPA)}\n`;
          response += `• ROI: ${formatNumber(roi)}%`;

          setMessages(prev => [...prev, { text: response, sender: 'bot' as const }]);
          
          const chartData = negativeROIRegions.map((region: Region) => ({
            name: region.name,
            value: region.roi,
            avgPayout: region.avgPayout
          }));

          onSearchComplete({
            response,
            aggregatedData: {
              conversionRate: avgConversionRate,
              clickThroughRate: avgClickThroughRate,
              costPerClick: avgCostPerClick,
              roas: avgROAS,
              avgPayout: avgPayout,
              profit: totalProfit,
              clicks: negativeROIRegions.reduce((sum, region) => sum + region.clicks, 0),
              cvrs: totalConversions,
              revenue: totalRevenue,
              spent: totalCost,
              avgCPA: avgCPA,
              roi: roi,
              avgConversionRate: avgConversionRate,
              avgClickThroughRate: avgClickThroughRate,
              avgCostPerClick: avgCostPerClick,
              avgROAS: avgROAS,
              totalProfit: totalProfit,
            },
            campaignName: 'Auto Insurance',
            dataType: 'regional',
            chartData
          }, formatNumber);
        }

        setIsLoading(false);
      }, 2000);
    } else if (starter === "Best offer per Region based on EPC") {
      setIsLoading(true);
      setMessages(prev => [...prev, { text: starter, sender: 'user' as const }]);

      setTimeout(() => {
        const bestOffers = getBestOfferPerRegionByEPC(mockData);
        let response = "Here are the best offers per region based on EPC:\n\n";

        const offerSummary: { [key: string]: { region: string; epc: number; metrics: MetricsData }[] } = {};
        const allOffers: MetricsData[] = [];

        Object.entries(bestOffers).forEach(([region, offers]) => {
          response += `<b>${region}</b>:\n`;
          offers.forEach((offer, index) => {
            const cpa = offer.metrics.spent / offer.metrics.cvrs;
            const roi = ((offer.metrics.revenue - offer.metrics.spent) / offer.metrics.spent) * 100;
            response += `• ${index === 0 ? '🏆 ' : ''}${offer.offer} - $${formatNumber(offer.epc)} EPC, CPA: $${formatNumber(cpa)}, ROI: ${formatNumber(roi)}%\n`;
            if (index === 0) {
              if (!offerSummary[offer.offer]) {
                offerSummary[offer.offer] = [];
              }
              offerSummary[offer.offer].push({ region, epc: offer.epc, metrics: offer.metrics });
            }
            allOffers.push(offer.metrics);
          });
          response += '\n';
        });

        // Calculate aggregated data for all offers
        const totalOffers = allOffers.length;
        const avgConversionRate = allOffers.reduce((sum, offer) => sum + offer.cr, 0) / totalOffers;
        const avgClickThroughRate = allOffers.reduce((sum, offer) => sum + offer.ctr, 0) / totalOffers;
        const avgCostPerClick = allOffers.reduce((sum, offer) => sum + offer.cpc, 0) / totalOffers;
        const avgROAS = allOffers.reduce((sum, offer) => sum + (offer.revenue / offer.spent * 100), 0) / totalOffers;
        const avgPayout = allOffers.reduce((sum, offer) => sum + offer.avgPayout, 0) / totalOffers;
        const totalProfit = allOffers.reduce((sum, offer) => sum + offer.profit, 0);
        const totalRevenue = allOffers.reduce((sum, offer) => sum + offer.revenue, 0);
        const totalCost = allOffers.reduce((sum, offer) => sum + offer.spent, 0);
        const totalConversions = allOffers.reduce((sum, offer) => sum + offer.cvrs, 0);
        const avgCPA = totalCost / totalConversions;
        const roi = ((totalRevenue - totalCost) / totalCost) * 100;

        // Add aggregated data to the response
        response += "\n<b>Aggregated data for all offers:</b>\n\n";
        response += `• Avg. Conversion Rate: ${formatNumber(avgConversionRate)}%\n`;
        response += `• Avg. Click-Through Rate: ${formatNumber(avgClickThroughRate)}%\n`;
        response += `• Avg. Cost Per Click: $${formatNumber(avgCostPerClick)}\n`;
        response += `• Avg. ROAS: ${formatNumber(avgROAS)}%\n`;
        response += `• Avg. Payout: $${formatNumber(avgPayout)}\n`;
        response += `• Total Profit: $${formatNumber(totalProfit)}\n`;
        response += `• Avg. CPA: $${formatNumber(avgCPA)}\n`;
        response += `• ROI: ${formatNumber(roi)}%\n`;

        setMessages(prev => [...prev, { text: response, sender: 'bot' as const }]);

        // Generate chart data
        const chartData = Object.entries(bestOffers).map(([region, offers]) => ({
          name: region,
          value: offers[0].epc,
          avgPayout: offers[0].metrics.avgPayout,
        }));

        onSearchComplete({
          response,
          aggregatedData: {
            avgConversionRate,
            avgClickThroughRate,
            avgCostPerClick,
            avgROAS,
            avgPayout,
            totalProfit,
            totalRevenue,
            totalCost,
            clicks: allOffers.reduce((sum, offer) => sum + offer.clicks, 0),
            cvrs: totalConversions,
            revenue: totalRevenue,
            spent: totalCost,
            profit: totalProfit,
            conversionRate: avgConversionRate,
            clickThroughRate: avgClickThroughRate,
            costPerClick: avgCostPerClick,
            roas: avgROAS,
            avgCPA,
            roi,
          },
          campaignName: 'Best Offer per Region (EPC)',
          dataType: 'regional',
          chartData,
        }, formatNumber);

        setIsLoading(false);
      }, 2000);
    } else if (starter === "Best offer per Region based on EPC (Offer Region Data)") {
      setIsLoading(true);
      setMessages(prev => [...prev, { text: starter, sender: 'user' as const }]);

      setTimeout(() => {
        const bestOffers = getBestOfferPerRegionByEPCFromOfferRegion();
        let response = "Here are the best offers per region based on EPC (using Offer Region data):\n\n";

        const offerSummary: { [key: string]: { region: string; epc: number; metrics: MetricsData }[] } = {};
        const allOffers: MetricsData[] = [];
        const offerAggregates: { [key: string]: { 
          totalClicks: number, 
          totalConversions: number, 
          totalRevenue: number, 
          totalCost: number, 
          totalProfit: number, 
          avgEPC: number, 
          avgCPC: number, 
          avgCR: number, 
          avgROI: number,
          avgPayout: number
        } } = {};

        // Create a map to store the best offer for each region
        const bestOfferByRegion: { [key: string]: { offer: string; epc: number } } = {};

        Object.entries(bestOffers).forEach(([region, offers]) => {
          response += `<b>${region}</b>:\n`;
          offers.forEach((offer, index) => {
            response += `• ${index === 0 ? '🏆 ' : ''}${offer.offer} - $${formatNumber(offer.epc)} EPC\n`;
            if (!offerAggregates[offer.offer]) {
              offerAggregates[offer.offer] = { 
                totalClicks: 0, totalConversions: 0, totalRevenue: 0, totalCost: 0, totalProfit: 0,
                avgEPC: 0, avgCPC: 0, avgCR: 0, avgROI: 0, avgPayout: 0
              };
            }
            if (!offerSummary[offer.offer]) {
              offerSummary[offer.offer] = [];
            }
            offerSummary[offer.offer].push({ region, epc: offer.epc, metrics: offer.metrics });
            offerAggregates[offer.offer].totalClicks += offer.metrics.clicks;
            offerAggregates[offer.offer].totalConversions += offer.metrics.cvrs;
            offerAggregates[offer.offer].totalRevenue += offer.metrics.revenue;
            offerAggregates[offer.offer].totalCost += offer.metrics.spent;
            offerAggregates[offer.offer].totalProfit += offer.metrics.profit;
            allOffers.push(offer.metrics);

            // Update the best offer for this region if necessary
            if (!bestOfferByRegion[region] || offer.epc > bestOfferByRegion[region].epc) {
              bestOfferByRegion[region] = { offer: offer.offer, epc: offer.epc };
            }
          });
          response += '\n';
        });

        // Calculate averages for each offer
        Object.keys(offerAggregates).forEach(offer => {
          const agg = offerAggregates[offer];
          const totalRegions = offerSummary[offer].length;
          agg.avgEPC = agg.totalRevenue / agg.totalClicks;
          agg.avgCPC = agg.totalCost / agg.totalClicks;
          agg.avgCR = (agg.totalConversions / agg.totalClicks) * 100;
          agg.avgROI = ((agg.totalRevenue - agg.totalCost) / agg.totalCost) * 100;
          agg.avgPayout = agg.totalRevenue / agg.totalConversions;
        });

        // Add offer summary
        response += "\n<b>Offer Summary:</b>\n\n";
        Object.entries(offerAggregates).forEach(([offer, agg]) => {
          response += `<b>${offer}</b>:\n`;
          response += `• Total Clicks: ${formatNumber(agg.totalClicks)}\n`;
          response += `• Total Conversions: ${formatNumber(agg.totalConversions)}\n`;
          response += `• Total Revenue: $${formatNumber(agg.totalRevenue)}\n`;
          response += `• Total Cost: $${formatNumber(agg.totalCost)}\n`;
          response += `• Total Profit: $${formatNumber(agg.totalProfit)}\n`;
          response += `• Avg. EPC: $${formatNumber(agg.avgEPC)}\n`;
          response += `• Avg. CPC: $${formatNumber(agg.avgCPC)}\n`;
          response += `• Avg. CR: ${formatNumber(agg.avgCR)}%\n`;
          response += `• Avg. ROI: ${formatNumber(agg.avgROI)}%\n`;
          response += `• Avg. Payout: $${formatNumber(agg.avgPayout)}\n\n`;
        });

        // Add summary of best regions for each offer
        response += "\n<b>Summary of best regions for each offer:</b>\n\n";
        Object.entries(offerSummary).forEach(([offer, regions]) => {
          response += `<b>${offer}</b>:\n`;
          Object.entries(bestOfferByRegion)
            .filter(([_, bestOffer]) => bestOffer.offer === offer)
            .forEach(([region, bestOffer]) => {
              response += `• ${region} - $${formatNumber(bestOffer.epc)} EPC\n`;
            });
          response += '\n';
        });

        // Calculate aggregated data for all offers
        const totalClicks = allOffers.reduce((sum, offer) => sum + offer.clicks, 0);
        const totalConversions = allOffers.reduce((sum, offer) => sum + offer.cvrs, 0);
        const totalRevenue = allOffers.reduce((sum, offer) => sum + offer.revenue, 0);
        const totalCost = allOffers.reduce((sum, offer) => sum + offer.spent, 0);
        const totalProfit = totalRevenue - totalCost;
        const avgConversionRate = (totalConversions / totalClicks) * 100;
        const avgClickThroughRate = allOffers.reduce((sum, offer) => sum + offer.ctr, 0) / allOffers.length;
        const avgCostPerClick = totalCost / totalClicks;
        const avgROAS = (totalRevenue / totalCost) * 100;
        const avgPayout = totalRevenue / totalConversions;
        const avgCPA = totalCost / totalConversions;
        const roi = ((totalRevenue - totalCost) / totalCost) * 100;

        // Add aggregated data to the response
        response += "\n<b>Aggregated data for all offers:</b>\n\n";
        response += `• Total Clicks: ${formatNumber(totalClicks)}\n`;
        response += `• Total Conversions: ${formatNumber(totalConversions)}\n`;
        response += `• Total Revenue: $${formatNumber(totalRevenue)}\n`;
        response += `• Total Cost: $${formatNumber(totalCost)}\n`;
        response += `• Total Profit: $${formatNumber(totalProfit)}\n`;
        response += `• Avg. Conversion Rate: ${formatNumber(avgConversionRate)}%\n`;
        response += `• Avg. Click-Through Rate: ${formatNumber(avgClickThroughRate)}%\n`;
        response += `• Avg. Cost Per Click: $${formatNumber(avgCostPerClick)}\n`;
        response += `• Avg. ROAS: ${formatNumber(avgROAS)}%\n`;
        response += `• Avg. Payout: $${formatNumber(avgPayout)}\n`;
        response += `• Avg. CPA: $${formatNumber(avgCPA)}\n`;
        response += `• ROI: ${formatNumber(roi)}%\n`;

        setMessages(prev => [...prev, { text: response, sender: 'bot' as const }]);

        // Generate chart data
        const chartData = Object.entries(bestOffers).map(([region, offers]) => ({
          name: region,
          value: offers[0].epc,
          avgPayout: offers[0].metrics.avgPayout,
        }));

        onSearchComplete({
          response,
          aggregatedData: {
            clicks: totalClicks,
            cvrs: totalConversions,
            revenue: totalRevenue,
            spent: totalCost,
            profit: totalProfit,
            conversionRate: avgConversionRate,
            clickThroughRate: avgClickThroughRate,
            costPerClick: avgCostPerClick,
            roas: avgROAS,
            avgPayout: avgPayout,
            avgCPA: avgCPA,
            roi: roi,
            // Include these if they're used elsewhere
            avgConversionRate: avgConversionRate,
            avgClickThroughRate: avgClickThroughRate,
            avgCostPerClick: avgCostPerClick,
            avgROAS: avgROAS,
            totalProfit: totalProfit,
          },
          campaignName: 'Best Offer per Region (EPC) - Offer Region Data',
          dataType: 'regional',
          chartData,
        }, formatNumber);

        setIsLoading(false);
      }, 2000);
    } else {
      handleSend();
    }
  };

  const renderMessage = (message: Message, index: number) => {
    return (
      <div key={index} className={`flex mb-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div className={`flex items-start space-x-2 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`} style={{maxWidth: '66%'}}>
          <Avatar className="w-8 h-8 flex-shrink-0">
            {message.sender === 'user' ? (
              <AvatarImage src="/assets/ninja_avatar.png" alt="User" />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-indigo-500 text-white">
                <RiRobot2Line size={20} />
              </div>
            )}
            <AvatarFallback>{message.sender === 'user' ? "" : ""}</AvatarFallback>
          </Avatar>
          <div className={`p-3 rounded-lg shadow ${message.sender === 'user' ? 'bg-gradient-to-r from-purple-400 to-blue-500 text-white' : 'bg-gray-100'}`}>
            <p className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: message.text }}></p>
          </div>
        </div>
      </div>
    );
  };

  const getRegionsWithHighROI = (data: any): Region[] => {
    const regionMap = new Map<string, Partial<Region>>();

    data.campaigns
      .filter((campaign: any) => campaign.name === 'Auto Insurance')
      .forEach((campaign: any) => 
        Object.entries(campaign.by_offer || {}).forEach(([offerId, regions]) =>
          (regions as MetricsData[]).forEach((region: MetricsData) => {
            const existingRegion = regionMap.get(region.name);
            if (existingRegion) {
              // Aggregate metrics
              existingRegion.clicks = (existingRegion.clicks || 0) + region.clicks;
              existingRegion.offerClicks = (existingRegion.offerClicks || 0) + region.offerClicks;
              existingRegion.revenue = (existingRegion.revenue || 0) + region.revenue;
              existingRegion.spent = (existingRegion.spent || 0) + region.spent;
              existingRegion.profit = (existingRegion.profit || 0) + region.profit;
              existingRegion.cvrs = (existingRegion.cvrs || 0) + region.cvrs;
            } else {
              regionMap.set(region.name, {
                name: region.name,
                clicks: region.clicks,
                offerClicks: region.offerClicks,
                revenue: region.revenue,
                spent: region.spent,
                profit: region.profit,
                cvrs: region.cvrs,
                ctr: region.ctr,
                cr: region.cr,
                epc: region.epc,
                cpc: region.cpc,
                ecpa: region.ecpa,
                avgPayout: region.avgPayout,
                roi: 0 // Will be calculated later
              });
            }
          })
        )
      );

    // Calculate aggregated metrics
    return Array.from(regionMap.values())
      .map(region => ({
        ...region,
        roi: (region.profit! / region.spent!) * 100,
        cr: (region.cvrs! / region.clicks!) * 100,
        cpc: region.spent! / region.clicks!,
        ctr: (region.offerClicks! / region.clicks!) * 100,
        epc: region.revenue! / region.clicks!,
        ecpa: region.spent! / region.cvrs!,
        avgPayout: region.revenue! / region.cvrs!
      } as Region))
      .filter(region => region.roi >= 25);
  };

  const getRegionsWithNegativeROI = (data: any): Region[] => {
    const regionMap = new Map<string, Partial<Region>>();

    data.campaigns
      .filter((campaign: any) => campaign.name === 'Auto Insurance')
      .forEach((campaign: any) => 
        Object.entries(campaign.by_offer || {}).forEach(([offerId, regions]) =>
          (regions as MetricsData[]).forEach((region: MetricsData) => {
            const existingRegion = regionMap.get(region.name);
            if (existingRegion) {
              // Aggregate metrics
              existingRegion.clicks = (existingRegion.clicks || 0) + region.clicks;
              existingRegion.offerClicks = (existingRegion.offerClicks || 0) + region.offerClicks;
              existingRegion.revenue = (existingRegion.revenue || 0) + region.revenue;
              existingRegion.spent = (existingRegion.spent || 0) + region.spent;
              existingRegion.profit = (existingRegion.profit || 0) + region.profit;
              existingRegion.cvrs = (existingRegion.cvrs || 0) + region.cvrs;
            } else {
              regionMap.set(region.name, {
                name: region.name,
                clicks: region.clicks,
                offerClicks: region.offerClicks,
                revenue: region.revenue,
                spent: region.spent,
                profit: region.profit,
                cvrs: region.cvrs,
                ctr: region.ctr,
                cr: region.cr,
                epc: region.epc,
                cpc: region.cpc,
                ecpa: region.ecpa,
                avgPayout: region.avgPayout,
                roi: 0 // Will be calculated later
              });
            }
          })
        )
      );

    // Calculate aggregated metrics
    return Array.from(regionMap.values())
      .map(region => ({
        ...region,
        roi: (region.profit! / region.spent!) * 100,
        cr: (region.cvrs! / region.clicks!) * 100,
        cpc: region.spent! / region.clicks!,
        ctr: (region.offerClicks! / region.clicks!) * 100,
        epc: region.revenue! / region.clicks!,
        ecpa: region.spent! / region.cvrs!,
        avgPayout: region.revenue! / region.cvrs!
      } as Region))
      .filter(region => region.roi < 0 && Math.abs(region.profit!) >= 100);
  };

  const clearChat = () => {
    setMessages([]);
    setChatHeight('auto');
    if (chatRef.current) {
      chatRef.current.scrollTop = 0;
    }
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  useEffect(() => {
    const mockFirestoreData = {
      overallStats: getOverallStats(),
      campaigns: getCampaigns(),
      regionData: getCampaigns().map(campaign => getCampaignRegionData(campaign.id))
    };
    setFirestoreData(mockFirestoreData);
  }, []);

  useEffect(() => {
    console.log("Messages updated:", messages); // Add this line
    updateChatHeight();
  }, [messages]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingDots(prev => (prev.length >= 3 ? '' : prev + '.'));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const getBestOfferPerRegionByEPCFromOfferRegion = () => {
    const bestOffers: { [key: string]: { offer: string; epc: number; metrics: MetricsData }[] } = {};

    Object.entries(offerRegionData.by_offer).forEach(([offer, regions]) => {
      regions.forEach((region: any) => {
        if (!bestOffers[region.name]) {
          bestOffers[region.name] = [];
        }
        bestOffers[region.name].push({
          offer,
          epc: parseFloat(region.epc.replace('$', '').trim()),
          metrics: {
            ...region,
            clicks: parseInt(region.clicks),
            offerClicks: parseInt(region.offerClicks),
            cvrs: parseInt(region.cvrs.replace(',', '')),
            ctr: parseFloat(region.ctr),
            cr: parseFloat(region.cr),
            revenue: parseFloat(region.revenue),
            spent: parseFloat(region.spent),
            profit: parseFloat(region.profit),
            roi: parseFloat(region.roi),
            cpc: parseFloat(region.cpc.replace('$', '').trim()),
            avgPayout: parseFloat(region.avgPayout.replace('$', '').trim()),
          }
        });
      });
    });

    // Sort offers for each region by EPC in descending order
    Object.keys(bestOffers).forEach(region => {
      bestOffers[region].sort((a, b) => b.epc - a.epc);
    });

    return bestOffers;
  };

  return (
    <div className="w-full max-w-4xl">
      <Card className="bg-white overflow-hidden transition-all duration-300 ease-in-out">
        <CardContent className="p-4 flex flex-col" style={{ minHeight: '60px' }}>
          <div className="flex justify-end mb-2 space-x-2">
            {showResults && (
              <button
                onClick={() => setShowChartModal(true)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <BarChart2 className="w-5 h-5 text-gray-500" />
              </button>
            )}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <button
                  onClick={toggleModal}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                  <Maximize2 className="w-5 h-5 text-gray-500" />
                </button>
              </DialogTrigger>
              <DialogContent className="w-[90vw] h-[90vh] max-w-none bg-white p-6 flex flex-col">
                <div className="flex-grow overflow-hidden flex flex-col">
                  <ScrollArea className="flex-grow pr-4">
                    <div className="space-y-4">
                      {messages.map((message, index) => renderMessage(message, index))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="flex items-start space-x-2 max-w-[66%]">
                            <Avatar className="w-8 h-8">
                              <div className="flex items-center justify-center w-full h-full bg-indigo-500 text-white">
                                <RiRobot2Line size={20} />
                              </div>
                              <AvatarFallback></AvatarFallback>
                            </Avatar>
                            <div className="p-3 rounded-lg shadow bg-gray-200">
                              <p className="text-sm">
                                Analyzing
                                <span className="inline-block w-4">
                                  {loadingDots.split('').map((dot, index) => (
                                    <span
                                      key={index}
                                      className="inline-block animate-bounce"
                                      style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                      {dot}
                                    </span>
                                  ))}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  <div className="mt-4 flex flex-col space-y-4">
                    <div className="flex space-x-2">
                      <Input
                        className="flex-grow"
                        placeholder="Ask about campaign data or marketing KPIs..."
                        value={input}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                      />
                      <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                        Send
                      </Button>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      <button
                        onClick={() => handleConversationStarter("What Regions for Auto Insurance have earned 25% ROI or better in the last 30 days?")}
                        className="px-4 py-2 border border-purple-500 text-purple-500 rounded-md hover:bg-purple-50 transition-colors duration-300"
                      >
                        Auto Insurance High ROI Regions
                      </button>
                      <button
                        onClick={() => handleConversationStarter("What Regions for Auto Insurance have lost $100 or more and have a negative ROI?")}
                        className="px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition-colors duration-300"
                      >
                        Auto Insurance Negative ROI Regions
                      </button>
                      <button
                        onClick={() => handleConversationStarter("Best offer per Region based on EPC")}
                        className="px-4 py-2 border border-green-500 text-green-500 rounded-md hover:bg-green-50 transition-colors duration-300"
                      >
                        Best Offer per Region (EPC)
                      </button>
                      <button
                        onClick={() => handleConversationStarter("Best offer per Region based on EPC (Offer Region Data)")}
                        className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 transition-colors duration-300"
                      >
                        Best Offer per Region (EPC) - Offer Region Data
                      </button>
                      <button
                        onClick={clearChat}
                        className="px-4 py-2 border border-gray-500 text-gray-500 rounded-md hover:bg-gray-50 transition-colors duration-300 flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear Chat
                      </button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <ScrollArea className="flex-grow mb-4 pr-4 overflow-y-auto" style={{ height: `calc(${chatHeight} - 60px)` }} ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message, index) => renderMessage(message, index))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2 max-w-[66%]">
                    <Avatar className="w-8 h-8">
                      <div className="flex items-center justify-center w-full h-full bg-indigo-500 text-white">
                        <RiRobot2Line size={20} />
                      </div>
                      <AvatarFallback></AvatarFallback>
                    </Avatar>
                    <div className="p-3 rounded-lg shadow bg-gray-200">
                      <p className="text-sm">
                        Analyzing
                        <span className="inline-block w-4">
                          {loadingDots.split('').map((dot, index) => (
                            <span
                              key={index}
                              className="inline-block animate-bounce"
                              style={{ animationDelay: `${index * 0.1}s` }}
                            >
                              {dot}
                            </span>
                          ))}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {messages.length > 0 && messages[messages.length - 1].sender === 'bot' && (
              <div className="mt-4 flex justify-center">
                <Button
                  onClick={() => setIsSignupModalOpen(true)}
                  className="bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-200 px-4 py-2 rounded-md shadow-md"
                >
                  Get More Insights
                </Button>
              </div>
            )}
          </ScrollArea>
          <div className="flex space-x-2 mt-auto">
            <Input
              ref={inputRef}
              className="flex-grow"
              placeholder="Ask about campaign data or marketing KPIs..."
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <button
          onClick={() => handleConversationStarter("What Regions for Auto Insurance have earned 25% ROI or better in the last 30 days?")}
          className="px-4 py-2 border border-purple-500 text-purple-500 rounded-md hover:bg-purple-50 transition-colors duration-300"
        >
          Auto Insurance High ROI Regions
        </button>
        <button
          onClick={() => handleConversationStarter("What Regions for Auto Insurance have lost $100 or more and have a negative ROI?")}
          className="px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition-colors duration-300"
        >
          Auto Insurance Negative ROI Regions
        </button>
        <button
          onClick={() => handleConversationStarter("Best offer per Region based on EPC")}
          className="px-4 py-2 border border-green-500 text-green-500 rounded-md hover:bg-green-50 transition-colors duration-300"
        >
          Best Offer per Region (EPC)
        </button>
        <button
          onClick={() => handleConversationStarter("Best offer per Region based on EPC (Offer Region Data)")}
          className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 transition-colors duration-300"
        >
          Best Offer per Region (EPC) - Offer Region Data
        </button>
        <button
          onClick={clearChat}
          className="px-4 py-2 border border-gray-500 text-gray-500 rounded-md hover:bg-gray-50 transition-colors duration-300 flex items-center"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear Chat
        </button>
      </div>
      <Collapsible.Root 
        className="mt-4" 
        open={isDataCollapsibleOpen} 
        onOpenChange={setIsDataCollapsibleOpen}
      >
        <Collapsible.Trigger className="w-full flex items-center justify-center p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200">
          {isDataCollapsibleOpen ? (
            <ChevronUpIcon className="w-6 h-6" />
          ) : (
            <ChevronDownIcon className="w-6 h-6" />
          )}
          <span className="ml-2">
            {isDataCollapsibleOpen ? "Hide Firestore Data" : "Show Firestore Data"}
          </span>
        </Collapsible.Trigger>
        <Collapsible.Content className="mt-2">
          <Card>
            <CardContent className="p-4">
              <ScrollArea className="h-96">
                <pre className="text-xs whitespace-pre-wrap">
                  {JSON.stringify(firestoreData, null, 2)}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </Collapsible.Content>
      </Collapsible.Root>
      
      {/* Update the Dialog component for the signup modal */}
      <Dialog open={isSignupModalOpen} onOpenChange={setIsSignupModalOpen}>
        <DialogContent className="bg-white p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Sign Up</h2>
          <p className="mb-4 text-gray-600">Sign up to get more insights and unlock advanced features!</p>
          {/* Add your signup form or content here */}
          <Button onClick={() => setIsSignupModalOpen(false)} className="bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-200">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataChatApp;
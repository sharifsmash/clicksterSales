import React, { useState, useEffect, useRef } from 'react';
import { Marquee } from '../components/magicui/Marquee';
import { AnimatedList } from '../components/magicui/animated-list';
import MagicButton from '../components/MagicButton';
import { TypeAnimation } from 'react-type-animation';
import ShinyButton from "../components/magicui/shiny-button";

import { DotPattern } from '../components/magicui/DotPattern';

interface AdMockupProps {
  title: string;
  description: string;
  cta: string;
  logoSrc: string | null;
  logoAlt: string;
}

const features = [
  {
    name: "Connect your traffic sources",
    description: "Integrate all your traffic sources in one place",
    time: "5m of work",
    icon: "💸",
    color: "#00C9A7",
  },
  {
    name: "Create campaigns in minutes",
    description: "Use our AI to create campaigns that convert",
    time: "2m of work",
    icon: "👤",
    color: "#FFB800",
  },
  {
    name: "Create and upload ads",
    description: "Use our AI to create and upload 100's of ads",
    time: "5m of work",
    icon: "💬",
    color: "#FF3D71",
  },
  {
    name: "Automate your campaigns",
    description: "Use our AI to optimize your campaigns",
    time: "2m of work",
    icon: "🗞️",
    color: "#1E86FF",
  },
  {
    name: "Watch your profits grow",
    description: "Stop worrying about your ads, and start focusing on your business",
    time: "2m of work",
    icon: "🤖",
    color: "#8A2BE2",
  },
];

const FeatureItem: React.FC<typeof features[0]> = ({ name, description, icon, color, time }) => (
  <div className="bg-white p-4 rounded-2xl shadow-lg hover:scale-[103%] transition-all duration-200 ease-in-out cursor-pointer">
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-10 h-10 rounded-2xl" style={{ backgroundColor: color }}>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="overflow-hidden">
        <div className="flex items-center text-lg font-medium">
          <span className="text-sm sm:text-lg">{name}</span>
          <span className="mx-1">·</span>
          <span className="text-xs text-gray-500">{time}</span>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  </div>
);

const WhyClicksterItem: React.FC<{ icon: string; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="flex items-start space-x-4">
    <div className="flex-shrink-0">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
    <div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
);

const Footer: React.FC = () => (
  <footer className="bg-gray-800 text-gray-300 py-16">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
        <div>
          <h3 className="font-semibold text-white mb-4">Features</h3>
          <ul className="space-y-2">
            <li>Tracking & Attribution</li>
            <li>Reports & Logs</li>
            <li>Automation</li>
            <li>Teamwork & Productivity</li>
            <li>Integrations</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-white mb-4">Popular Features</h3>
          <ul className="space-y-2">
            <li>Ad tracking</li>
            <li>Teamwork</li>
            <li>Partner marketing</li>
            <li>RedTrack API</li>
            <li>Ad tracking & Management automation</li>
            <li>Cost & Revenue auto-sync</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-white mb-4">Resources</h3>
          <ul className="space-y-2">
            <li>Glossary</li>
            <li>Community</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-white mb-4">Integrations</h3>
          <ul className="space-y-2">
            <li>TikTok Ads</li>
            <li>Google Ads</li>
            <li>Facebook/Meta Ads</li>
            <li>Microsoft/Bing Ads</li>
            <li>YouTube Ads</li>
            <li>ClickBank</li>
            <li>ClickFunnels</li>
            <li>Taboola</li>
            <li>MaxBounty</li>
            <li>Digistore24</li>
            <li>Shopify</li>
            <li>WooCommerce</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-white mb-4">Terms of Use</h3>
          <ul className="space-y-2">
            <li>Terms of use</li>
            <li>Privacy policy</li>
            <li>GDPR</li>
            <li>Cookie policy</li>
            <li>End-user agreement</li>
            <li>Referral program terms and conditions</li>
          </ul>
        </div>
      </div>
      <div className="mt-12 flex justify-end space-x-4">
        <img src="/assets/download/logo-app-store.svg" alt="Download on the App Store" className="h-10" />
        <img src="/assets/download/logo-google-play.svg" alt="Get it on Google Play" className="h-10" />
      </div>
    </div>
  </footer>
);

const LandingPageFeature: React.FC<{ 
  title: string; 
  description: string;
  isSelected: boolean;
  onSelect: () => void;
  icon: string;
}> = ({ title, description, isSelected, onSelect, icon }) => (
  <div 
    className={`mb-6 cursor-pointer p-4 rounded-lg transition-colors duration-200 ${
      isSelected ? 'bg-gray-800' : 'hover:bg-gray-800'
    }`}
    onClick={onSelect}
  >
    <div className="flex items-center mb-2">
      <span className="text-2xl mr-3">{icon}</span>
      <h3 className="text-xl font-semibold text-white">{title}</h3>
    </div>
    <p className={`text-gray-400 ${isSelected ? 'text-white' : ''}`}>{description}</p>
  </div>
);

const PricingToggle: React.FC<{ isYearly: boolean; onToggle: () => void }> = ({ isYearly, onToggle }) => (
  <div className="flex items-center justify-center mb-8">
    <button
      className={`px-4 py-2 rounded-l-full ${isYearly ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
      onClick={() => !isYearly && onToggle()}
    >
      Yearly
    </button>
    <button
      className={`px-4 py-2 rounded-r-full ${!isYearly ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
      onClick={() => isYearly && onToggle()}
    >
      Monthly
    </button>
  </div>
);

const PricingCard: React.FC<{
  title: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
}> = ({ title, price, period, description, features, isPopular }) => (
  <div className={`bg-white p-8 rounded-2xl shadow-lg ${isPopular ? 'border-2 border-indigo-600' : ''}`}>
    {isPopular && (
      <div className="bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full inline-block mb-4">
        Best value
      </div>
    )}
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600 mb-4">{description}</p>
    <div className="mb-6">
      <span className="text-4xl font-bold">US${price}</span>
      <span className="text-gray-500">/{period}</span>
    </div>
    <button className={`w-full py-2 px-4 rounded-md mb-6 ${isPopular ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
      Get {title} Plan
    </button>
    <ul className="space-y-2">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center">
          <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {feature}
        </li>
      ))}
    </ul>
  </div>
);

const SaasPage: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState(0);
  const [isYearlyPricing, setIsYearlyPricing] = useState(true);

  const typeAnimationRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const applyGradient = () => {
      if (typeAnimationRef.current) {
        typeAnimationRef.current.style.backgroundImage = 'linear-gradient(45deg, #8B5CF6, #3B82F6)';
        typeAnimationRef.current.style.webkitBackgroundClip = 'text';
        typeAnimationRef.current.style.backgroundClip = 'text';
        typeAnimationRef.current.style.color = 'transparent';
      }
    };

    // Apply gradient initially and after each animation cycle
    applyGradient();
    const intervalId = setInterval(applyGradient, 8000); // 8000ms = total duration of the animation cycle

    return () => clearInterval(intervalId);
  }, []);

  const landingPageFeatures = [
    {
      title: "Create Pages without Code",
      description: "Simply drag and drop elements and customize them to your liking without writing a single line of code",
      image: "/assets/landingpagebuilder/draganddrop.jpg",
      icon: "🖱️"
    },
    {
      title: "Translate Pages using AI",
      description: "No more need to hire expensive freelancers to translate your pages. Using the AI translator you can translate to any language in just a few clicks.",
      image: "/assets/landingpagebuilder/translate.jpg",
      icon: "🌐"
    },
    {
      title: "Lead Collection Made Easy",
      description: "Collect leads even if you have no tech skills. Just drag and drop a form from the editor, select what fields you need and you are good to go. Easily integrated with third party email providers like Mailchimp etc.",
      image: "/assets/landingpagebuilder/leadcollection.jpg",
      icon: "📋"
    },
    {
      title: "Lighting Fast Cloud Hosting",
      description: "Your pages will load super fast all the time. You can send as much traffic as you want and not worry about servers crashing or pages getting slower.",
      image: "/assets/landingpagebuilder/cloudhosting.jpg",
      icon: "⚡"
    }
  ];
  return (
    <div className="min-h-screen overflow-hidden">
      
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-2xl font-bold text-indigo-900">CLICKSTER</span>
        </div>
        <button className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-300">
          30 Day Free Trial
        </button>
      </header>

      <main className="container mx-auto px-4 pt-16 pb-28 relative z-20 -mt-12"> {/* Changed pb-32 to pb-28 */}
        <div className="flex flex-col lg:flex-row items-start justify-between">
          <div className="lg:w-1/2 mb-8 lg:mb-0 pt-[65px]">
            <div className="text-[2.7rem] font-bold leading-tight mb-4">
              <TypeAnimation
                sequence={[
                  'Ad management made easy.',
                  2000,
                  'Campaigns created effortlessly.',
                  2000,
                  'Data analyzed quickly.',
                  2000,
                  'Landing pages created in minutes.',
                  2000,
                ]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
                ref={typeAnimationRef}
                className="inline-block"
              />
              <br />
              <span className="text-[#1a202c] text-[3.6rem]">Scaling made simple.</span>
            </div>
            <p className="text-lg lg:text-xl text-gray-700 mb-8 max-w-[calc(100%-40px)]">
              A unified platform seamlessly integrated with all traffic sources and affiliate networks, powered by AI.
            </p>
            <div className="mt-10">
              <ShinyButton className="text-lg px-10 py-4">Try for free for one month</ShinyButton>
            </div>
          </div>
          <div className="lg:w-1/2">
            <MagicButton />
          </div>
        </div>
      </main>

      {/* Command Center Section */}
      <section className="relative py-16 overflow-hidden bg-gray-100">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-300/10 via-pink-300/10 to-blue-300/10"></div>
        <div className="container mx-auto px-4 relative z-10 -mt-[15px]"> {/* Added -mt-[15px] */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-1">
              YOUR <span className="text-black">CAMPAIGN</span>
            </h2>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 text-transparent bg-clip-text">
              Command Center
            </h2>
            <p className="text-xl text-gray-700 mt-4">
              Take complete control of your marketing campaigns from one powerful dashboard.
            </p>
          </div>

          {/* Subsection 1: Campaign Overview */}
          <div className="flex flex-col lg:flex-row items-center justify-between -mb-1">
            <div className="lg:w-1/2 mb-2 lg:mb-0">
              <img 
                src="/assets/commandcenter/commandcenter.png" 
                alt="Command Center Dashboard" 
                className="w-full max-w-2xl mx-auto rounded-lg shadow-xl"
              />
            </div>
            <div className="lg:w-1/2 lg:pl-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Complete Campaign Overview</h3>
              <p className="text-lg text-gray-700 mb-4">
                <strong>When we say launch, we mean everything</strong>—<strong>campaigns, ads, landing pages, and offers</strong>, all at once.
              </p>
              <p className="text-lg text-gray-700 mb-4">
                Welcome to your <strong>ultimate marketing control hub</strong>. With the <strong>ClicksterPro Command Center</strong>, every campaign is right at your fingertips. This centralized platform gives you the power to <strong>launch, track, optimize, and scale</strong> your marketing efforts across multiple traffic sources—all from a single dashboard.
              </p>
              
              <button className="bg-indigo-600 text-white font-semibold py-3 px-8 rounded-md hover:bg-indigo-700 transition duration-300">
                Explore Dashboard
              </button>
            </div>
          </div>

          {/* Subsection 2: Creative Management */}
          <div className="flex flex-col lg:flex-row-reverse items-center justify-between -mb-1 mt-12">
            <div className="lg:w-1/2 mb-2 lg:mb-0">
              <img 
                src="/assets/commandcenter/creatives.png"
                alt="Creative Management" 
                className="w-full max-w-2xl mx-auto"
              />
            </div>
            <div className="lg:w-1/2 lg:pr-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Turbocharge Your Ad Creation: Generate 100's of Ads in Just Seconds!</h3>
              <p className="text-lg text-gray-700 mb-4">
                Say goodbye to hours of manual ad creation. Unleash powerful automation and get ready-to-launch ads at scale—instantly.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                Tired of spending endless hours designing individual ads? Clickster Pro lets you create hundreds of personalized ads in seconds with our powerful, automated ad builder. Whether you're running campaigns on Facebook, Google, or TikTok, our platform helps you launch high-quality ads at scale, saving you valuable time while driving better performance.
              </p>
              <button className="bg-indigo-600 text-white font-semibold py-3 px-8 rounded-md hover:bg-indigo-700 transition duration-300">
                See How It Works
              </button>
            </div>
          </div>

          {/* Subsection 3: Real-time Analytics */}
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:w-1/2 mb-2 lg:mb-0">
              <img 
                src="/assets/commandcenter/analytics.png" 
                alt="Real-time Analytics" 
                className="w-full max-w-2xl mx-auto rounded-lg shadow-xl"
              />
            </div>
            <div className="lg:w-1/2 lg:pl-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Real-time Performance Insights</h3>
              <p className="text-lg text-gray-700 mb-6">
                Discover creative trends in real time using our intuitive reports. With real-time data insights, you'll always be on top of the latest creative performance trends. Adjust on the fly and stay ahead of the competition.
              </p>
              <button className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-indigo-700 transition duration-300">
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* AI-powered marketing solutions section */}
      <section className="bg-gradient-to-b from-white to-indigo-50 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:w-1/2 order-2 lg:order-1">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                AI-Powered Marketing Solutions
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Harness the power of artificial intelligence to revolutionize your marketing campaigns. Our platform uses cutting-edge AI technology to optimize your ad performance, target the right audience, and maximize your ROI.
              </p>
              <ul className="list-disc list-inside text-lg text-gray-700 mb-8">
                <li>Automated ad creation and optimization</li>
                <li>Intelligent audience targeting</li>
                <li>Predictive analytics for campaign performance</li>
                <li>Real-time adjustments for maximum efficiency</li>
              </ul>
              <button className="bg-indigo-600 text-white font-semibold py-3 px-8 rounded-md hover:bg-indigo-700 transition duration-300">
                Explore AI Features
              </button>
            </div>
            <div className="lg:w-1/2 mb-8 lg:mb-0 order-1 lg:order-2">
              <img
                src="/assets/ai-ilustration-marketing-1024x663.webp"
                alt="AI-powered marketing illustration"
                className="rounded-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-fluid px-0">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-8">Connections & Integrations</h2>
          <div className="w-full overflow-hidden">
            <div className="w-full relative">
              {/* Static Intro Mockup */}
              <div className="absolute left-0 top-0 z-10 py-4">
                <IntroMockup
                  title="Traffic source Integrations"
                  description="Manage campaign settings & creatives for all your traffic sources."
                  cta="See All Traffic Sources"
                />
              </div>
              
              {/* Scrolling Marquee */}
              <Marquee className="pl-[300px]">
                {[
                  { name: 'Taboola', logo: '/assets/trafficsources/icons/taboola.png' },
                  { name: 'Outbrain', logo: '/assets/trafficsources/icons/outbrain.png' },
                  { name: 'Mediago', logo: '/assets/trafficsources/icons/mediago.png' },
                  { name: 'MGID', logo: '/assets/trafficsources/icons/mgid.png' },
                  { name: 'RevContent', logo: '/assets/trafficsources/icons/revcontent.png' },
                  { name: 'Bing Ads', logo: '/assets/trafficsources/icons/bing.png' },
                  { name: 'Google Ads', logo: '/assets/trafficsources/icons/googleads.webp' },
                  { name: 'Instagram Ads', logo: '/assets/trafficsources/icons/instagram.png' },
                  { name: 'Meta (Facebook) Ads', logo: '/assets/trafficsources/icons/meta.png' },
                  { name: 'TikTok Ads', logo: '/assets/trafficsources/icons/tiktok.png' },
                ].map((source, index) => (
                  <div key={index} className="flex-shrink-0 mx-4">
                    <AdMockup
                      title={`${source.name} Ads`}
                      description={`Build highly converting ads in seconds for ${source.name}`}
                      cta="Learn More"
                      logoSrc={source.logo}
                      logoAlt={`${source.name} logo`}
                    />
                  </div>
                ))}
              </Marquee>
            </div>

            

            

            {/* Second Marquee */}
            <div className="w-full relative mt-8">
              <Marquee className="pr-[300px]" reverse={true}>
                {[
                  { name: 'Cake Marketing', logo: '/assets/affiliatenetworks/icons/cake.jpg' },
                  { name: 'Everflow', logo: '/assets/affiliatenetworks/icons/everflow.png' },
                  { name: 'Clickbooth', logo: '/assets/affiliatenetworks/icons/clickbooth.jpg' },
                  { name: 'DMS', logo: '/assets/affiliatenetworks/icons/dmsicon.png' },
                  { name: 'Hitpath', logo: '/assets/affiliatenetworks/icons/hitpath.png' },
                  { name: 'Metabase', logo: '/assets/affiliatenetworks/icons/metabase.svg' },
                
                ].map((source, index) => (
                  <div key={index} className="flex-shrink-0 mx-4">
                    <AdMockup
                      title={`${source.name}`}
                      description={`Optimize your ${source.name} campaigns with our advanced tools`}
                      cta="Analyze Now"
                      logoSrc={source.logo}
                      logoAlt={`${source.name} logo`}
                    />
                  </div>
                ))}
              </Marquee>
              
              {/* Static Intro Mockup on the right */}
              <div className="absolute right-0 top-0 z-10 py-4 h-full"> {/* Added h-full */}
                <IntroMockup
                  title="Analytics Integrations"
                  description="Connect and analyze data from all your marketing channels."
                  cta="Explore Analytics"
                />
              </div>
            </div>

            
          </div>
        </div>
      </section>

      {/* New "Why Clickster" section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why top media buyers choose Clickster?</h2>
            <div className="inline-block bg-red-100 text-red-500 px-3 py-1 rounded-full text-sm font-semibold">
              Why Clickster
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <WhyClicksterItem
              icon="🔍"
              title="Perfect attribution"
              description="Experience 100% conversion and revenue matching right down to the ad or placement level. No more missing data, ever."
            />
            <WhyClicksterItem
              icon="🎯"
              title="Centralized tracking"
              description="Monitor every channel in real-time from one dashboard: paid, organic, email, partnerships, and referrals."
            />
            <WhyClicksterItem
              icon="🔌"
              title="Top-tier CAPI"
              description="Send your conversion and revenue data back to Facebook, Google, TikTok, Bing, and more, closing reporting gaps and enhancing algorithm accuracy."
            />
            <WhyClicksterItem
              icon="🔗"
              title="200+ integrations"
              description="From ad and affiliate networks to e-com platforms, call trackers, and CRMs - integrate effortlessly to optimize your ad tracking."
            />
            <WhyClicksterItem
              icon="🛡️"
              title="Bypass iOS14 & ad blockers"
              description="Clickster uses serve-to-serve & API integrations to bring hyper-accurate tracking and restore conversion data accuracy without data modelling or guess algorithms."
            />
          </div>
        </div>
      </section>

      {/* Updated Landing Page Management section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center">
            Built in Landing Page Builder
            <br />
            <span className="text-purple-300">Fastest Loading Times in the Industry</span>
          </h2>

          <div className="flex flex-col lg:flex-row items-start justify-between">
            <div className="lg:w-1/2 mb-8 lg:mb-0">
              {landingPageFeatures.map((feature, index) => (
                <LandingPageFeature 
                  key={index}
                  title={feature.title}
                  description={feature.description}
                  isSelected={selectedFeature === index}
                  onSelect={() => setSelectedFeature(index)}
                  icon={feature.icon}
                />
              ))}
            </div>
            <div className="lg:w-1/2 flex items-center justify-center">
              <div className="w-full aspect-[4/3] flex items-center justify-center">
                <img 
                  src={landingPageFeatures[selectedFeature].image}
                  alt={landingPageFeatures[selectedFeature].title}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Product Features Section */}
      <section className="relative py-16 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-50 to-white"></div>
        
        {/* Background SVG pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" preserveAspectRatio="none">
            <path d="M0,1000 C300,800 700,900 1000,1000" fill="none" stroke="rgba(147,51,234,0.3)" strokeWidth="2" />
            <path d="M0,800 C200,700 800,750 1000,800" fill="none" stroke="rgba(147,51,234,0.3)" strokeWidth="2" />
            <path d="M0,600 C500,500 500,700 1000,600" fill="none" stroke="rgba(147,51,234,0.3)" strokeWidth="2" />
            <path d="M0,400 C200,300 800,350 1000,400" fill="none" stroke="rgba(147,51,234,0.3)" strokeWidth="2" />
            <path d="M0,200 C300,100 700,150 1000,200" fill="none" stroke="rgba(147,51,234,0.3)" strokeWidth="2" />
            <path d="M0,0 C200,-50 800,50 1000,0" fill="none" stroke="rgba(147,51,234,0.3)" strokeWidth="2" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              We think our product is hands-down the best on the market
            </h2>
            <p className="text-xl text-gray-700">
              Our team of agile developers is constantly rolling out new releases.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {[
              { icon: "🧠", title: "AI Optimization" },
              { icon: "🕸️", title: "Bot Filter" },
              { icon: "📱", title: "Fastest Redirects" },
              { icon: "📈", title: "Auto-Scaling" },
              { icon: "🌐", title: "Control Your Domains" },
              { icon: "🛠️", title: "World-Class Support" },
              { icon: "🖼️", title: "LP Pixel" },
              { icon: "🔧", title: "Funnel Support" },
              { icon: "👥", title: "Multi-User Access" },
            ].map((feature, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Pricing Section with DotPattern */}
      <section className="relative bg-gray-40 py-16 overflow-hidden">
        <DotPattern
          className="absolute inset-0 text-indigo-900 opacity-50 [mask-image:radial-gradient(1000px_circle_at_center,white,transparent)]"
          width={32}
          height={32}
          cx={1}
          cy={1}
          cr={1}
        />
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-8">
            Everything you need for best in class service
          </h2>
          <PricingToggle isYearly={isYearlyPricing} onToggle={() => setIsYearlyPricing(!isYearlyPricing)} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard
              title="Basic"
              price={isYearlyPricing ? 0 : 0}
              period={isYearlyPricing ? "year" : "month"}
              description="For individuals or startup teams."
              features={[
                "Unlimited tasks",
                "5 Projects",
                "Unlimited messages",
                "Collaborate with 5 members",
                "10/GB File storage",
                "Calendar view",
                "Assignee & Due dates"
              ]}
            />
            <PricingCard
              title="Premium"
              price={isYearlyPricing ? 190 : 19}
              period={isYearlyPricing ? "year" : "month"}
              description="For teams that need to create project plans with confidence."
              features={[
                "Timeline",
                "Unlimited dashboards",
                "Unlimited tasks",
                "Unlimited projects",
                "Unlimited messages",
                "Unlimited collaborate",
                "Unlimited file storage",
                "Calendar view",
                "Assignee & Due dates"
              ]}
              isPopular={true}
            />
            <PricingCard
              title="Business"
              price={isYearlyPricing ? 490 : 49}
              period={isYearlyPricing ? "year" : "month"}
              description="For teams and companies that need to manage work across initiatives."
              features={[
                "Admin Console",
                "Portfolios",
                "Goals",
                "Workloads",
                "Custom builders",
                "Field lock",
                "Unlimited Integrations",
                "Full access"
              ]}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

const IntroMockup: React.FC<Omit<AdMockupProps, 'logoSrc' | 'logoAlt'>> = ({
  title,
  description,
  cta,
}) => (
  <div className="bg-[#0c2137] text-white p-4 rounded-md w-64 shadow-lg">
    <div className="mb-2">
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <p className="text-sm mb-4">{description}</p>
    <button className="bg-white text-[#0c2137] px-4 py-2 rounded-md text-sm hover:bg-gray-100 transition-colors duration-200">
      {cta}
    </button>
  </div>
);

const AdMockup: React.FC<AdMockupProps> = ({
  title,
  description,
  cta,
  logoSrc,
  logoAlt,
}) => (
  <div className="bg-white p-4 rounded-md w-64 shadow-lg">
    <div className="flex items-center mb-2">
      {logoSrc && (
        <div className="w-8 h-8 mr-2 flex items-center justify-center">
          <img 
            src={logoSrc} 
            alt={logoAlt} 
            className="max-h-full max-w-full object-contain" // Removed rotate-180 class
          />
        </div>
      )}
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <p className="text-sm mb-4">{description}</p>
    <button className="bg-[#0c2137] text-white px-4 py-2 rounded-md text-sm hover:bg-[#1c3147] transition-colors duration-200">
      {cta}
    </button>
  </div>
);

export default SaasPage;
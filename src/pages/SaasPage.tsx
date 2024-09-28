import React from 'react';
import { Marquee } from '../components/magicui/Marquee';
import { AnimatedList } from '../components/magicui/animated-list';
import MagicButton from '../components/MagicButton';

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

const SaasPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white overflow-hidden">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-2xl font-bold text-indigo-900">CLICKSTER</span>
        </div>
        <button className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-300">
          30 Day Free Trial
        </button>
      </header>

      <main className="container mx-auto px-4 pt-16 pb-16">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="lg:w-1/2 mb-8 lg:mb-0">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Ad management made easy. Profits made simple.
            </h1>
            <p className="text-lg lg:text-xl text-gray-700 mb-8">
              A single platform integrated with all traffic sources, with integrated AI.
            </p>
            <button className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-indigo-700 transition duration-300">
              Try for free for one month
            </button>
          </div>
          <div className="lg:w-1/2">
            <MagicButton />
          </div>
        </div>
      </main>

      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Key Features & Integrations</h2>
          <div className="w-full">
            <div className="w-[80%] mx-auto">
              <Marquee className="py-4 rounded-lg shadow-md bg-white">
                {[
                  { name: 'Ads Builder', logo: null, isIntro: true },
                  { name: 'MGID', logo: '/assets/mgid.png' },
                  { name: 'Taboola', logo: '/assets/taboola.png' },
                  { name: 'RevContent', logo: '/assets/revcontent.png' },
                  { name: 'Outbrain', logo: '/assets/outbrain.png' },
                ].map((source, index) => (
                  <div key={index} className="flex items-center space-x-8 mx-4">
                    {source.isIntro ? (
                      <IntroMockup
                        title="Welcome to Ads Builder"
                        description="Create high-converting ads for multiple platforms in seconds"
                        cta="Get Started"
                      />
                    ) : (
                      <AdMockup
                        title={`${source.name} Ads`}
                        description={`Build highly converting ads in seconds for ${source.name}`}
                        cta="Learn More"
                        logoSrc={source.logo}
                        logoAlt={`${source.name} logo`}
                      />
                    )}
                  </div>
                ))}
              </Marquee>
            </div>
          </div>
        </div>
      </section>

      {/* New AI Illustration section */}
      <section className="bg-gradient-to-b from-white to-indigo-50 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:w-1/2 mb-8 lg:mb-0">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                AI-Powered Marketing Solutions
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Harness the power of artificial intelligence to revolutionize your marketing campaigns. Our platform uses cutting-edge AI technology to optimize your ad performance, target the right audience, and maximize your ROI.
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-8">
                <li>Automated ad creation and optimization</li>
                <li>Intelligent audience targeting</li>
                <li>Predictive analytics for campaign performance</li>
                <li>Real-time adjustments for maximum efficiency</li>
              </ul>
              <button className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-indigo-700 transition duration-300">
                Explore AI Features
              </button>
            </div>
            <div className="lg:w-1/2">
              <img
                src="/assets/ai-ilustration-marketing-1024x663.webp"
                alt="AI-powered marketing illustration"
                className="rounded-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* AnimatedList at the bottom */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Feature Updates</h2>
          <div className="max-w-2xl mx-auto">
            <AnimatedList>
              {features.map((feature, index) => (
                <FeatureItem key={index} {...feature} />
              ))}
            </AnimatedList>
          </div>
        </div>
      </section>
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
          <img src={logoSrc} alt={logoAlt} className="max-h-full max-w-full object-contain" />
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
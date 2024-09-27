import React from 'react';
import { Marquee } from '../components/Marquee';
import { AnimatedList } from '../components/magicui/animated-list';
import MagicButton from '../components/MagicButton';

interface AdMockupProps {
  title: string;
  description: string;
  cta: string;
  logoSrc: string | null;
  logoAlt: string;
}

const SaasPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white overflow-hidden">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-2xl font-bold text-indigo-900">CLICKSTER</span>
        </div>
        <button className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-700 transition duration-300">
          30 Day Free Trial
        </button>
      </header>

      <div className="pt-16"> {/* Added padding-top to move content down */}
        <div className="w-full max-w-3xl mx-auto relative z-10 mb-12">
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

        <main className="container mx-auto px-4 pt-8 pb-16">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:w-1/2 mb-8 lg:mb-0">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Ad management made easy. Profits made simple.
              </h1>
              <p className="text-lg lg:text-xl text-gray-700 mb-8">
                A single platform integrated with all traffic sources, with integrated AI.
              </p>
              <button className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-full hover:bg-indigo-700 transition duration-300">
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
            <h2 className="text-3xl font-bold text-center mb-8">Key Features</h2>
            <AnimatedList>
              {[
                "Easy ad creation",
                "Multi-platform support",
                "AI-powered optimization",
                "Real-time analytics",
                "Automated A/B testing"
              ].map((feature, index) => (
                <div key={index} className="bg-gray-100 p-4 rounded-lg mb-4">
                  <h3 className="text-xl font-semibold mb-2">Feature {index + 1}</h3>
                  <p>{feature}</p>
                </div>
              ))}
            </AnimatedList>
          </div>
        </section>
      </div>
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
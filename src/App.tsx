import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Check,
  Calendar,
  Mail,
  Menu,
  X,
  Sparkles,
  Zap,
  TrendingUp,
  ArrowRight,
  Clock,
  Send,
  Volume2,
  VolumeX,
  Maximize2,
  Users,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

// Paths to our custom generated portfolio images
const localServiceAdImg = '/src/assets/images/local_service_ad_1782260012915.jpg';
const dtcBrandAdImg = '/src/assets/images/dtc_brand_ad_1782260024858.jpg';
const teamWorkshopImg = '/src/assets/images/team_workshop_1782260034948.jpg';
const laundryThumbnailImg = '/src/assets/images/laundry-thumbnail.png';
const wellnessThumbnailImg = '/src/assets/images/wellness-thumbnail.png';
const spiritsThumbnailImg = '/src/assets/images/spirits-thumbnail.png';

// Define navigation links for smooth scroll and active highlights
const NAV_ITEMS = [
  { label: 'Home', id: 'home' },
  { label: 'About', id: 'about' },
  { label: 'Services', id: 'services' },
  { label: 'Work', id: 'work' },
  { label: 'Process', id: 'process' },
  { label: 'Contact', id: 'contact' },
];

interface AttributeCard {
  title: string;
  description: string;
  icon: any;
}

interface ServiceCard {
  title: string;
  description: string;
  features: string[];
  ctaText: string;
  highlighted?: boolean;
  tag?: string;
}

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  image: string;
  clientType: string;
  duration: string;
  videoTitle: string;
  videoUrl: string;
}

interface StepItem {
  number: string;
  title: string;
  description: string;
}

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<PortfolioItem | null>(null);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [videoMuted, setVideoMuted] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);

  // Contact Form State
  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    email: '',
    service: '',
    budget: '',
    timeline: '',
    details: '',
    contactMethod: '',
    honeypot: '', // Hidden spam protection field
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Monitor scroll for sticky header styling and active section highlights
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const scrollPosition = window.scrollY + 120; // Offset for header height
      
      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(item.id);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Custom simulation timer for the interactive video modal playback progress bar
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeVideo && videoPlaying) {
      interval = setInterval(() => {
        setVideoProgress((prev) => {
          if (prev >= 100) {
            return 0; // Loop simulation
          }
          return prev + 1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [activeVideo, videoPlaying]);

  // Handle anchor clicks smoothly
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 80; // height of the sticky nav
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveSection(targetId);
      setIsMobileMenuOpen(false);
    }
  };

  // Contact Form Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    // Honeypot spam protection: If filled, fail silently or reject
    if (formData.honeypot !== '') {
      console.warn('Spam submission detected via honeypot.');
      setTimeout(() => {
        setIsSubmitting(false);
        setFormSubmitted(true);
      }, 500);
      return;
    }

    const accessKey = (import.meta as any).env?.VITE_WEB3FORMS_ACCESS_KEY;

    if (accessKey) {
      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            access_key: accessKey,
            subject: `New Lead from Illumivare: ${formData.fullName}`,
            from_name: 'Illumivare Contact Form',
            name: formData.fullName,
            email: formData.email,
            business_name: formData.businessName,
            service: formData.service,
            budget: formData.budget,
            timeline: formData.timeline,
            contact_method: formData.contactMethod,
            message: formData.details
          })
        });

        const data = await response.json();
        if (response.ok && data.success) {
          setIsSubmitting(false);
          setFormSubmitted(true);
          // Persist the query details locally for client-side evaluation/backup
          const savedInquiries = JSON.parse(localStorage.getItem('illumivare_inquiries') || '[]');
          savedInquiries.push({
            ...formData,
            date: new Date().toLocaleString(),
            id: Math.random().toString(36).substr(2, 9)
          });
          localStorage.setItem('illumivare_inquiries', JSON.stringify(savedInquiries));
          
          // Clear form except the submission state
          setFormData({
            fullName: '',
            businessName: '',
            email: '',
            service: '',
            budget: '',
            timeline: '',
            details: '',
            contactMethod: '',
            honeypot: '',
          });
        } else {
          throw new Error(data.message || 'Something went wrong submitting the form.');
        }
      } catch (err: any) {
        console.error('Error submitting form:', err);
        setSubmitError(err.message || 'Failed to send the email. Please try again or book a discovery call directly.');
        setIsSubmitting(false);
      }
    } else {
      // If no Web3Forms access key is set, we will fallback to simulating it,
      // but we will also show a helpful notification in console and save to local storage.
      console.info('Form submitted in simulation mode. To enable real email delivery directly to your inbox, define VITE_WEB3FORMS_ACCESS_KEY in your secrets/.env file.');
      setTimeout(() => {
        setIsSubmitting(false);
        setFormSubmitted(true);
        // Persist the query details locally for client-side evaluation
        const savedInquiries = JSON.parse(localStorage.getItem('illumivare_inquiries') || '[]');
        savedInquiries.push({
          ...formData,
          date: new Date().toLocaleString(),
          id: Math.random().toString(36).substr(2, 9)
        });
        localStorage.setItem('illumivare_inquiries', JSON.stringify(savedInquiries));
        
        // Clear form except the submission state
        setFormData({
          fullName: '',
          businessName: '',
          email: '',
          service: '',
          budget: '',
          timeline: '',
          details: '',
          contactMethod: '',
          honeypot: '',
        });
      }, 1200);
    }
  };

  // Data declarations
  const ATTRIBUTES: AttributeCard[] = [
    {
      title: 'AI-Powered Production',
      description: 'We use cutting-edge AI tools to produce professional video ads in days, not weeks — without the crew costs or production drama.',
      icon: Sparkles
    },
    {
      title: 'Strategy-First Approach',
      description: "Every piece of content we create is rooted in direct-response strategy. Pretty doesn't matter if it doesn't convert.",
      icon: TrendingUp
    },
    {
      title: 'Boutique & Dedicated',
      description: "You're not a ticket in our system. You get a real creative partner who learns your business and builds content that moves the needle.",
      icon: Zap
    }
  ];

  const SERVICES: ServiceCard[] = [
    {
      title: 'Your Ads. Our Execution. Zero Hassle.',
      description: 'We handle everything — strategy, scripting, AI production, editing, and delivery. You get professional video ads without lifting a finger.',
      features: [
        'Video ads for social, cable, and digital platforms',
        'Fast turnaround: 5-10 business days',
        'Multiple formats per ad',
        'Revision rounds included'
      ],
      ctaText: 'Book a Discovery Call'
    },
    {
      title: 'Train Your Team to Move Like an Agency',
      description: "We train your internal team to produce high-converting video content using AI tools — so you're never dependent on an outside agency again.",
      features: [
        'In-person, virtual, or async formats',
        'Custom curriculum for your team',
        'Hands-on production during sessions',
        'SOPs and templates included'
      ],
      ctaText: 'Book a Discovery Call',
      highlighted: true,
      tag: 'RECOMMENDED AI WORKSHOP'
    },
    {
      title: 'Growth Consulting',
      description: 'Need more than video? We help small businesses identify and implement the right digital tools to grow faster.',
      features: [
        'Custom scope based on your goals',
        'Strategic roadmap and implementation support',
        'Ongoing advisory available',
        "Let's talk about what you need"
      ],
      ctaText: 'Book a Discovery Call'
    }
  ];

  const PORTFOLIO_ITEMS: PortfolioItem[] = [
    {
      id: 'local-service',
      title: 'Local Service Ad — Laundry',
      category: 'Done-for-You Production',
      image: laundryThumbnailImg,
      clientType: 'Local Service Business',
      duration: '15 seconds ad spot',
      videoTitle: 'High-Converting Local HVAC/Service Ad Template Demo',
      videoUrl: 'https://www.youtube.com/watch?v=lcJRe5HA24A'
    },
    {
      id: 'dtc-brand',
      title: 'DTC Product Ad — Wellness',
      category: 'Done-for-You Production',
      image: wellnessThumbnailImg,
      clientType: 'Sleep Supplement Brand',
      duration: '30 seconds social hook ad',
      videoTitle: 'Premium Skincare Dynamic AI Cinematic Ad Mockup',
      videoUrl: 'https://www.youtube.com/shorts/pEkcPb-M1eI'
    },
    {
      id: 'team-workshop',
      title: 'DTC Product Ad — Beverage',
      category: 'Done-for-You Production',
      image: spiritsThumbnailImg,
      clientType: 'N/A Spirits Brand',
      duration: 'Workshop Masterclass Highlight Reel',
      videoTitle: 'AI Video Masterclass - Production & Scripting Live Output',
      videoUrl: 'https://www.youtube.com/watch?v=FROj4azBM6U'
    }
  ];

  const PROCESS_STEPS: StepItem[] = [
    {
      number: '01',
      title: 'Book a Free Call',
      description: "Tell us about your business. We'll tell you exactly how we can help — no pressure, no pitch."
    },
    {
      number: '02',
      title: 'Custom Proposal',
      description: 'You receive a tailored proposal within 48 hours — clear deliverables, transparent pricing, no surprises.'
    },
    {
      number: '03',
      title: 'We Get to Work',
      description: 'Production starts within 48 hours of your deposit. You get updates. We handle everything else.'
    },
    {
      number: '04',
      title: 'Deliver & Grow',
      description: "Final assets delivered with a deployment guide. We're here for what comes next."
    }
  ];

  const handleOpenVideo = (item: PortfolioItem) => {
    setActiveVideo(item);
    setVideoProgress(0);
    setVideoPlaying(true);
    setVideoMuted(true);
  };

  return (
    <div className="min-h-screen selection:bg-coral selection:text-white bg-white text-[#111212] overflow-x-hidden font-sans">
      
      {/* STICKY HEADER & NAVIGATION */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-[0_2px_10px_rgba(0,0,0,0.05)] border-gray-100 py-4'
            : 'bg-transparent border-transparent py-5 lg:py-6'
        }`}
        id="navbar-header"
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <a
            href="#home"
            onClick={(e) => handleAnchorClick(e, 'home')}
            className="text-2xl font-bold tracking-tight hover:opacity-90 transition-opacity font-display"
            id="brand-logo"
            aria-label="Illumivare Home"
          >
            {isScrolled ? (
              <>
                <span className="text-cobalt">Illumi</span>
                <span className="text-coral">vare</span>
              </>
            ) : (
              <span className="text-white">Illumivare</span>
            )}
          </a>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center space-x-8" aria-label="Main Navigation">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleAnchorClick(e, item.id)}
                className={`text-sm font-medium tracking-wide uppercase transition-colors duration-200 hover:text-coral ${
                  activeSection === item.id ? 'text-cobalt font-semibold' : 'text-charcoal/80'
                }`}
                id={`nav-link-${item.id}`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA Button */}
          <div className="hidden lg:block">
            <a
              href="#contact"
              onClick={(e) => handleAnchorClick(e, 'contact')}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-cobalt hover:bg-coral text-white text-sm font-bold tracking-wide uppercase shadow-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              id="header-cta-desktop"
            >
              Book a Discovery Call
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-charcoal focus:outline-none focus:ring-2 focus:ring-cobalt rounded-lg"
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle navigation menu"
            id="mobile-menu-toggle"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Panel */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-white border-t border-gray-100 shadow-xl overflow-hidden"
              id="mobile-nav-panel"
            >
              <div className="px-6 py-6 space-y-4 flex flex-col">
                {NAV_ITEMS.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => handleAnchorClick(e, item.id)}
                    className={`text-base font-medium uppercase tracking-wider py-2 border-b border-gray-50 hover:text-coral ${
                      activeSection === item.id ? 'text-cobalt font-bold' : 'text-charcoal/80'
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
                <div className="pt-4">
                  <a
                    href="#contact"
                    onClick={(e) => handleAnchorClick(e, 'contact')}
                    className="flex items-center justify-center w-full py-3.5 rounded-lg bg-cobalt hover:bg-coral text-white font-bold tracking-wider uppercase transition-colors"
                  >
                    Book a Discovery Call
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        {/* 1. HERO SECTION */}
        <section
          id="home"
          className="relative min-h-screen pt-32 pb-20 lg:pt-48 lg:pb-32 bg-gradient-to-br from-cobalt to-charcoal flex flex-col justify-center items-center text-center text-white px-6"
        >
          {/* Subtle light leak effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />

          <div className="max-w-4xl mx-auto z-10">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase bg-coral text-white mb-6">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 animate-pulse" /> BOUTIQUE AI CREATIVE AGENCY
              </span>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-display tracking-tight leading-[1.1] mb-6">
                AI-Powered Creative.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-coral via-[#fda085] to-coral">
                  Built for Small Business.
                </span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg sm:text-xl lg:text-2xl text-gray-200 font-normal leading-relaxed max-w-2xl mx-auto mb-10"
            >
              We help small businesses grow through AI-powered creative — video ads, digital tools, and the strategy to make it all work.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <a
                href="#contact"
                onClick={(e) => handleAnchorClick(e, 'contact')}
                className="group relative inline-flex items-center justify-center px-8 py-4 sm:px-10 sm:py-5 rounded-xl bg-cobalt text-white font-bold tracking-wider uppercase shadow-xl transition-all duration-300 hover:bg-coral hover:scale-105 active:scale-98 overflow-hidden"
                id="hero-cta-main"
              >
                <span className="relative z-10 flex items-center">
                  Book a Discovery Call
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1.5" />
                </span>
                {/* Visual glow overlay */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </a>
            </motion.div>
          </div>

          {/* Clean, structural wave separator */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-white" style={{ clipPath: 'polygon(100% 100%, 0% 100%, 100% 0)' }}></div>
        </section>


        {/* 2. ABOUT SECTION */}
        <section id="about" className="py-24 bg-white text-charcoal px-6 relative">
          <div className="max-w-7xl mx-auto">
            
            {/* Top Header layout */}
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-20">
              <div className="lg:col-span-5">
                <span className="text-xs font-bold tracking-widest uppercase text-cobalt block mb-2">ABOUT US</span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight leading-none">
                  We're Not a<br />Typical Agency
                </h2>
              </div>
              <div className="lg:col-span-7 lg:pt-5">
                <p className="text-lg sm:text-xl text-gray-700 leading-relaxed max-w-3xl">
                  Most small businesses can't afford agency-level creative. We built Illumivare to change that. Through AI-powered video production and hands-on creative training, we deliver the kind of content that used to require a full agency — in days, not months, and without the price tag.
                </p>
              </div>
            </div>

            {/* Attributes Cards Grid */}
            <div className="grid md:grid-cols-3 gap-8">
              {ATTRIBUTES.map((card, idx) => {
                const IconComponent = card.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.6, delay: idx * 0.15 }}
                    className="group flex flex-col p-8 rounded-xl bg-white border border-gray-100 shadow-[0_4px_6px_rgba(0,0,0,0.02)] hover:border-cobalt/40 hover:bg-white hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                    id={`attribute-card-${idx}`}
                  >
                    {/* Visual decoration */}
                    <div className="absolute -right-8 -top-8 w-24 h-24 bg-cobalt/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
                    
                    <div className="w-12 h-12 rounded-xl bg-cobalt/10 text-cobalt flex items-center justify-center mb-6 group-hover:bg-cobalt group-hover:text-white transition-colors duration-300">
                      <IconComponent className="w-6 h-6" />
                    </div>

                    <h3 className="text-xl font-bold font-display tracking-tight mb-4 text-charcoal">
                      {card.title}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {card.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>

          </div>
        </section>


        {/* 3. SERVICES SECTION */}
        <section id="services" className="py-24 bg-gray-50 text-charcoal px-6 border-y border-gray-100">
          <div className="max-w-7xl mx-auto">
            
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold tracking-widest uppercase text-cobalt block mb-2">SERVICES</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight mb-4">
                How We Work With You
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Choose the path that fits your business — from full-service production to team training and strategic consulting.
              </p>
            </div>

            {/* Services Grid */}
            <div className="grid lg:grid-cols-3 gap-8 items-stretch">
              {SERVICES.map((service, idx) => {
                const isHighlight = service.highlighted;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                    className={`flex flex-col p-8 sm:p-10 rounded-xl transition-all duration-300 relative ${
                      isHighlight
                        ? 'bg-white border-2 border-coral shadow-xl lg:-translate-y-4 scale-100 lg:scale-[1.02] z-10'
                        : 'bg-white border border-gray-100 hover:border-gray-200 shadow-[0_4px_6px_rgba(0,0,0,0.02)] hover:shadow-lg'
                    }`}
                    id={`service-card-${idx}`}
                  >
                    {isHighlight && (
                      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-md text-[9px] font-bold tracking-[1.5px] uppercase bg-coral text-white whitespace-nowrap shadow-sm">
                        {service.tag}
                      </span>
                    )}

                    <h3 className="text-2xl font-bold font-display tracking-tight leading-tight mb-4 text-charcoal min-h-[64px] flex items-center">
                      {service.title}
                    </h3>

                    <p className="text-gray-600 text-sm leading-relaxed mb-8">
                      {service.description}
                    </p>

                    <div className="border-t border-gray-100 pt-6 mb-8 flex-grow">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-cobalt mb-4">What's Included:</h4>
                      <ul className="space-y-3.5">
                        {service.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start space-x-3 text-sm text-gray-700">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mt-0.5">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <a
                      href="#contact"
                      onClick={(e) => handleAnchorClick(e, 'contact')}
                      className={`flex items-center justify-center w-full py-4 rounded-xl text-sm font-bold uppercase tracking-wider shadow-sm transition-all duration-300 ${
                        isHighlight
                          ? 'bg-coral hover:bg-cobalt text-white hover:scale-105'
                          : 'bg-cobalt hover:bg-coral text-white hover:scale-105'
                      } active:scale-95`}
                    >
                      {service.ctaText}
                    </a>
                  </motion.div>
                );
              })}
            </div>

          </div>
        </section>


        {/* 4. PORTFOLIO / SAMPLE WORK SECTION */}
        <section id="work" className="py-24 bg-white text-charcoal px-6">
          <div className="max-w-7xl mx-auto">
            
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold tracking-widest uppercase text-cobalt block mb-2">PORTFOLIO</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight mb-4">
                From Brief to Broadcast in 72 Hours
              </h2>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
                No crews. No chaos. Just high-converting ads.
              </p>
            </div>

            {/* Video Placeholder Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {PORTFOLIO_ITEMS.map((item, idx) => (
                <motion.a
                  key={item.id}
                  href={item.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: idx * 0.15 }}
                  className="group flex flex-col rounded-xl bg-white border border-gray-100 overflow-hidden shadow-[0_4px_6px_rgba(0,0,0,0.02)] hover:shadow-xl transition-all duration-300 cursor-pointer"
                  id={`portfolio-item-${item.id}`}
                  aria-label={`Open video for ${item.title} in a new tab`}
                >
                  {/* Thumbnail container */}
                  <div className="relative aspect-video w-full bg-gray-200 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src.includes('maxresdefault.jpg')) {
                          target.src = target.src.replace('maxresdefault.jpg', 'hqdefault.jpg');
                        }
                      }}
                    />
                    
                    {/* Dark gradient mask */}
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                    {/* Centered play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white text-cobalt shadow-lg flex items-center justify-center transition-all duration-300 group-hover:bg-coral group-hover:text-white group-hover:scale-110 active:scale-95">
                        <Play className="w-7 h-7 fill-current ml-1" />
                      </div>
                    </div>
                  </div>

                  {/* Metadata details */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-[9px] font-bold text-cobalt tracking-[1.5px] uppercase bg-cobalt/5 px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs font-semibold text-gray-500 font-mono tracking-wider">
                        {item.clientType}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold font-display tracking-tight text-charcoal group-hover:text-cobalt transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 text-xs mt-3 flex items-center">
                      <Play className="w-3.5 h-3.5 mr-1.5 text-coral fill-current" /> Watch Video on YouTube
                    </p>
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Central CTA to contact */}
            <div className="text-center">
              <a
                href="#contact"
                onClick={(e) => handleAnchorClick(e, 'contact')}
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-cobalt hover:bg-coral text-white font-bold tracking-wide uppercase shadow-md transition-all duration-300 hover:scale-[1.03]"
                id="portfolio-cta"
              >
                Book a Discovery Call
              </a>
            </div>

          </div>
        </section>


        {/* 5. PROCESS SECTION */}
        <section id="process" className="py-24 bg-gray-50 text-charcoal px-6 border-y border-gray-100">
          <div className="max-w-7xl mx-auto">
            
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="text-xs font-bold tracking-widest uppercase text-cobalt block mb-2">PROCESS</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight mb-4">
                How It Works
              </h2>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
                Simple, fast, and built around your business.
              </p>
            </div>

            {/* Steps Container */}
            <div className="relative">
              {/* Horizontal Connecting Line on desktop */}
              <div className="hidden lg:block absolute top-[44px] left-[10%] right-[10%] h-0.5 bg-gray-200 -z-0" />

              <div className="grid lg:grid-cols-4 gap-8 relative z-10">
                {PROCESS_STEPS.map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.5, delay: idx * 0.15 }}
                    className="flex flex-col items-center lg:items-start text-center lg:text-left bg-white p-8 rounded-xl border border-gray-100 shadow-[0_4px_6px_rgba(0,0,0,0.02)] hover:shadow-lg transition-shadow duration-300 relative"
                    id={`process-step-${idx}`}
                  >
                    {/* Large Step Number */}
                    <div className="text-4xl sm:text-5xl font-extrabold font-display text-cobalt tracking-tight mb-4">
                      {step.number}
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold font-display tracking-tight mb-3 text-charcoal">
                      {step.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </section>


        {/* 6. CONTACT SECTION */}
        <section id="contact" className="py-24 bg-white text-charcoal px-6 relative">
          <div className="max-w-7xl mx-auto">
            
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold tracking-widest uppercase text-cobalt block mb-2">GET IN TOUCH</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight mb-4">
                Ready for More Customers with Less Work?
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Not sure which service is right for you? That's what the discovery call is for.
              </p>
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              
              {/* LEFT COLUMN: Calendar Call Booking */}
              <div className="lg:col-span-5 bg-white border border-gray-100 p-8 sm:p-10 rounded-xl shadow-[0_4px_6px_rgba(0,0,0,0.02)]">
                <span className="text-xs font-bold text-coral uppercase tracking-widest block mb-1">OPTION 1</span>
                <h3 className="text-2xl sm:text-3xl font-bold font-display text-charcoal mb-4">
                  Book a Call
                </h3>
                <p className="text-gray-600 leading-relaxed text-base mb-8">
                  Prefer to talk first? Grab a free 30-minute discovery call directly on our calendar. We'll learn about your brand and outline an action plan.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3 text-sm text-gray-700">
                    <Clock className="w-5 h-5 text-cobalt" />
                    <span>30 Minutes Discovery Session</span>
                  </div>
                  <div className="flex items-start space-x-3 text-sm text-gray-700">
                    <Calendar className="w-5 h-5 text-cobalt mt-0.5" />
                    <span>Choose a convenient date & time instantly</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-700">
                    <Mail className="w-5 h-5 text-cobalt" />
                    <span>hello@illumivare.com</span>
                  </div>
                </div>

                <a
                  href="https://calendar.google.com/appointments/schedules/AcZssZ3NwgEQmpcSZqR00c6hyp3_hBzyJXhGRW0Kni4CoBEOwdcM_D7nwQ8N5SQ65iKQj8Z9nBlAb_5F"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full py-4 px-6 rounded-xl bg-cobalt hover:bg-coral text-white font-bold uppercase tracking-wider shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-98"
                  id="calendar-booking-btn"
                >
                  Book a Discovery Call
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </div>

              {/* RIGHT COLUMN: Contact Form */}
              <div className="lg:col-span-7 bg-white border border-gray-100 p-8 sm:p-10 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
                <span className="text-xs font-bold text-cobalt uppercase tracking-widest block mb-1">OPTION 2</span>
                <h3 className="text-2xl sm:text-3xl font-bold font-display text-charcoal mb-6">
                  Send a Message
                </h3>

                <AnimatePresence mode="wait">
                  {formSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-emerald-50 border border-emerald-200 p-8 rounded-xl text-center flex flex-col items-center"
                      id="form-success-container"
                    >
                      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                        <Check className="w-8 h-8" />
                      </div>
                      <h4 className="text-xl font-bold text-emerald-900 font-display mb-2">Message Sent Successfully</h4>
                      <p className="text-emerald-700 leading-relaxed text-sm mb-6 max-w-sm">
                        Thanks! We'll be in touch within 24 hours.
                      </p>
                      <button
                        onClick={() => setFormSubmitted(false)}
                        className="text-xs font-bold text-cobalt hover:text-coral uppercase tracking-wider transition-colors"
                      >
                        Send another message
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleFormSubmit} className="space-y-6" id="contact-form">
                      
                      {/* Honeypot field (hidden spam protection) */}
                      <div className="hidden" aria-hidden="true">
                        <label htmlFor="honeypot">Leave this field empty</label>
                        <input
                          type="text"
                          name="honeypot"
                          id="honeypot"
                          value={formData.honeypot}
                          onChange={handleInputChange}
                          tabIndex={-1}
                        />
                      </div>

                      {/* Name & Business Name fields */}
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="flex flex-col space-y-1.5">
                          <label htmlFor="fullName" className="text-xs font-bold uppercase tracking-wider text-charcoal">
                            Full Name <span className="text-coral">*</span>
                          </label>
                          <input
                            type="text"
                            name="fullName"
                            id="fullName"
                            required
                            placeholder="Krista Purnell"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-transparent text-sm transition-all"
                          />
                        </div>

                        <div className="flex flex-col space-y-1.5">
                          <label htmlFor="businessName" className="text-xs font-bold uppercase tracking-wider text-charcoal">
                            Business Name <span className="text-coral">*</span>
                          </label>
                          <input
                            type="text"
                            name="businessName"
                            id="businessName"
                            required
                            placeholder="My Skincare Inc."
                            value={formData.businessName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-transparent text-sm transition-all"
                          />
                        </div>
                      </div>

                      {/* Email field */}
                      <div className="flex flex-col space-y-1.5">
                        <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-charcoal">
                          Email Address <span className="text-coral">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          required
                          placeholder="you@company.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-transparent text-sm transition-all"
                        />
                      </div>

                      {/* Dropdowns fields */}
                      <div className="grid sm:grid-cols-3 gap-4">
                        
                        <div className="flex flex-col space-y-1.5">
                          <label htmlFor="service" className="text-xs font-bold uppercase tracking-wider text-charcoal">
                            Select a Service <span className="text-coral">*</span>
                          </label>
                          <select
                            name="service"
                            id="service"
                            required
                            value={formData.service}
                            onChange={handleInputChange}
                            className="w-full px-3 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-transparent text-xs sm:text-sm bg-white transition-all"
                          >
                            <option value="">Choose Service...</option>
                            <option value="Done-for-You Production">Done-for-You Production</option>
                            <option value="AI Training Workshop">AI Training Workshop</option>
                            <option value="Growth Consulting">Growth Consulting</option>
                            <option value="Not Sure Yet">Not Sure Yet</option>
                          </select>
                        </div>

                        <div className="flex flex-col space-y-1.5">
                          <label htmlFor="budget" className="text-xs font-bold uppercase tracking-wider text-charcoal">
                            Budget Range <span className="text-coral">*</span>
                          </label>
                          <select
                            name="budget"
                            id="budget"
                            required
                            value={formData.budget}
                            onChange={handleInputChange}
                            className="w-full px-3 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-transparent text-xs sm:text-sm bg-white transition-all"
                          >
                            <option value="">Choose Budget...</option>
                            <option value="Under $500">Under $500</option>
                            <option value="$500-$1,000">$500-$1,000</option>
                            <option value="$1,000-$2,500">$1,000-$2,500</option>
                            <option value="$2,500+">$2,500+</option>
                          </select>
                        </div>

                        <div className="flex flex-col space-y-1.5">
                          <label htmlFor="timeline" className="text-xs font-bold uppercase tracking-wider text-charcoal">
                            Timeline <span className="text-coral">*</span>
                          </label>
                          <select
                            name="timeline"
                            id="timeline"
                            required
                            value={formData.timeline}
                            onChange={handleInputChange}
                            className="w-full px-3 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-transparent text-xs sm:text-sm bg-white transition-all"
                          >
                            <option value="">Choose Timeline...</option>
                            <option value="ASAP">ASAP</option>
                            <option value="Within 2 Weeks">Within 2 Weeks</option>
                            <option value="Within 30 Days">Within 30 Days</option>
                            <option value="Beyond 30 Days">Beyond 30 Days</option>
                          </select>
                        </div>

                      </div>

                      {/* Project Details */}
                      <div className="flex flex-col space-y-1.5">
                        <label htmlFor="details" className="text-xs font-bold uppercase tracking-wider text-charcoal">
                          Project Details <span className="text-coral">*</span>
                        </label>
                        <textarea
                          name="details"
                          id="details"
                          required
                          rows={4}
                          placeholder="Tell us about your brand, what you need, or what goals you want to achieve..."
                          value={formData.details}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-transparent text-sm transition-all resize-none"
                        />
                      </div>

                      {/* Best Way to Contact (Radio group) */}
                      <div className="flex flex-col space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-charcoal">
                          Best Way to Contact <span className="text-coral">*</span>
                        </span>
                        <div className="flex flex-wrap gap-4 sm:gap-6 pt-1">
                          {[
                            { value: 'Email', label: 'Email' },
                            { value: 'Phone or Text', label: 'Phone or Text' },
                            { value: 'Video Call', label: 'Video Call' }
                          ].map((option) => (
                            <label
                              key={option.value}
                              className="flex items-center space-x-2.5 text-sm font-medium text-gray-700 cursor-pointer"
                            >
                              <input
                                type="radio"
                                name="contactMethod"
                                required
                                value={option.value}
                                checked={formData.contactMethod === option.value}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-cobalt focus:ring-cobalt border-gray-300"
                              />
                              <span>{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Error message if submission fails */}
                      {submitError && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm leading-relaxed" id="form-error-display">
                          {submitError}
                        </div>
                      )}

                      {/* Submit button */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full inline-flex items-center justify-center py-4 px-6 rounded-xl bg-cobalt hover:bg-coral text-white font-bold tracking-wider uppercase transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] shadow-md"
                          id="submit-contact-form-btn"
                        >
                          {isSubmitting ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Sending Message...
                            </span>
                          ) : (
                            <span className="flex items-center">
                              Send Message
                              <Send className="w-4 h-4 ml-2" />
                            </span>
                          )}
                        </button>
                      </div>

                    </form>
                  )}
                </AnimatePresence>
              </div>

            </div>

          </div>
        </section>
      </main>

      {/* 7. FOOTER */}
      <footer className="bg-charcoal text-white pt-16 pb-12 px-6 border-t border-white/5" aria-label="Footer Area">
        <div className="max-w-7xl mx-auto">
          
          {/* Top row */}
          <div className="grid md:grid-cols-12 gap-8 pb-12 border-b border-white/10">
            <div className="md:col-span-5 space-y-4">
              <a
                href="#home"
                onClick={(e) => handleAnchorClick(e, 'home')}
                className="text-3xl font-bold tracking-tight text-white hover:opacity-95 font-display"
              >
                <span className="text-cobalt">Illumi</span><span className="text-coral">vare</span>
              </a>
              <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
                AI-Powered Creative for Small Business. High-impact video production and direct-response digital marketing strategies.
              </p>
            </div>

            <div className="md:col-span-7 grid sm:grid-cols-2 gap-8">
              {/* Navigation Links */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-coral mb-4">Navigation</h4>
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
                  {NAV_ITEMS.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={(e) => handleAnchorClick(e, item.id)}
                      className="text-sm text-gray-400 hover:text-coral transition-colors py-0.5"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-coral mb-4">Contact</h4>
                <div className="space-y-2.5">
                  <a
                    href="mailto:hello@illumivare.com"
                    className="inline-flex items-center text-sm text-gray-400 hover:text-coral transition-colors py-0.5"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    hello@illumivare.com
                  </a>
                  <p className="text-xs text-gray-500 leading-relaxed pt-2">
                    Have questions? Submit the quick contact form or book directly on our calendar.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-center sm:text-left gap-4 text-xs text-gray-500">
            <p>© 2025 Illumivare. All rights reserved.</p>
            <div>
              <span>Boutique Creative Agency</span>
            </div>
          </div>

        </div>
      </footer>

      {/* INTERACTIVE VIDEO PLAYBACK SIMULATION LIGHTBOX / MODAL */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-charcoal/95 flex items-center justify-center p-4 sm:p-6 md:p-8"
            id="video-modal-overlay"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl bg-[#1c1d1e] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
              id="video-modal-content"
            >
              
              {/* Header inside modal */}
              <div className="px-6 py-4 bg-charcoal border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-coral animate-ping" />
                  <h4 className="text-sm font-bold text-white tracking-wide font-display">
                    {activeVideo.category} Demo Playback
                  </h4>
                </div>
                <button
                  onClick={() => setActiveVideo(null)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
                  aria-label="Close demo preview"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Main Simulated Video viewport */}
              <div className="relative aspect-video w-full bg-black">
                
                {/* Generated portfolio image backdrop */}
                <img
                  src={activeVideo.image}
                  alt={activeVideo.title}
                  className="w-full h-full object-cover select-none"
                  referrerPolicy="no-referrer"
                />

                {/* Dark vignette styling */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

                {/* Animated Audio Spectrum Bars overlay */}
                {videoPlaying && (
                  <div className="absolute bottom-6 left-6 flex items-end space-x-1 h-8 px-2 bg-black/40 backdrop-blur-sm rounded-md py-1.5 pointer-events-none" id="audio-visualizer-demo">
                    {[1, 2, 3, 4, 5, 6, 7].map((bar) => (
                      <motion.div
                        key={bar}
                        className="w-1 bg-coral"
                        animate={{
                          height: videoMuted ? '4px' : ['6px', '24px', '10px', '28px', '8px', '18px', '6px'],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8 + bar * 0.1,
                          ease: 'easeInOut',
                        }}
                      />
                    ))}
                    <span className="text-[9px] font-mono font-bold text-white uppercase tracking-wider pl-1.5 select-none">
                      {videoMuted ? 'MUTED' : 'LIVE SPECTRUM'}
                    </span>
                  </div>
                )}

                {/* Big Center play/pause overlay click option */}
                <div
                  className="absolute inset-0 flex items-center justify-center cursor-pointer"
                  onClick={() => setVideoPlaying(!videoPlaying)}
                >
                  <AnimatePresence>
                    {!videoPlaying && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="w-20 h-20 rounded-full bg-coral/90 text-white shadow-xl flex items-center justify-center"
                      >
                        <Play className="w-9 h-9 fill-current ml-1" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Custom Watermark indicator of AI creation */}
                <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-sm rounded text-[10px] font-mono tracking-widest text-gray-300 border border-white/5 select-none">
                  AI-SYNTHESIZED • RENDERED
                </div>

              </div>

              {/* Bottom Video Controls Simulator */}
              <div className="p-6 bg-charcoal text-white">
                
                {/* Title */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold font-display text-white">{activeVideo.videoTitle}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Format: <span className="text-coral font-bold">{activeVideo.category}</span> ({activeVideo.duration})
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div
                    className="relative w-full h-1 bg-white/20 rounded-full cursor-pointer overflow-hidden"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const percentage = Math.round((x / rect.width) * 100);
                      setVideoProgress(percentage);
                    }}
                  >
                    <div
                      className="absolute left-0 top-0 h-full bg-coral transition-all duration-100 ease-out"
                      style={{ width: `${videoProgress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
                    <span>0:0{Math.floor((videoProgress / 100) * 15)}</span>
                    <span>0:15</span>
                  </div>
                </div>

                {/* Control Action Buttons Row */}
                <div className="flex flex-wrap items-center justify-between mt-6 pt-4 border-t border-white/5 gap-4">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setVideoPlaying(!videoPlaying)}
                      className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 text-xs font-bold uppercase tracking-wider transition-colors"
                      id="video-play-pause-btn"
                    >
                      {videoPlaying ? 'Pause Video' : 'Play Video'}
                    </button>
                    <button
                      onClick={() => setVideoMuted(!videoMuted)}
                      className="p-2 rounded hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                      title={videoMuted ? 'Unmute Audio Simulation' : 'Mute Audio Simulation'}
                      id="video-mute-toggle-btn"
                    >
                      {videoMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                  </div>

                  <a
                    href="#contact"
                    onClick={(e) => {
                      setActiveVideo(null);
                      handleAnchorClick(e, 'contact');
                    }}
                    className="px-5 py-2 rounded-lg bg-cobalt hover:bg-coral text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center"
                    id="video-cta-inner"
                  >
                    Discuss This Format
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </a>
                </div>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

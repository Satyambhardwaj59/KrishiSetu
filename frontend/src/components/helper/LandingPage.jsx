// 'use client';
// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { 
//   Leaf, Sprout, Briefcase, ShieldCheck, 
//   TrendingUp, Smartphone, Globe,
//   ArrowRight, HeartHandshake, Zap, BarChart3
// } from 'lucide-react';

// import Button from '@/components/ui/Button';
// import FaqSection from '@/components/helper/FaqSection';

// const FaqDetails = {
//   description: "Everything you need to know about navigating the KrishiSetu marketplace.",
//  faqs : [
//   { question: "What is KrishiSetu?", answer: "KrishiSetu is India's leading agricultural platform that connects farmers directly with institutional buyers, offering a transparent, efficient, and technology-driven supply chain." },
//   { question: "How does KrishiSetu benefit farmers?", answer: "We empower farmers by providing direct market linkage, eliminating middlemen, ensuring fair pricing, and offering escrow-protected fast payments for their harvest." },
//   { question: "What kind of buyers can purchase on KrishiSetu?", answer: "Wholesalers, retailers, food processors, and institutional buyers can effortlessly procure high-quality, graded agricultural produce in bulk directly from verified farmers." },
//   { question: "Is it free to register as a farmer?", answer: "Yes! Registration for farmers is absolutely free. You only pay a minimal platform fee when your produce is successfully sold and payment is secured." },
//   { question: "How is the quality of the produce ensured?", answer: "We maintain strict grading standards. Farmers provide detailed quality parameters and images, and our on-ground team often verifies the produce before dispatch to ensure trust." },
//   { question: "What are the payment options available?", answer: "We support seamless digital transactions including NEFT, RTGS, UPI, and net banking. All payments are securely routed through our Escrow system." },
//   { question: "How does the logistics and delivery work?", answer: "Buyers can arrange their own transport or opt for KrishiSetu's partnered logistics network for end-to-end tracking and hassle-free delivery from farm to warehouse." },
//   { question: "Does KrishiSetu provide crop advisory services?", answer: "While our primary focus is market linkage, we are actively integrating AI-driven crop advisory and weather alerts to help farmers maximize their yield." },
//   { question: "Is my personal and financial information secure?", answer: "Absolutely. We employ bank-grade encryption and stringent data privacy measures to ensure your information and transactions are 100% secure." },
//   { question: "How can I contact KrishiSetu customer support?", answer: "You can reach out to our dedicated support team 24/7 via the toll-free number or email provided in the Contact section below." }
// ]
// }

// const carouselImages = [
//   "/farm_hero_background.png", // General farm / fields
//   "/hero_cereals.png",         // Cereals
//   "/hero_pulses.png",          // Pulses
//   "/hero_oilseeds.png",        // Oilseeds
//   "/hero_vegetables.png",      // Vegetables
//   "/hero_fruits.png",          // Fruits
//   "/hero_spices.png",          // Spices
//   "/rice.jpg",              // Rice
//   "/cotton.png", // Cotton
//   "/sugarcane.png", // Sugarcane
//   "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80", // Farmers
//   "/Agriculture_Industry.png",  // Agriculture Industry,
//   "smart_farm.jpg", // Smart Farming

// ];

// export default function LandingPage() {

//   const [currentSlide, setCurrentSlide] = useState(0);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
//     }, 3000);
//     return () => clearInterval(timer);
//   }, []);



//   return (
//     <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-green-500/30">
//       {/* Navbar */}
//       <nav className="fixed top-0 w-full glass z-50 px-6 py-4 flex justify-between items-center border-b border-slate-700/50">
//         <div className="flex items-center gap-2">
//           <Leaf className="text-green-500" size={28} />
//           <span className="text-2xl font-bold tracking-tight">Krishi<span className="text-green-400">Setu</span></span>
//         </div>
//         <div className="flex gap-4">
//           <Link href="/login">
//             <Button variant="outline" className="hidden sm:flex">Login</Button>
//           </Link>
//           <Link href="/register">
//             <Button variant="primary">Join Now</Button>
//           </Link>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <section className="relative min-h-screen flex text-center lg:text-left items-center pt-24 pb-16 px-6 overflow-hidden">
//         {/* Background Image Carousel & Overlays */}
//         <div className="absolute inset-0 z-0 bg-slate-950">
//           {carouselImages.map((src, idx) => (
//              <img 
//                key={idx}
//                src={src} 
//                alt={`Agriculture visual ${idx + 1}`} 
//                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}
//              />
//           ))}
//           <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"></div>
//           <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
//         </div>

//         <div className="max-w-7xl mx-auto w-full relative z-10 grid lg:grid-cols-2 gap-12 items-center">
//           <div className="space-y-8">
//             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold backdrop-blur-md">
//               <Sprout size={16} /> Connecting Indian Agriculture
//             </div>
//             <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-xl">
//               Connecting <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Farms</span> to <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Business</span>
//             </h1>
//             <p className="text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 drop-shadow-md">
//               KrishiSetu relies on technology to provide end to end agricultural services. Sell your harvest directly to prominent institutional buyers without middlemen. Fair prices, instant payments.
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
//               <Link href="/register?role=farmer">
//                 <Button size="xl" className="w-full sm:w-auto text-lg hover:scale-105 transition-transform bg-green-500 hover:bg-green-600 border-none text-white shadow-lg shadow-green-500/25">
//                   Start Selling <ArrowRight size={18} className="ml-2" />
//                 </Button>
//               </Link>
//               <Link href="/register?role=buyer">
//                 <Button size="xl" className="w-full sm:w-auto text-lg hover:scale-105 transition-transform bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white">
//                   Procure Produce
//                 </Button>
//               </Link>
//             </div>
//             <div className="flex items-center justify-center lg:justify-start gap-8 pt-4">
//               <div className="text-center lg:text-left">
//                 <h4 className="text-3xl font-bold text-white">100k+</h4>
//                 <p className="text-sm text-slate-400">Farmers Connected</p>
//               </div>
//               <div className="w-px h-12 bg-slate-700"></div>
//               <div className="text-center lg:text-left">
//                 <h4 className="text-3xl font-bold text-white">5k+</h4>
//                 <p className="text-sm text-slate-400">Verified Buyers</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Services/Features Section (DeHaat Reference) */}
//       <section className="py-24 bg-slate-950 px-6 relative">
//         <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center max-w-3xl mx-auto mb-16">
//             <h2 className="text-3xl lg:text-4xl font-bold mb-4">Complete Agricultural Ecosystem</h2>
//             <p className="text-slate-400 text-lg">We digitize the entire agricultural value chain to bring efficiency, transparency, and profitability to the grassroots level.</p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//             <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 shadow-xl group">
//               <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
//                 <TrendingUp size={28} />
//               </div>
//               <h3 className="text-xl font-bold mb-3 text-white">Output Linkage</h3>
//               <p className="text-slate-400">Directly connect with commercial buyers, ensuring better realization for your harvest without multiple intermediaries.</p>
//             </div>

//             <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 shadow-xl group">
//               <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
//                 <ShieldCheck size={28} />
//               </div>
//               <h3 className="text-xl font-bold mb-3 text-white">Secure Escrow</h3>
//               <p className="text-slate-400">Our robust digital payment infrastructure ensures farmers get paid swiftly and securely once the quality is verified.</p>
//             </div>

//             <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 shadow-xl group">
//               <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
//                 <Briefcase size={28} />
//               </div>
//               <h3 className="text-xl font-bold mb-3 text-white">Institutional Procurement</h3>
//               <p className="text-slate-400">Businesses enjoy hassle-free procurement with assured quality grading, bulk availability, and seamless supply chain logistics.</p>
//             </div>

//             <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 shadow-xl group">
//               <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
//                 <Smartphone size={28} />
//               </div>
//               <h3 className="text-xl font-bold mb-3 text-white">Agri-Advisory</h3>
//               <p className="text-slate-400">Get data-driven insights tailored to your farm to improve crop yield and decrease input costs.</p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* How it works */}
//       <section className="py-24 bg-slate-900 px-6">
//         <div className="max-w-7xl mx-auto">
//           <div className="grid lg:grid-cols-2 gap-16 items-center">
//             <div>
//               <h2 className="text-3xl lg:text-4xl font-bold mb-6">How KrishiSetu <span className="text-green-400">Transforms</span> Agri-Trade</h2>
//               <p className="text-slate-400 text-lg mb-12">Whether you are a farmer looking to maximize profits or a buyer seeking consistent supply, our platform simplifies the journey.</p>

//               <div className="space-y-8">
//                 <div className="flex gap-4">
//                   <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-bold text-xl">1</div>
//                   <div>
//                     <h4 className="text-xl font-bold text-white mb-2">Register & Verify</h4>
//                     <p className="text-slate-400">Create your profile using just a phone number. Complete our fast digital KYC for ultimate platform trust.</p>
//                   </div>
//                 </div>
//                 <div className="flex gap-4">
//                   <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-bold text-xl">2</div>
//                   <div>
//                     <h4 className="text-xl font-bold text-white mb-2">List or Discover Produce</h4>
//                     <p className="text-slate-400">Farmers upload rich details of their harvest. Buyers browse categorized, quality-graded agricultural commodities.</p>
//                   </div>
//                 </div>
//                 <div className="flex gap-4">
//                   <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-bold text-xl">3</div>
//                   <div>
//                     <h4 className="text-xl font-bold text-white mb-2">Trade & Grow</h4>
//                     <p className="text-slate-400">Finalize deals directly on the platform. Utilize our logistics dashboard and enjoy secure digital settlements.</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//                <div className="space-y-4 pt-12">
//                  <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-lg text-center">
//                    <HeartHandshake className="mx-auto text-amber-400 mb-4" size={40} />
//                    <h5 className="font-bold text-white">Trust & Transparency</h5>
//                  </div>
//                  <div className="bg-gradient-to-br from-green-500 to-emerald-700 p-6 rounded-3xl shadow-lg text-center text-white">
//                    <BarChart3 className="mx-auto text-white mb-4" size={40} />
//                    <h5 className="font-bold">Better Margins</h5>
//                  </div>
//                </div>
//                <div className="space-y-4">
//                  <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-lg text-center">
//                    <Zap className="mx-auto text-blue-400 mb-4" size={40} />
//                    <h5 className="font-bold text-white">Lightning Fast</h5>
//                  </div>
//                  <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-lg text-center">
//                    <Globe className="mx-auto text-purple-400 mb-4" size={40} />
//                    <h5 className="font-bold text-white">Nationwide Reach</h5>
//                  </div>
//                </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* FAQ Section */}
//       <FaqSection FaqDetails={FaqDetails} />

//       {/* CTA Section */}
//       <section className="py-24 px-6">
//         <div className="max-w-5xl mx-auto bg-gradient-to-r from-green-600 to-emerald-900 rounded-[3rem] p-12 lg:p-20 text-center shadow-2xl relative overflow-hidden">
//            <div className="absolute top-0 right-0 -mt-10 -mr-10 text-white/5">
//              <Leaf size={300} />
//            </div>
//            <div className="relative z-10">
//               <h2 className="text-3xl lg:text-5xl font-extrabold text-white mb-6">Ready to revolutionize your agriculture business?</h2>
//               <p className="text-green-100 text-lg lg:text-xl max-w-2xl mx-auto mb-10">Join thousands of farmers and buyers already experiencing transparent pricing and secure trade.</p>
//               <Link href="/register">
//                 {/* <Button size="xl" variant='amber' className="font-bold text-lg px-10 bg-white text-green-700 hover:bg-slate-100 border-none shadow-xl">Get Started Today</Button> */}
//                 <Button size="xl" variant='white' >Get Started Today</Button>
//               </Link>
//            </div>
//         </div>
//       </section>


//     </div>
//   );
// }








'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Critical for SEO image optimization
import {
  Leaf, Sprout, Briefcase, ShieldCheck,
  TrendingUp, Smartphone, Globe,
  ArrowRight, HeartHandshake, Zap, BarChart3
} from 'lucide-react';

import Button from '@/components/ui/Button';
import FaqSection from '@/components/helper/FaqSection';

const FaqDetails = {
  description: "Everything you need to know about navigating the KrishiSetu marketplace.",
  faqs: [
    { question: "What is KrishiSetu?", answer: "KrishiSetu is India's leading agricultural platform that connects farmers directly with institutional buyers, offering a transparent, efficient, and technology-driven supply chain." },
    { question: "How does KrishiSetu benefit farmers?", answer: "We empower farmers by providing direct market linkage, eliminating middlemen, ensuring fair pricing, and offering escrow-protected fast payments for their harvest." },
    { question: "What kind of buyers can purchase on KrishiSetu?", answer: "Wholesalers, retailers, food processors, and institutional buyers can effortlessly procure high-quality, graded agricultural produce in bulk directly from verified farmers." },
    { question: "Is it free to register as a farmer?", answer: "Yes! Registration for farmers is absolutely free. You only pay a minimal platform fee when your produce is successfully sold and payment is secured." },
    { question: "How is the quality of the produce ensured?", answer: "We maintain strict grading standards. Farmers provide detailed quality parameters and images, and our on-ground team often verifies the produce before dispatch to ensure trust." },
    { question: "What are the payment options available?", answer: "We support seamless digital transactions including NEFT, RTGS, UPI, and net banking. All payments are securely routed through our Escrow system." },
    { question: "How does the logistics and delivery work?", answer: "Buyers can arrange their own transport or opt for KrishiSetu's partnered logistics network for end-to-end tracking and hassle-free delivery from farm to warehouse." },
    { question: "Does KrishiSetu provide crop advisory services?", answer: "While our primary focus is market linkage, we are actively integrating AI-driven crop advisory and weather alerts to help farmers maximize their yield." },
    { question: "Is my personal and financial information secure?", answer: "Absolutely. We employ bank-grade encryption and stringent data privacy measures to ensure your information and transactions are 100% secure." },
    { question: "How can I contact KrishiSetu customer support?", answer: "You can reach out to our dedicated support team 24/7 via the toll-free number or email provided in the Contact section below." }
  ]
};

// Images with SEO-optimized alt descriptions and priority hints
const carouselImages = [
  { src: "/farm_hero_background.png", alt: "Aerial view of lush green Indian farmland with crops ready for harvest", priority: true },
  { src: "/hero_cereals.png", alt: "Freshly harvested wheat and rice grains - Indian cereal crops for wholesale", priority: false },
  { src: "/hero_pulses.png", alt: "Assorted Indian pulses including chickpeas, lentils and beans - protein-rich crops", priority: false },
  { src: "/hero_oilseeds.png", alt: "Organic oilseeds - mustard, sunflower and groundnut for cooking oil production", priority: false },
  { src: "/hero_vegetables.png", alt: "Fresh organic mixed vegetables from local Indian farms", priority: false },
  { src: "/hero_fruits.png", alt: "Fresh mangoes and bananas - seasonal Indian fruits for bulk procurement", priority: false },
  { src: "/hero_spices.png", alt: "Aromatic Indian spices - turmeric, cumin and coriander from farm to business", priority: false },
  { src: "/rice.jpg", alt: "High-quality basmati and non-basmati rice grains for wholesale buyers", priority: false },
  { src: "/cotton.png", alt: "Raw cotton harvest - textile industry raw material from Indian farmers", priority: false },
  { src: "/sugarcane.png", alt: "Fresh sugarcane harvest for sugar and biofuel production", priority: false },
  { src: "/digital_farmer.png", alt: "Smiling Indian farmers using digital technology for agriculture", priority: false },
  { src: "/Agriculture_Industry.png", alt: "Modern agriculture industry with drone technology and smart farming", priority: false },
  { src: "/smart_farm.jpg", alt: "Smart farming technology - IoT sensors and automated irrigation systems", priority: false },
];

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000); // Longer duration for better UX and SEO dwell time
    return () => clearInterval(timer);
  }, []);

  // JSON-LD Structured Data for Organization
  const organizationLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'KrishiSetu',
    url: 'http://localhost:3000',
    logo: 'http://localhost:3000/logo.png',
    description: 'Agricultural marketplace connecting farmers with institutional buyers in India',
    sameAs: [
      'https://twitter.com/krishetu',
      'https://linkedin.com/company/krishetu',
      'https://facebook.com/krishetu'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-7488499849',
      contactType: 'customer service',
      availableLanguage: ['English', 'Hindi', 'Telugu', 'Tamil']
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '1250',
      bestRating: '5',
      worstRating: '1'
    }
  };

  // JSON-LD Structured Data for FAQ Page
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FaqDetails.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  // JSON-LD for BreadcrumbList
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'http://localhost:3000'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Agricultural Marketplace',
        item: 'http://localhost:3000'
      }
    ]
  };

  return (
    <>
      {/* Inject JSON-LD Structured Data for Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-green-500/30">
        {/* Navbar with accessible labels */}
        <nav
          aria-label="Main navigation"
          className="fixed top-0 w-full glass z-50 px-6 py-4 flex justify-between items-center border-b border-slate-700/50 bg-slate-950/95 backdrop-blur-md"
        >
          <div className="flex items-center gap-2">
            <Leaf className="text-green-500" size={28} aria-hidden="true" />
            <span className="text-2xl font-bold tracking-tight">
              Krishi<span className="text-green-400">Setu</span>
            </span>
          </div>
          <div className="flex gap-4">
            <Link href="/login" aria-label="Login to your KrishiSetu account">
              <Button variant="outline" className="hidden sm:flex">Login</Button>
            </Link>
            <Link href="/register" aria-label="Register as farmer or buyer on KrishiSetu">
              <Button variant="primary">Join Now</Button>
            </Link>
          </div>
        </nav>

        {/* Hero Section with proper heading hierarchy */}
        <section
          aria-labelledby="hero-heading"
          className="relative min-h-screen flex text-center lg:text-left items-center pt-24 pb-16 px-6 overflow-hidden"
        >
          {/* Background Image Carousel with optimized Next.js Image component */}
          <div className="absolute inset-0 z-0 bg-slate-950">
            {carouselImages.map((img, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  priority={img.priority}
                  sizes="100vw"
                  className="object-cover"
                  quality={85}
                  loading={img.priority ? 'eager' : 'lazy'}
                />
              </div>
            ))}
            {/* Gradient overlays for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent z-20"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-20"></div>
          </div>

          <div className="max-w-7xl mx-auto w-full relative z-30 grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold backdrop-blur-md">
                <Sprout size={16} aria-hidden="true" />
                <span>Connecting Indian Agriculture Since 2023</span>
              </div>

              <h1 id="hero-heading" className="text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-xl">
                Connecting <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Farms</span> to <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Business</span>
              </h1>

              <p className="text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 drop-shadow-md">
                KrishiSetu relies on technology to provide end to end agricultural services. Sell your harvest directly to prominent institutional buyers without middlemen. Fair prices, instant payments.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/register?role=farmer">
                  <Button
                    size="xl"
                    className="w-full sm:w-auto text-lg hover:scale-105 transition-transform bg-green-500 hover:bg-green-600 border-none text-white shadow-lg shadow-green-500/25"
                    aria-label="Start selling your crops as a farmer"
                  >
                    Start Selling <ArrowRight size={18} className="ml-2" aria-hidden="true" />
                  </Button>
                </Link>
                <Link href="/register?role=buyer">
                  <Button
                    size="xl"
                    className="w-full sm:w-auto text-lg hover:scale-105 transition-transform bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white"
                    aria-label="Procure agricultural produce as a buyer"
                  >
                    Procure Produce
                  </Button>
                </Link>
              </div>

              {/* Social proof statistics */}
              <div className="flex items-center justify-center lg:justify-start gap-8 pt-4">
                <div className="text-center lg:text-left">
                  <h4 className="text-3xl font-bold text-white">100k+</h4>
                  <p className="text-sm text-slate-400">Farmers Connected</p>
                </div>
                <div className="w-px h-12 bg-slate-700" aria-hidden="true"></div>
                <div className="text-center lg:text-left">
                  <h4 className="text-3xl font-bold text-white">5k+</h4>
                  <p className="text-sm text-slate-400">Verified Buyers</p>
                </div>
                <div className="w-px h-12 bg-slate-700" aria-hidden="true"></div>
                <div className="text-center lg:text-left">
                  <h4 className="text-3xl font-bold text-white">₹500Cr+</h4>
                  <p className="text-sm text-slate-400">Transaction Value</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services/Features Section */}
        <section aria-labelledby="features-heading" className="py-24 bg-slate-950 px-6 relative">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 id="features-heading" className="text-3xl lg:text-4xl font-bold mb-4">Complete Agricultural Ecosystem</h2>
              <p className="text-slate-400 text-lg">We digitize the entire agricultural value chain to bring efficiency, transparency, and profitability to the grassroots level.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 shadow-xl group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp size={28} aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Output Linkage</h3>
                <p className="text-slate-400">Directly connect with commercial buyers, ensuring better realization for your harvest without multiple intermediaries.</p>
              </div>

              {/* Feature 2 */}
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 shadow-xl group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                  <ShieldCheck size={28} aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Secure Escrow</h3>
                <p className="text-slate-400">Our robust digital payment infrastructure ensures farmers get paid swiftly and securely once the quality is verified.</p>
              </div>

              {/* Feature 3 */}
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 shadow-xl group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                  <Briefcase size={28} aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Institutional Procurement</h3>
                <p className="text-slate-400">Businesses enjoy hassle-free procurement with assured quality grading, bulk availability, and seamless supply chain logistics.</p>
              </div>

              {/* Feature 4 */}
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 shadow-xl group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                  <Smartphone size={28} aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Agri-Advisory</h3>
                <p className="text-slate-400">Get data-driven insights tailored to your farm to improve crop yield and decrease input costs.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section aria-labelledby="how-it-works-heading" className="py-24 bg-slate-900 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 id="how-it-works-heading" className="text-3xl lg:text-4xl font-bold mb-6">
                  How KrishiSetu <span className="text-green-400">Transforms</span> Agri-Trade
                </h2>
                <p className="text-slate-400 text-lg mb-12">
                  Whether you are a farmer looking to maximize profits or a buyer seeking consistent supply, our platform simplifies the journey.
                </p>

                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-bold text-xl" aria-label="Step 1">
                      1
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Register & Verify</h3>
                      <p className="text-slate-400">Create your profile using just a phone number. Complete our fast digital KYC for ultimate platform trust.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-bold text-xl" aria-label="Step 2">
                      2
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">List or Discover Produce</h3>
                      <p className="text-slate-400">Farmers upload rich details of their harvest. Buyers browse categorized, quality-graded agricultural commodities.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-bold text-xl" aria-label="Step 3">
                      3
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Trade & Grow</h3>
                      <p className="text-slate-400">Finalize deals directly on the platform. Utilize our logistics dashboard and enjoy secure digital settlements.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-12">
                  <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-lg text-center">
                    <HeartHandshake className="mx-auto text-amber-400 mb-4" size={40} aria-hidden="true" />
                    <h3 className="font-bold text-white">Trust & Transparency</h3>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-emerald-700 p-6 rounded-3xl shadow-lg text-center text-white">
                    <BarChart3 className="mx-auto text-white mb-4" size={40} aria-hidden="true" />
                    <h3 className="font-bold">Better Margins by 20-30%</h3>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-lg text-center">
                    <Zap className="mx-auto text-blue-400 mb-4" size={40} aria-hidden="true" />
                    <h3 className="font-bold text-white">Lightning Fast Payments</h3>
                  </div>
                  <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-lg text-center">
                    <Globe className="mx-auto text-purple-400 mb-4" size={40} aria-hidden="true" />
                    <h3 className="font-bold text-white">Nationwide Reach</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FaqSection FaqDetails={FaqDetails} />

        {/* CTA Section */}
        <section aria-labelledby="cta-heading" className="py-24 px-6">
          <div className="max-w-5xl mx-auto bg-gradient-to-r from-green-600 to-emerald-900 rounded-[3rem] p-12 lg:p-20 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 text-white/5" aria-hidden="true">
              <Leaf size={300} />
            </div>
            <div className="relative z-10">
              <h2 id="cta-heading" className="text-3xl lg:text-5xl font-extrabold text-white mb-6">
                Ready to revolutionize your agriculture business?
              </h2>
              <p className="text-green-100 text-lg lg:text-xl max-w-2xl mx-auto mb-10">
                Join thousands of farmers and buyers already experiencing transparent pricing and secure trade.
              </p>
              <Link href="/register">
                <Button
                  size="xl"
                  variant="white"
                  className="font-bold text-lg px-10"
                  aria-label="Get started on KrishiSetu today"
                >
                  Get Started Today
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
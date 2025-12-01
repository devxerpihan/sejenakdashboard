"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { AuthModal } from "@/components/auth/AuthModal";
import {
  HairIcon,
  FacialIcon,
  BodyIcon,
  NailIcon,
  WellnessIcon,
  PilatesIcon,
  StarIcon,
  ExpertIcon,
  PremiumIcon,
  LuxuryIcon,
  PersonalizedIcon,
  SunIcon,
  MoonIcon,
  InstagramIcon,
  FacebookIcon,
  WhatsAppIcon,
} from "@/components/icons";

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode");
      return saved === "true";
    }
    return false;
  });

  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Handle redirect parameter and auto-open auth modal
  useEffect(() => {
    if (typeof window !== "undefined" && isLoaded) {
      const searchParams = new URLSearchParams(window.location.search);
      const redirect = searchParams.get("redirect");
      
      if (user) {
        // User is authenticated
        if (redirect) {
          // Redirect to the specified URL
          router.push(redirect);
        } else if (window.location.pathname === "/") {
          // If on landing page and authenticated, redirect to dashboard
          router.push("/dashboard");
        }
      } else if (redirect) {
        // User needs to authenticate, open modal
        setIsAuthModalOpen(true);
      }
    }
  }, [user, isLoaded, router]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const services = [
    {
      name: "Hair Services",
      description: "Luxury hair treatments and styling",
      icon: HairIcon,
      category: "Hair",
      image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=600&fit=crop",
    },
    {
      name: "Facial Treatments",
      description: "Rejuvenating facial therapies",
      icon: FacialIcon,
      category: "Face",
      image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=600&fit=crop",
    },
    {
      name: "Body Treatments",
      description: "Relaxing body massages and spa",
      icon: BodyIcon,
      category: "Body",
      image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=600&fit=crop",
    },
    {
      name: "Nail Care",
      description: "Manicure and pedicure services",
      icon: NailIcon,
      category: "Nail",
      image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=600&fit=crop",
    },
    {
      name: "Wellness",
      description: "Holistic wellness programs",
      icon: WellnessIcon,
      category: "Wellness",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop",
    },
    {
      name: "Pilates",
      description: "Fitness and movement classes",
      icon: PilatesIcon,
      category: "Pilates",
      image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=600&fit=crop",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Regular Client",
      content: "Sejenak Beauty Lounge has become my sanctuary. The treatments are exceptional and the atmosphere is so relaxing.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    },
    {
      name: "Maria Garcia",
      role: "Elite Member",
      content: "The best beauty lounge in Islamic Village! Professional staff and amazing results every time.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
    {
      name: "Amanda Lee",
      role: "New Client",
      content: "First visit exceeded all expectations. The attention to detail and personalized service is outstanding.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    },
  ];

  const features = [
    {
      title: "Expert Therapists",
      description: "Trained professionals dedicated to your beauty and wellness",
      icon: ExpertIcon,
    },
    {
      title: "Premium Products",
      description: "Only the finest quality products for your treatments",
      icon: PremiumIcon,
    },
    {
      title: "Luxurious Ambiance",
      description: "A serene and elegant space designed for relaxation",
      icon: LuxuryIcon,
    },
    {
      title: "Personalized Care",
      description: "Tailored treatments to meet your unique needs",
      icon: PersonalizedIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F0EEED] dark:bg-[#191919]">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-20 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 dark:bg-[#191919]/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-full">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center h-full">
          <img 
            src="/images/Logo Baru Sejenak-03.png" 
                alt="Sejenak Logo"
                className="h-24 w-auto"
            onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-[#191919] dark:text-[#F0EEED] hover:text-[#C1A7A3] transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-4 py-2 text-sm font-medium text-[#191919] dark:text-[#F0EEED] hover:text-[#C1A7A3] transition-colors"
                >
                  Dashboard
                </button>
              )}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <SunIcon className="w-5 h-5 text-[#191919] dark:text-[#F0EEED]" />
                ) : (
                  <MoonIcon className="w-5 h-5 text-[#191919] dark:text-[#F0EEED]" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center px-6 py-20 bg-[#F0EEED] dark:bg-[#191919]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content Side */}
          <div className="text-left">
            <p className="text-sm font-semibold text-[#C1A7A3] uppercase tracking-wider mb-4">
              AWARD-WINNING SPA EXPERIENCE
            </p>
            <h1 className="text-5xl md:text-7xl font-bold text-[#191919] dark:text-[#F0EEED] mb-6 leading-tight">
              Transform Your Beauty
              <br />
              <span className="text-[#C1A7A3]">Journey</span>
        </h1>
            <p className="text-xl md:text-2xl text-[#706C6B] dark:text-[#C1A7A3] mb-8">
              Discover the perfect blend of traditional Indonesian wellness techniques and modern luxury. Our expert therapists create personalized experiences that rejuvenate your body, mind, and spirit.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-8 py-4 bg-[#C1A7A3] hover:bg-[#A88F8B] text-white rounded-lg text-lg font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Book Appointment
              </button>
              {user ? (
        <Link
          href="/dashboard"
                  className="px-8 py-4 bg-white dark:bg-[#3D3B3A] hover:bg-[#F0EEED] dark:hover:bg-[#5A5756] text-[#191919] dark:text-[#F0EEED] border-2 border-[#C1A7A3] rounded-lg text-lg font-medium transition-all text-center"
        >
                  View Services
        </Link>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-8 py-4 bg-white dark:bg-[#3D3B3A] hover:bg-[#F0EEED] dark:hover:bg-[#5A5756] text-[#191919] dark:text-[#F0EEED] border-2 border-[#C1A7A3] rounded-lg text-lg font-medium transition-all"
                >
                  View Services
                </button>
              )}
            </div>
          </div>
          
          {/* Image Side */}
          <div className="relative w-full h-[600px] rounded-2xl overflow-hidden">
            <Image
              src="/web-assets/landing-page/Image HERO SECTION.png"
              alt="Beauty Lounge"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-6 bg-white dark:bg-[#191919]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#191919] dark:text-[#F0EEED] mb-4">
              Our Services
            </h2>
            <p className="text-lg text-[#706C6B] dark:text-[#C1A7A3] max-w-2xl mx-auto">
              Discover our comprehensive range of beauty and wellness treatments
              designed to enhance your natural beauty
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl bg-[#F0EEED] dark:bg-[#3D3B3A] hover:bg-[#DCCAB7] dark:hover:bg-[#5A5756] transition-all cursor-pointer border border-zinc-200 dark:border-zinc-800"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="p-6">
                    <div className="text-[#C1A7A3] mb-4 group-hover:scale-110 transition-transform">
                      <IconComponent className="w-12 h-12" />
                    </div>
                    <h3 className="text-xl font-bold text-[#191919] dark:text-[#F0EEED] mb-2">
                      {service.name}
                    </h3>
                    <p className="text-[#706C6B] dark:text-[#C1A7A3]">
                      {service.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/web-assets/landing-page/Background READY TO TRANSFORM.png"
            alt="Background"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/20 dark:bg-black/40" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#191919] dark:text-[#F0EEED] mb-4">
              Why Choose Sejenak?
            </h2>
            <p className="text-lg text-[#706C6B] dark:text-[#C1A7A3] max-w-2xl mx-auto">
              We combine expertise, luxury, and personalized care to deliver an
              exceptional beauty experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="text-center p-6 rounded-xl bg-white/90 dark:bg-[#3D3B3A]/90 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-shadow"
                >
                  <div className="text-[#C1A7A3] mb-4 flex justify-center">
                    <IconComponent className="w-12 h-12" />
                  </div>
                  <h3 className="text-xl font-bold text-[#191919] dark:text-[#F0EEED] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-[#706C6B] dark:text-[#C1A7A3]">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-white dark:bg-[#191919]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#191919] dark:text-[#F0EEED] mb-4">
              What Our Clients Say
            </h2>
            <p className="text-lg text-[#706C6B] dark:text-[#C1A7A3] max-w-2xl mx-auto">
              Hear from our satisfied clients about their Sejenak experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-[#F0EEED] dark:bg-[#3D3B3A] border border-zinc-200 dark:border-zinc-800"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-[#706C6B] dark:text-[#C1A7A3] mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-[#191919] dark:text-[#F0EEED]">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/web-assets/landing-page/Background READY TO TRANSFORM.png"
            alt="Background"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/20 dark:bg-black/40" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="bg-white/90 dark:bg-[#3D3B3A]/90 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-zinc-200 dark:border-zinc-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#191919] dark:text-[#F0EEED] mb-6">
                  Visit Us
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-[#191919] dark:text-[#F0EEED] mb-2">
                      Location
                    </h3>
                    <p className="text-[#706C6B] dark:text-[#C1A7A3]">
                      Sejenak Beauty Lounge
                      <br />
                      Islamic Village
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#191919] dark:text-[#F0EEED] mb-2">
                      Contact
                    </h3>
                    <p className="text-[#706C6B] dark:text-[#C1A7A3]">
                      Phone: (021) 1234-5678
                      <br />
                      Email: info@sejenakbeauty.com
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#191919] dark:text-[#F0EEED] mb-2">
                      Hours
                    </h3>
                    <p className="text-[#706C6B] dark:text-[#C1A7A3]">
                      Monday - Sunday
                      <br />
                      9:00 AM - 9:00 PM
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative w-full h-64 rounded-lg overflow-hidden">
                <Image
                  src="/assets/sejenak.jpeg"
                  alt="Sejenak Beauty Lounge Location"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-[#191919] dark:bg-[#0A0A0A] text-[#F0EEED]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/images/logo minimalist.jpg"
                  alt="Sejenak Logo"
                  className="h-10 w-10 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div>
                  <h3 className="font-bold">Sejenak Beauty</h3>
                  <p className="text-xs text-[#C1A7A3]">Islamic Village</p>
                </div>
              </div>
              <p className="text-sm text-[#C1A7A3]">
                Your beauty, our passion. Experience luxury treatments in a
                serene environment.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-[#C1A7A3]">
                <li>
                  <Link href="/dashboard" className="hover:text-[#F0EEED]">
                    Hair Services
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-[#F0EEED]">
                    Facial Treatments
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-[#F0EEED]">
                    Body Massage
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-[#F0EEED]">
                    Nail Care
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-[#C1A7A3]">
                <li>
                  <Link href="/dashboard" className="hover:text-[#F0EEED]">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-[#F0EEED]">
                    Our Team
                  </Link>
                </li>
                <li>
                  <Link href="/appointment" className="hover:text-[#F0EEED]">
                    Book Appointment
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-[#F0EEED]">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-[#C1A7A3]">
                <li>
                  <Link 
                    href="/privacy" 
                    className="hover:text-[#F0EEED] transition-colors cursor-pointer"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/privacy#terms-conditions" 
                    className="hover:text-[#F0EEED] transition-colors cursor-pointer"
                  >
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Connect</h4>
              <div className="flex gap-4 mb-4">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-[#3D3B3A] hover:bg-[#5A5756] flex items-center justify-center transition-colors text-[#F0EEED]"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-[#3D3B3A] hover:bg-[#5A5756] flex items-center justify-center transition-colors text-[#F0EEED]"
                  aria-label="Facebook"
                >
                  <FacebookIcon className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-[#3D3B3A] hover:bg-[#5A5756] flex items-center justify-center transition-colors text-[#F0EEED]"
                  aria-label="WhatsApp"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                </a>
              </div>
              <p className="text-sm text-[#C1A7A3]">
                Follow us for updates and special offers
        </p>
      </div>
          </div>
          <div className="border-t border-zinc-800 pt-8 text-center text-sm text-[#C1A7A3]">
            <p>© 2025 Sejenak Beauty Lounge. All Rights Reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode="signIn"
      />
    </div>
  );
}

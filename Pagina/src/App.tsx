/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useMotionTemplate } from "motion/react";
import { 
  Shield, 
  Network, 
  Cloud, 
  Cpu, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2, 
  Mail, 
  Phone, 
  MapPin,
  Menu,
  X,
  ArrowRight,
  Star,
  Users,
  Zap,
  Globe,
  Quote,
  Loader2,
  Sun,
  Moon,
  Linkedin,
  Twitter,
  Instagram,
  Github,
  Cookie,
  Terminal
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import ChatWidget from "./components/ChatWidget";
import AnimatedNumber from "./components/AnimatedNumber";
import CommandCenter from "./pages/CommandCenter";
import LegalModal from "./components/LegalModal";

// Fix default Leaflet icon paths
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

const services = [
  {
    title: "Redes Avanzadas",
    description: "Infraestructura de red robusta y escalable para empresas de alto rendimiento.",
    icon: <Network className="w-8 h-8" />,
    features: ["SD-WAN", "Fibra Óptica", "WiFi 6E", "Optimización de Tráfico"]
  },
  {
    title: "Ciberseguridad",
    description: "Protección integral contra amenazas digitales y cumplimiento de normativas.",
    icon: <Shield className="w-8 h-8" />,
    features: ["SOC 24/7", "Pentesting", "EDR/XDR", "Cifrado de Datos"]
  },
  {
    title: "Servicios Cloud",
    description: "Migración y gestión de entornos en la nube para máxima flexibilidad.",
    icon: <Cloud className="w-8 h-8" />,
    features: ["Azure/AWS", "Nube Híbrida", "Backup Remoto", "SaaS Management"]
  },
  {
    title: "Soporte Técnico",
    description: "Asistencia especializada y mantenimiento preventivo para su infraestructura.",
    icon: <Cpu className="w-8 h-8" />,
    features: ["Help Desk", "Mantenimiento", "Hardware", "Consultoría IT"]
  }
];

const aboutImages = [
  { url: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=800&q=80", alt: "SkyTech Datacenters" },
  { url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80", alt: "Ciberseguridad y Monitoreo" },
  { url: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80", alt: "Hardware de Redes" },
  { url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80", alt: "Conectividad Cloud" }
];

const stats = [
  { label: "Proyectos Completados", value: "500+", icon: <Zap className="w-5 h-5" /> },
  { label: "Clientes Felices", value: "200+", icon: <Users className="w-5 h-5" /> },
  { label: "Soporte Global", value: "24/7", icon: <Globe className="w-5 h-5" /> },
  { label: "Tiempo de Respuesta", value: "<15m", icon: <Star className="w-5 h-5" /> },
];

const testimonials = [
  {
    quote: "SkyTech transformó nuestra infraestructura de red en tiempo récord. Su soporte es excepcional y proactivo.",
    author: "Carlos Rodríguez",
    role: "CEO de TechFlow Solutions",
    avatar: "https://i.pravatar.cc/100?img=11"
  },
  {
    quote: "La seguridad de nuestros datos era nuestra mayor preocupación hasta que conocimos a SkyTech. Ahora dormimos tranquilos.",
    author: "Elena Martínez",
    role: "CTO de SecureBank Intl",
    avatar: "https://i.pravatar.cc/100?img=5"
  },
  {
    quote: "Migrar a la nube fue un proceso transparente gracias a su equipo experto. Eficiencia y profesionalismo puro.",
    author: "Roberto Sanz",
    role: "Director de Innovación, GlobalLogistics",
    avatar: "https://i.pravatar.cc/100?img=8"
  }
];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export function Home() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  
  // Legal Modal mapping
  const [legalModalType, setLegalModalType] = useState<string | null>(null);

  // Parallax ref and hooks
  const aboutRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: aboutRef,
    offset: ["start end", "end start"]
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["-25%", "25%"]);

  // Form State
  const [formData, setFormData] = useState({ name: "", company: "", email: "", message: "" });
  const [errors, setErrors] = useState({ name: "", company: "", email: "", message: "" });
  const [touched, setTouched] = useState({ name: false, company: false, email: false, message: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Cookie Consent State
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setShowCookieBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setShowCookieBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem("cookieConsent", "declined");
    setShowCookieBanner(false);
  };

  // Carousel State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % aboutImages.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + aboutImages.length) % aboutImages.length);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % aboutImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const validate = (field: string, value: string) => {
    switch (field) {
      case "name": return value.trim() === "" ? "El nombre es requerido." : "";
      case "company": return value.trim() === "" ? "La empresa es requerida." : "";
      case "email": return !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) ? "Introduce un email corporativo válido." : "";
      case "message": return value.trim().length < 10 ? "El mensaje debe tener al menos 10 caracteres." : "";
      default: return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name as keyof typeof touched]) {
      setErrors(prev => ({ ...prev, [name]: validate(name, value) }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = {
      name: validate("name", formData.name),
      company: validate("company", formData.company),
      email: validate("email", formData.email),
      message: validate("message", formData.message),
    };
    setErrors(newErrors);
    setTouched({ name: true, company: true, email: true, message: true });

    if (Object.values(newErrors).every(err => err === "")) {
      setIsSubmitting(true);
      // Simular tiempo de carga de API
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ name: "", company: "", email: "", message: "" });
      setTouched({ name: false, company: false, email: false, message: false });
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setIsMenuOpen(false);
    // Smooth scroll is handled natively via CSS `scroll-behavior: smooth`
  };

  // Typed Effect State for Hero
  const phrases = ["SIN LÍMITES", "ULTRA RÁPIDO", "100% SEGURO", "ESCALABLE"];
  const [phraseIndex, setPhraseIndex] = useState(0);

  // Mouse Glow tracking for Hero
  const glowX = useMotionValue(0);
  const glowY = useMotionValue(0);

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const { currentTarget, clientX, clientY } = e;
    const { left, top } = currentTarget.getBoundingClientRect();
    glowX.set(clientX - left);
    glowY.set(clientY - top);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [phrases.length]);

  return (
    <div className="min-h-screen flex flex-col selection:bg-sky-500/30 font-sans transition-colors duration-500 bg-white dark:bg-slate-950">
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 to-indigo-500 origin-left z-[100] shadow-[0_0_15px_rgba(14,165,233,0.5)]" 
        style={{ scaleX: scrollYProgress }} 
      />
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? "bg-slate-950/90 dark:bg-slate-950/90 backdrop-blur-xl py-4 border-b border-slate-800" : "bg-transparent py-4 md:py-6"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20">
                <Cloud className="text-white w-6 h-6" />
              </div>
              <span className={`text-2xl font-extrabold tracking-tighter ${scrolled || isDark ? 'text-white' : 'text-slate-900 md:text-white'}`}>
                SKY<span className="text-sky-400">TECH</span>
              </span>
            </motion.div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8 lg:gap-10">
              {["Inicio", "Servicios", "Nosotros", "Testimonios", "Contacto"].map((item, i) => (
                <motion.a 
                  key={item} 
                  href={`#${item.toLowerCase()}`}
                  onClick={(e) => handleNavClick(e, `#${item.toLowerCase()}`)}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`text-sm font-semibold transition-colors relative group hover:text-sky-400 ${scrolled || isDark ? 'text-slate-300' : 'text-slate-300'}`}
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-400 transition-all group-hover:w-full" />
                </motion.a>
              ))}

              <div className="flex items-center gap-4 border-l border-slate-700 pl-4 lg:pl-10">
                <button
                  onClick={() => setIsDark(!isDark)}
                  className={`p-2 rounded-full transition-colors ${scrolled || isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'}`}
                  aria-label="Toggle Dark Mode"
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <motion.button 
                  onClick={() => navigate('/comando')}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-transparent border border-sky-500/50 text-sky-400 px-4 py-2.5 rounded-full text-sm font-bold transition-all hover:bg-sky-500/10 shadow-[0_0_10px_rgba(14,165,233,0.1)] flex items-center gap-2"
                >
                  <Terminal className="w-4 h-4" />
                  <span className="hidden lg:inline">C&C</span>
                </motion.button>
                <motion.button 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-sky-500 hover:bg-sky-400 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-xl shadow-sky-500/20 hidden sm:block"
                >
                  Presupuesto
                </motion.button>
              </div>
            </div>

            {/* Mobile Menu Toggle & Theme Button */}
            <div className="md:hidden flex items-center gap-4">
              <button
                onClick={() => setIsDark(!isDark)}
                className={`p-2 rounded-full transition-colors ${scrolled || isDark ? 'text-slate-300' : 'text-slate-900'}`}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button 
                className={`p-2 ${scrolled || isDark ? 'text-slate-300' : 'text-slate-900'}`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-slate-900 dark:bg-slate-950 border-b border-slate-800 px-4 py-8 flex flex-col gap-6 overflow-hidden"
            >
              {["Inicio", "Servicios", "Nosotros", "Testimonios", "Contacto"].map((item) => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase()}`}
                  className="text-xl font-bold text-slate-100 hover:text-sky-400 transition-colors"
                  onClick={(e) => handleNavClick(e, `#${item.toLowerCase()}`)}
                >
                  {item}
                </a>
              ))}
              <div className="pt-6 border-t border-slate-800">
                <button 
                  onClick={() => navigate('/comando')}
                  className="text-xl font-black text-sky-400 flex items-center gap-3 transition-all hover:text-sky-300"
                >
                  <Terminal className="w-6 h-6" /> Centro de Comando
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section id="inicio" onMouseMove={handleHeroMouseMove} className="relative pt-40 pb-24 lg:pt-56 lg:pb-40 bg-slate-950 overflow-hidden group">
          {/* Interactive Mouse Glow */}
          <motion.div
            className="pointer-events-none absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: useMotionTemplate`radial-gradient(circle 600px at ${glowX}px ${glowY}px, rgba(14, 165, 233, 0.15), transparent 80%)`,
            }}
          />

          {/* Tech Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(#sky-400 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-sky-500/20 rounded-full blur-[120px] opacity-30 animate-pulse" />
            <div className="absolute top-1/2 -right-24 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] opacity-30" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-xs font-bold tracking-widest text-sky-400 uppercase bg-sky-400/10 rounded-full border border-sky-400/20">
                  <Zap className="w-3 h-3" />
                  Líderes en Transformación Digital
                </span>
                <h1 className="text-6xl lg:text-8xl font-black text-white tracking-tighter mb-8 leading-[0.95]">
                  IT <span className="inline-block relative">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={phraseIndex}
                        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
                        transition={{ duration: 0.4 }}
                        className="absolute left-0 bottom-0 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500 whitespace-nowrap"
                      >
                        {phrases[phraseIndex]}
                      </motion.span>
                    </AnimatePresence>
                    <span className="opacity-0 whitespace-nowrap">{phrases[phraseIndex]}</span> {/* Hidden helper for layout spacing */}
                  </span> PARA TU EMPRESA
                </h1>
                <p className="text-xl text-slate-400 mb-12 leading-relaxed max-w-xl">
                  Diseñamos infraestructuras tecnológicas de alto rendimiento, seguras y preparadas para el futuro de tu negocio.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto px-10 py-5 bg-sky-500 hover:bg-sky-400 text-white rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 group shadow-2xl shadow-sky-500/40"
                  >
                    Nuestros Servicios
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                  <button onClick={() => navigate('/comando')} className="w-full sm:w-auto px-10 py-5 bg-slate-800/50 hover:bg-slate-800 text-white rounded-2xl font-bold text-lg transition-all border border-slate-700 backdrop-blur-sm shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                    Centro de Comando
                  </button>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 1, ease: "easeOut" }}
                className="relative hidden lg:block"
              >
                <div className="relative rounded-[3rem] overflow-hidden border border-slate-800 shadow-[0_0_100px_rgba(14,165,233,0.1)] bg-slate-900/50 p-3">
                  <img 
                    src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1000&q=80" 
                    alt="SkyTech Datacenter" 
                    className="rounded-[2.5rem] w-full object-cover aspect-square"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/60 via-transparent to-sky-500/10" />
                </div>
                {/* Floating Badge */}
                <motion.div 
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-10 -left-10 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-2xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center">
                      <Shield className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-white font-black text-xl">100% Seguro</p>
                      <p className="text-slate-400 text-sm font-medium">Protección Certificada</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-slate-950 relative border-y border-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {stats.map((stat, i) => (
                <motion.div 
                  key={i}
                  variants={fadeInUp}
                  className="text-center p-6"
                >
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-sky-500/10 text-sky-400 mb-4">
                    {stat.icon}
                  </div>
                  <p className="text-4xl font-black text-white mb-1">{stat.value}</p>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Services Section */}
        <section id="servicios" className="py-32 bg-white dark:bg-slate-900 transition-colors duration-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              {...fadeInUp}
              className="text-center mb-24"
            >
              <h2 className="text-sm font-black text-sky-500 uppercase tracking-[0.3em] mb-4">Nuestras Capacidades</h2>
              <p className="text-5xl lg:text-6xl font-black text-slate-950 dark:text-white tracking-tighter leading-none transition-colors duration-500">
                Soluciones 360° de <span className="text-sky-500">Alto Nivel</span>
              </p>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10"
            >
              {services.map((service, index) => (
                <motion.div
                  key={service.title}
                  variants={{
                    initial: { opacity: 0, y: 20, scale: 0.95 },
                    whileInView: { 
                      opacity: 1, 
                      y: 0, 
                      scale: 1, 
                      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
                    }
                  }}
                  whileHover="hover"
                  className="relative rounded-[2.5rem] border border-slate-100 dark:border-slate-800 transition-all duration-500 group hover:-translate-y-4 hover:shadow-[0_30px_60px_rgba(14,165,233,0.3)] overflow-hidden"
                >
                  {/* Default Background */}
                  <div className="absolute inset-0 bg-slate-50 dark:bg-slate-800 transition-colors duration-500 z-0" />
                  
                  {/* Hover Animating Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />
                  
                  {/* Decorative abstract shape inside the card */}
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100 pointer-events-none z-0" />

                  {/* Card Content */}
                  <div className="relative z-10 p-10 h-full flex flex-col">
                    <div className="relative w-20 h-20 bg-sky-500/10 dark:bg-sky-500/20 rounded-2xl flex items-center justify-center text-sky-600 dark:text-sky-400 mb-8 group-hover:bg-white/20 group-hover:text-white transition-colors duration-500 backdrop-blur-md shadow-sm">
                      {/* Particles Array */}
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1.5 h-1.5 bg-sky-400 rounded-full"
                          variants={{
                            initial: { opacity: 0, scale: 0, x: 0, y: 0 },
                            hover: {
                              opacity: [0, 1, 0],
                              scale: [0, 1.5, 0],
                              x: Math.cos((i * 60) * (Math.PI / 180)) * 50,
                              y: Math.sin((i * 60) * (Math.PI / 180)) * 50,
                              transition: {
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.15,
                                ease: "easeOut"
                              }
                            }
                          }}
                        />
                      ))}
                      <motion.div
                        className="relative z-10"
                        variants={{
                          initial: { scale: 1, y: 0, rotate: 0 },
                          whileInView: {
                            scale: [1, 1.05, 1],
                            y: [0, -3, 0],
                            transition: {
                              duration: 4,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }
                          },
                          hover: { 
                            scale: 1.1,
                            y: [-2, -6, -2],
                            transition: { 
                              scale: { type: "spring", stiffness: 400, damping: 15 },
                              y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                            } 
                          }
                        }}
                      >
                        {service.icon}
                      </motion.div>
                    </div>
                    <h3 className="text-2xl font-black text-slate-950 dark:text-white group-hover:text-white mb-4 tracking-tight transition-colors duration-500">
                      {service.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 group-hover:text-blue-100 mb-8 leading-relaxed font-medium transition-colors duration-500">
                      {service.description}
                    </p>
                    <ul className="space-y-4 mt-auto">
                      {service.features.map((feature, featureIdx) => (
                        <motion.li 
                          key={feature}
                          variants={{
                            initial: { opacity: 0.7, x: 0 },
                            whileInView: { opacity: 0.7, x: 0 },
                            hover: { 
                              opacity: 1, 
                              x: 10,
                              transition: { duration: 0.3, delay: featureIdx * 0.1 }
                            }
                          }}
                          className="flex items-center gap-3 text-sm font-bold text-slate-500 dark:text-slate-400 group-hover:text-white transition-colors duration-500"
                        >
                          <div className="w-5 h-5 rounded-full bg-sky-500/10 dark:bg-sky-500/20 group-hover:bg-white/20 flex items-center justify-center transition-colors duration-500 shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 group-hover:text-white transition-colors duration-500" />
                          </div>
                          <span>
                            {feature}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* About Section */}
        <section ref={aboutRef} id="nosotros" className="py-32 bg-slate-50 dark:bg-slate-950/50 transition-colors duration-500 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-sky-500/10 rounded-full blur-[80px]" />
                <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl aspect-[4/5] group bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <AnimatePresence mode="popLayout">
                    <motion.img 
                      key={currentImageIndex}
                      style={{ 
                        y: parallaxY, 
                        scale: 1.35 // Higher scale allows more shifting up and down without breaking edges
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                      src={aboutImages[currentImageIndex].url} 
                      alt={aboutImages[currentImageIndex].alt} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-[1.4]"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Navigation Controls */}
                  <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-6 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button onClick={prevImage} className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all pointer-events-auto shadow-xl">
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button onClick={nextImage} className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all pointer-events-auto shadow-xl">
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Dots */}
                  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-20 pointer-events-auto">
                    {aboutImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={`transition-all duration-300 rounded-full bg-white shadow-lg ${currentImageIndex === i ? 'w-8 h-2 opacity-100' : 'w-2 h-2 opacity-50 hover:opacity-100'}`}
                        aria-label={`Ver imagen ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="absolute -bottom-10 -right-10 bg-sky-500 p-10 rounded-[2rem] shadow-2xl z-20 text-white"
                >
                  <p className="text-6xl font-black mb-1">
                    <AnimatedNumber value={10} suffix="+" />
                  </p>
                  <p className="text-sm font-black uppercase tracking-widest opacity-80">Años de Innovación</p>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-sm font-black text-sky-500 uppercase tracking-[0.3em] mb-6">Nuestra Misión</h2>
                <h3 className="text-5xl lg:text-6xl font-black text-slate-950 dark:text-white mb-10 tracking-tighter leading-none transition-colors duration-500">
                  Tu Socio en la <span className="text-sky-500">Era Digital</span>
                </h3>
                <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 leading-relaxed font-medium transition-colors duration-500">
                  En SkyTech, fusionamos experiencia técnica con una visión estratégica. No solo resolvemos problemas; creamos oportunidades a través de la tecnología.
                </p>
                <div className="space-y-8 mb-12">
                  <div className="flex items-start gap-6 p-6 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                    <div className="bg-sky-500/10 dark:bg-sky-500/20 p-4 rounded-2xl text-sky-600 dark:text-sky-400">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xl font-black text-slate-950 dark:text-white mb-1 transition-colors duration-500">Seguridad de Grado Militar</p>
                      <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors duration-500">Protegemos tus activos más valiosos con tecnología de vanguardia.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-6 p-6 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                    <div className="bg-sky-500/10 dark:bg-sky-500/20 p-4 rounded-2xl text-sky-600 dark:text-sky-400">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xl font-black text-slate-950 dark:text-white mb-1 transition-colors duration-500">Rendimiento Extremo</p>
                      <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors duration-500">Optimizamos cada bit para que tu empresa nunca se detenga.</p>
                    </div>
                  </div>
                </div>
                <button className="px-10 py-5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-black text-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-xl dark:shadow-white/10">
                  Conoce nuestra Historia
                </button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonios" className="py-32 bg-white dark:bg-slate-900 relative overflow-hidden transition-colors duration-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
              {...fadeInUp}
              className="text-center mb-24"
            >
              <h2 className="text-sm font-black text-sky-500 uppercase tracking-[0.3em] mb-4">Testimonios</h2>
              <p className="text-5xl lg:text-6xl font-black text-slate-950 dark:text-white tracking-tighter leading-none transition-colors duration-500">
                Lo que dicen <span className="text-sky-500">nuestros clientes</span>
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="p-10 rounded-[3rem] bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 relative group transition-colors duration-500"
                >
                  <Quote className="absolute top-10 right-10 w-12 h-12 text-sky-500/10 dark:text-sky-500/5 group-hover:text-sky-500/20 transition-colors" />
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-sky-500 text-sky-500" />)}
                  </div>
                  <p className="text-xl text-slate-700 dark:text-slate-300 font-medium italic mb-10 leading-relaxed transition-colors duration-500">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-4">
                    <img src={t.avatar} alt={t.author} className="w-14 h-14 rounded-2xl object-cover border-2 border-white dark:border-slate-700 shadow-lg" referrerPolicy="no-referrer" loading="lazy" />
                    <div>
                      <p className="font-black text-slate-950 dark:text-white transition-colors duration-500">{t.author}</p>
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400 transition-colors duration-500">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contacto" className="py-32 bg-white dark:bg-slate-900 transition-colors duration-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-slate-950 rounded-[4rem] p-10 lg:p-24 overflow-hidden relative shadow-[0_50px_100px_rgba(0,0,0,0.3)]"
            >
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[120px] -mr-64 -mt-64" />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 relative z-10 mb-16">
                <div>
                  <h2 className="text-5xl lg:text-7xl font-black text-white mb-8 tracking-tighter leading-none">
                    ¿LISTO PARA EL <span className="text-sky-400">SIGUIENTE NIVEL</span>?
                  </h2>
                  <p className="text-xl text-slate-400 mb-16 leading-relaxed">
                    Contáctanos hoy mismo para una auditoría gratuita de tu infraestructura tecnológica.
                  </p>
                  
                  <div className="space-y-10">
                    {[
                      { icon: <Mail />, label: "Email", value: "contacto@skytech.com" },
                      { icon: <Phone />, label: "Teléfono", value: "+1 (809) 555-0199" },
                      { icon: <MapPin />, label: "Ubicación", value: "Distrito Nacional, Santo Domingo" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-8 group">
                        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-all duration-300">
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{item.label}</p>
                          <p className="text-2xl font-black text-white tracking-tight">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-slate-800 rounded-[3rem] p-10 lg:p-14 shadow-2xl min-h-[500px] flex flex-col justify-center relative overflow-hidden transition-colors duration-500"
                >
                  <AnimatePresence mode="wait">
                    {isSuccess ? (
                      <motion.div 
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col items-center justify-center text-center h-full"
                      >
                        <div className="w-24 h-24 bg-green-500/10 rounded-[2rem] flex items-center justify-center text-green-500 mb-6 relative">
                          <motion.div 
                            initial={{ scale: 0 }} 
                            animate={{ scale: 1 }} 
                            transition={{ type: "spring", delay: 0.2 }}
                          >
                            <CheckCircle2 className="w-12 h-12" />
                          </motion.div>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight transition-colors duration-500">¡Mensaje Enviado!</h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 max-w-sm transition-colors duration-500">
                          Gracias por contactarnos. Hemos recibido tu solicitud y un especialista se pondrá en contacto pronto.
                        </p>
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsSuccess(false)} 
                          className="px-8 py-4 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white rounded-2xl font-black text-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-all border border-slate-200 dark:border-slate-600"
                        >
                          Enviar otra consulta
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.form 
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-8" 
                        onSubmit={handleSubmit}
                        noValidate
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <label className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest transition-colors duration-500">Nombre</label>
                            <input 
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              type="text" 
                              placeholder="Tu nombre"
                              className={`w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-100 dark:border-slate-700 focus:border-sky-500 focus:ring-sky-500/10'} focus:ring-4 outline-none transition-all font-bold text-slate-900 dark:text-white dark:placeholder-slate-500`}
                            />
                            <AnimatePresence>
                              {errors.name && (
                                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-red-500 text-xs font-bold mt-1 overflow-hidden">{errors.name}</motion.p>
                              )}
                            </AnimatePresence>
                          </div>
                          <div className="space-y-3">
                            <label className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest transition-colors duration-500">Empresa</label>
                            <input 
                              name="company"
                              value={formData.company}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              type="text" 
                              placeholder="Nombre de empresa"
                              className={`w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border ${errors.company ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-100 dark:border-slate-700 focus:border-sky-500 focus:ring-sky-500/10'} focus:ring-4 outline-none transition-all font-bold text-slate-900 dark:text-white dark:placeholder-slate-500`}
                            />
                            <AnimatePresence>
                              {errors.company && (
                                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-red-500 text-xs font-bold mt-1 overflow-hidden">{errors.company}</motion.p>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest transition-colors duration-500">Email Corporativo</label>
                          <input 
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            type="email" 
                            placeholder="ejemplo@empresa.com"
                            className={`w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-100 dark:border-slate-700 focus:border-sky-500 focus:ring-sky-500/10'} focus:ring-4 outline-none transition-all font-bold text-slate-900 dark:text-white dark:placeholder-slate-500`}
                          />
                          <AnimatePresence>
                            {errors.email && (
                              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-red-500 text-xs font-bold mt-1 overflow-hidden">{errors.email}</motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                        <div className="space-y-3">
                          <label className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest transition-colors duration-500">Mensaje</label>
                          <textarea 
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            rows={4}
                            placeholder="¿Cómo podemos ayudarte?"
                            className={`w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border ${errors.message ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-100 dark:border-slate-700 focus:border-sky-500 focus:ring-sky-500/10'} focus:ring-4 outline-none transition-all resize-none font-bold text-slate-900 dark:text-white dark:placeholder-slate-500`}
                          />
                          <AnimatePresence>
                            {errors.message && (
                              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-red-500 text-xs font-bold mt-1 overflow-hidden">{errors.message}</motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={isSubmitting}
                          type="submit"
                          className="w-full py-5 bg-sky-500 hover:bg-sky-400 text-white rounded-2xl font-black text-xl transition-all shadow-2xl shadow-sky-500/30 flex justify-center items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-6 h-6 animate-spin" />
                              Verificando...
                            </>
                          ) : (
                            "Enviar Mensaje"
                          )}
                        </motion.button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Map Container */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative z-10 w-full h-[400px] rounded-[3rem] overflow-hidden shadow-[0_0_50px_rgba(14,165,233,0.15)] border border-slate-800"
              >
                <MapContainer 
                  center={[18.4861, -69.9312]} 
                  zoom={13} 
                  scrollWheelZoom={false} 
                  className="w-full h-full z-0"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  />
                  <Marker position={[18.4861, -69.9312]}>
                    <Popup className="font-sans font-bold text-slate-800">
                      SkyTech Solutions <br /> Distrito Nacional, Santo Domingo.
                    </Popup>
                  </Marker>
                </MapContainer>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 py-20 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
            <div className="col-span-1 lg:col-span-2">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center">
                  <Cloud className="text-white w-6 h-6" />
                </div>
                <span className="text-2xl font-extrabold tracking-tighter text-white">
                  SKY<span className="text-sky-400">TECH</span>
                </span>
              </div>
              <p className="text-slate-500 max-w-sm text-lg leading-relaxed font-medium">
                Liderando la innovación tecnológica con soluciones de infraestructura y seguridad de clase mundial.
              </p>
            </div>
            <div>
              <h4 className="text-white font-black uppercase tracking-widest mb-8">Navegación</h4>
              <ul className="space-y-4">
                {["Inicio", "Servicios", "Nosotros", "Testimonios", "Contacto"].map(item => (
                  <li key={item}>
                    <a href={`#${item.toLowerCase()}`} className="text-slate-500 hover:text-sky-400 transition-colors font-bold">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black uppercase tracking-widest mb-8">Legal</h4>
              <ul className="space-y-4">
                {["Privacidad", "Términos", "Cookies", "Seguridad"].map(item => (
                  <li key={item}>
                    <button 
                      onClick={(e) => { e.preventDefault(); setLegalModalType(item); }} 
                      className="text-slate-500 hover:text-sky-400 transition-colors font-bold text-left bg-transparent"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-slate-900 gap-8">
            <p className="text-slate-600 text-sm font-bold">
              © {new Date().getFullYear()} SkyTech Solutions. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              {[
                { Icon: Linkedin, label: "LinkedIn" },
                { Icon: Twitter, label: "Twitter" },
                { Icon: Instagram, label: "Instagram" },
                { Icon: Github, label: "GitHub" },
              ].map((social, i) => (
                <motion.a 
                  key={i} 
                  href="#"
                  aria-label={social.label}
                  whileHover={{ scale: 1.15, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-sky-400 hover:border-sky-400 hover:shadow-[0_0_15px_rgba(56,189,248,0.4)] transition-all cursor-pointer"
                >
                  <social.Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Cookie Banner */}
      <AnimatePresence>
        {showCookieBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-6 sm:pb-8 sm:px-8 pointer-events-none"
          >
            <div className="max-w-7xl mx-auto flex justify-center pointer-events-auto">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 md:gap-12 w-full transition-colors duration-500">
                <div className="flex items-center gap-4 flex-1 w-full">
                  <div className="w-12 h-12 rounded-full bg-sky-500/10 flex items-center justify-center shrink-0">
                    <Cookie className="w-6 h-6 text-sky-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white mb-1 transition-colors duration-500">Uso de Cookies</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium transition-colors duration-500">
                      Utilizamos cookies para mejorar tu experiencia, analizar el tráfico del sitio y personalizar el contenido.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 shrink-0 w-full md:w-auto">
                  <button 
                    onClick={declineCookies}
                    className="flex-1 md:flex-none px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Rechazar
                  </button>
                  <button 
                    onClick={acceptCookies}
                    className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-sky-500 text-white font-bold hover:bg-sky-400 transition-colors shadow-lg shadow-sky-500/30"
                  >
                    Aceptar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Widget */}
      <ChatWidget />

      {/* Legal Modal Popup */}
      <LegalModal isOpen={!!legalModalType} type={legalModalType} onClose={() => setLegalModalType(null)} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/comando" element={<CommandCenter />} />
      </Routes>
    </BrowserRouter>
  );
}

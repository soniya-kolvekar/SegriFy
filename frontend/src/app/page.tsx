import Link from "next/link";
import { 
  Leaf, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp,
  Landmark,
  Cpu,
  Recycle,
  UserPlus,
  QrCode,
  ScanLine,
  Award,
  Wallet,
  CheckCircle2,
  BarChart3,
  Users,
  Image as ImageIcon
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white-smoke text-ash-brown font-sans overflow-x-hidden selection:bg-dark-khaki selection:text-white-smoke">
      
      <nav className="fixed top-0 left-0 w-full z-50 bg-ash-brown/95 backdrop-blur-xl border-b border-white/10 shadow-xl transition-all duration-300 hover:bg-ash-brown">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-heading font-black tracking-tight flex items-center gap-3 cursor-pointer group">
            <div className="bg-white/5 p-1.5 rounded-xl shadow-inner border border-white/10 group-hover:bg-white/10 group-hover:scale-105 transition-all">
              <img src="/logo.svg" alt="SegriFy Logo" className="w-8 h-8 object-contain drop-shadow-sm brightness-110" />
            </div>
            <span className="text-white-smoke tracking-wide">SegriFy</span>
          </div>
          <Link 
            href="/login" 
            className="bg-dark-khaki text-white-smoke px-7 py-3 rounded-xl text-sm font-black tracking-widest border border-white/10 hover:bg-[#97A758] hover:shadow-[0_8px_20px_rgba(151,167,88,0.4)] hover:-translate-y-0.5 transition-all duration-300"
          >
            SIGN IN
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-3/4 h-[800px] bg-gradient-to-bl from-dark-khaki/10 to-transparent rounded-bl-full blur-3xl -z-10" />

        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
          
          <div className="flex flex-col items-start pr-0 lg:pr-12">
            <div className="bg-[#EAF5CE] mb-6 px-4 py-2 rounded flex items-center gap-2 font-bold text-[10px] tracking-widest text-[#567E14] uppercase border border-[#D5ECA5]">
              <ShieldCheck className="w-4 h-4" />
              Government Certified Initiative
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-black text-ash-brown tracking-[-0.04em] leading-[1.05] mb-6">
              Smart Waste Segregation & <span className="text-dark-khaki">Incentive</span> System
            </h1>
            
            <p className="text-lg md:text-xl text-ash-brown/70 mb-10 max-w-xl font-medium leading-relaxed">
              Driving civic responsibility through precision infrastructure. Join the national movement for a circular economy and earn rewards for every gram of waste correctly segregated.
            </p>
            
            <div className="flex flex-wrap gap-4 w-full sm:w-auto">
              <Link 
                href="/signup" 
                className="bg-ash-brown text-white-smoke px-8 py-4 rounded font-black text-sm tracking-wide shadow-2xl hover:bg-ash-brown/90 transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                GET STARTED
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="relative w-full aspect-[4/3] lg:aspect-square">
            {/* Image Placeholder Block */}
            <div className="w-full h-full bg-ash-brown rounded shadow-2xl overflow-hidden relative group">
              {/* Simulated Image Content */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
              <img 
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80" 
                alt="Plant growing from waste bag" 
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
              />
              
              {/* Overlay Stat Card */}
              <div className="absolute bottom-8 right-8 z-20 bg-white-smoke p-4 pr-16 rounded shadow-2xl border-l-[6px] border-dark-khaki flex items-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
                <div className="bg-dark-khaki p-3 rounded text-white-smoke">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-ash-brown/50 mb-1">Live Efficiency</p>
                  <p className="text-xl font-heading font-black text-ash-brown">98.4% Clean Rate</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Partners Banner */}
      <section className="bg-[#EAECE6] py-16 border-y border-ash-brown/5">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col items-center">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-ash-brown/50 mb-10 text-center">
            Official Partners & Backing
          </p>
          <div className="flex flex-wrap justify-center gap-12 lg:gap-24 items-center opacity-70 grayscale">
            {[
              { icon: Landmark, name: "Municipal\nAuthority" },
              { icon: Leaf, name: "National\nEnvironment" },
              { icon: Cpu, name: "Digital India\nInitiative" },
              { icon: Recycle, name: "Swachh Bharat\nMission" }
            ].map((partner, i) => (
              <div key={i} className="flex items-center gap-3">
                <partner.icon className="w-8 h-8 text-ash-brown" />
                <span className="text-sm font-black text-ash-brown uppercase tracking-wide leading-tight whitespace-pre-line">
                  {partner.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 md:py-32 bg-white-smoke relative">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-black text-ash-brown mb-6 tracking-tight">
              How it works
            </h2>
            <p className="text-lg text-ash-brown/70 max-w-xl font-medium leading-relaxed">
              A simple four-step process designed to integrate seamlessly into your daily routine while ensuring maximum data accuracy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", icon: UserPlus, title: "Register", desc: "Sign up via the official portal with your municipal ID to link your household." },
              { step: "02", icon: QrCode, title: "QR Tag", desc: "Receive smart QR identifiers for your dry and wet waste categories." },
              { step: "03", icon: ScanLine, title: "Scan & Collect", desc: "Our agents scan your bin tags during collection to verify segregation quality." },
              { step: "04", icon: Award, title: "Earn Rewards", desc: "Redeem your 'Clean Points' for tax rebates, utility discounts, or local vouchers." },
            ].map((item, i) => (
              <div key={i} className="bg-[#F0F2ED] p-8 rounded border border-white relative overflow-hidden group hover:shadow-xl hover:border-dark-khaki/20 transition-all duration-300">
                {/* Huge Background Number */}
                <div className="absolute right-4 top-4 text-8xl font-heading font-black text-ash-brown/[0.03] select-none pointer-events-none group-hover:text-dark-khaki/10 transition-colors">
                  {item.step}
                </div>
                
                <div className="relative z-10">
                  <div className="bg-ash-brown w-12 h-12 rounded flex items-center justify-center text-white-smoke mb-6 shadow-md">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-heading font-black text-ash-brown mb-4">{item.title}</h3>
                  <p className="text-sm text-ash-brown/70 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Grid */}
      <section className="py-24 bg-white-smoke">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Side: Title & Info Cards */}
          <div className="lg:col-span-5 flex flex-col justify-start pr-0 lg:pr-10">
            <h2 className="text-4xl md:text-5xl font-heading font-black text-ash-brown mb-6 tracking-tight leading-none">
              Architecting a Cleaner Future <br className="hidden md:block"/>Together
            </h2>
            <p className="text-lg text-ash-brown/70 mb-12 font-medium leading-relaxed">
              We bridge the gap between individual action and civic impact through high-resolution data and transparent incentives.
            </p>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded shadow-sm flex items-start gap-4 border border-[#EAECE6]">
                <CheckCircle2 className="w-6 h-6 text-dark-khaki shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-ash-brown text-lg mb-1">Direct Financial Impact</h4>
                  <p className="text-sm text-ash-brown/70 font-medium leading-relaxed">Save up to 15% on monthly municipal utility bills through consistent segregation.</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded shadow-sm flex items-start gap-4 border border-[#EAECE6]">
                <BarChart3 className="w-6 h-6 text-ash-brown/50 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-ash-brown text-lg mb-1">Hyper-Local Analytics</h4>
                  <p className="text-sm text-ash-brown/70 font-medium leading-relaxed">Municipalities gain real time heatmaps of waste generation for route optimization.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Bento Masonry Layout */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6 h-[700px]">
            
            {/* Column 1 */}
            <div className="flex flex-col gap-6">
              {/* Tall Image Block */}
              <div className="bg-ash-brown rounded flex-1 relative overflow-hidden p-8 flex border border-transparent shadow-lg group">
                <div className="absolute inset-0 z-0">
                  <img src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=600&auto=format&fit=crop" alt="Leaves" className="w-full h-full object-cover opacity-60 mix-blend-luminosity grayscale group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#B0B4A2]/90 to-[#B0B4A2]/60 mix-blend-multiply" />
                </div>
                <div className="relative z-10 flex flex-col justify-end w-full">
                  <h3 className="text-2xl font-black text-ash-brown mb-4 font-heading">Citizen Benefits</h3>
                  <ul className="space-y-2.5 text-sm font-bold text-ash-brown/80 tracking-wide">
                    <li className="flex items-center gap-2 before:content-['•'] before:text-white-smoke">Priority municipal support</li>
                    <li className="flex items-center gap-2 before:content-['•'] before:text-white-smoke">Public recognition badges</li>
                    <li className="flex items-center gap-2 before:content-['•'] before:text-white-smoke">Local economy vouchers</li>
                    <li className="flex items-center gap-2 before:content-['•'] before:text-white-smoke">Cleaner neighborhood air</li>
                  </ul>
                </div>
              </div>

              {/* Square Yellow Block */}
              <div className="bg-[#EBECA4] rounded h-[280px] p-8 flex flex-col justify-between shadow-sm">
                <BarChart3 className="w-8 h-8 text-[#A7AD34]" />
                <h3 className="text-3xl font-black text-[#606322] font-heading tracking-tight leading-none">
                  Data-Driven <br/>Governance
                </h3>
              </div>
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-6">
              {/* Square Green Block */}
              <div className="bg-[#788852] rounded h-[280px] p-8 mt-0 md:mt-12 flex flex-col justify-between shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full border-b border-l border-white/10" />
                <ShieldCheck className="w-8 h-8 text-[#EAF5CE]" />
                <h3 className="text-3xl font-black text-white font-heading tracking-tight">
                  Community <br/>Trust
                </h3>
              </div>

              {/* Tall Gray Block */}
              <div className="bg-[#D1D1D3] rounded flex-1 p-8 flex flex-col relative overflow-hidden shadow-inner">
                {/* Placeholder Illustration Icon */}
                <div className="absolute top-8 right-8 z-0 opacity-20">
                    <Users className="w-32 h-32 text-ash-brown" />
                </div>
                <div className="mt-auto relative z-10">
                  <h3 className="text-2xl font-black text-ash-brown mb-4 font-heading tracking-tight">Municipal Utility</h3>
                  <ul className="space-y-2.5 text-sm font-bold text-ash-brown/70 tracking-wide">
                    <li className="flex items-center gap-2 before:content-['•'] before:text-ash-brown">40% reduction in landfill load</li>
                    <li className="flex items-center gap-2 before:content-['•'] before:text-ash-brown">Lower logistics overheads</li>
                    <li className="flex items-center gap-2 before:content-['•'] before:text-ash-brown">Resource recovery tracking</li>
                    <li className="flex items-center gap-2 before:content-['•'] before:text-ash-brown">Policy making with real data</li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Footer Block */}
      <section className="bg-ash-brown py-24 text-center">
        <div className="max-w-2xl mx-auto px-6 flex flex-col items-center">
          <div className="bg-white-smoke/10 p-4 rounded-xl mb-8">
            <Wallet className="w-10 h-10 text-white-smoke" />
          </div>
          <h2 className="text-4xl md:text-5xl font-heading font-black text-white-smoke mb-6 tracking-tight leading-none">
            Ready to transform your city's waste landscape?
          </h2>
          <p className="text-lg text-white-smoke/60 mb-12 font-medium">
            Join 1.2M+ citizens already contributing to a smarter, cleaner municipality. Registration takes less than 2 minutes.
          </p>
          <div className="flex flex-wrap gap-4 justify-center w-full">
            <Link 
              href="/login" 
              className="bg-white-smoke text-ash-brown px-8 py-4 rounded font-black text-sm tracking-wide hover:bg-white transition-colors w-full sm:w-auto"
            >
              SIGN IN TO DASHBOARD
            </Link>
            <button className="bg-transparent text-white-smoke border border-white-smoke/30 px-8 py-4 rounded font-bold text-sm tracking-wide hover:border-white-smoke/60 hover:bg-white-smoke/5 transition-all w-full sm:w-auto">
              CONTACT AUTHORITY
            </button>
          </div>
        </div>
      </section>

      {/* Legal Footer */}
      <footer className="bg-white-smoke py-8 border-t border-ash-brown/10">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row justify-center items-center gap-4 text-[10px] font-black uppercase tracking-widest text-ash-brown/40">
          <div className="flex gap-6">
            <a href="#" className="hover:text-ash-brown transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-ash-brown transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-ash-brown transition-colors">Accessibility</a>
            <a href="#" className="hover:text-ash-brown transition-colors">Contact</a>
          </div>
          <div className="hidden md:block text-ash-brown/20">•</div>
          <div>© 2026 SegriFy Municipal Infrastructure. All Rights Reserved.</div>
        </div>
      </footer>

    </div>
  );
}


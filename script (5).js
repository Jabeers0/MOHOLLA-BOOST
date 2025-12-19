import React, { useState, useMemo, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Zap, LogIn, LogOut, ChevronDown, User as UserIcon, Settings, 
  ShoppingBag, LifeBuoy, Users, PackageCheck, Star, CheckCircle2, 
  TrendingUp, ShieldAlert, MessageSquare, X, Send, Bot, Loader2, 
  ShieldCheck, Truck, Clock, Headphones, Smartphone, Copy, ArrowLeft, 
  ShoppingCart, Award, Info
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- CONSTANTS ---
const BDT_RATE = 125;
const SYSTEM_INSTRUCTION = `
You are the professional support assistant for "MOHOLLA BOOST", a premium Discord service store.
Services: Server Boosts (14x), Discord Members, Nitro Tokens.
Pricing: Boosts start from $4.99 (Approx ৳625 BDT).
Payment: Manual bKash/Nagad (Personal Send Money).
Delivery: Instant after verification. Support: 24/7.
Be helpful, concise, and professional.
`;

const PRODUCTS = [
  { id: 'b1', title: '14x Server Boosts [1 Month]', description: 'Elevate your community with Level 3 perks instantly. Includes realistic profiles and stability guarantee.', price: '$4.99', features: ['Instant Delivery', 'Realistic profiles', 'Level 3 Perks'], image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=1000', category: 'boosts', stockStatus: 'in_stock', badge: 'Best Seller' },
  { id: 'b2', title: '14x Server Boosts [3 Months]', description: 'Long-term stability for growing servers. Maintain Level 3 perks without interruption.', price: '$12.99', features: ['Instant Delivery', '90 Days Warranty'], image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000', category: 'boosts', stockStatus: 'in_stock' },
  { id: 'm1', title: '1000+ Discord Members', description: 'Boost your server member count safely with high-quality realistic profiles.', price: '$2.50', features: ['Real-looking avatars', 'Low drop rate'], image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1000', category: 'members', stockStatus: 'in_stock' },
  { id: 't1', title: 'Discord Nitro Token', description: 'Private tokens in email:pass:token format. Fully verified.', price: '$3.00', features: ['Instant Delivery', 'Private Tokens'], image: 'https://images.unsplash.com/photo-1614680376739-414d95ff43df?q=80&w=1000', category: 'tokens', stockStatus: 'in_stock' }
];

// --- COMPONENTS ---

const Navbar = ({ user, onLogin, onLogout, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-50 w-full bg-[#120000]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
        <div onClick={() => onNavigate('home')} className="flex items-center gap-2 cursor-pointer group">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)] group-hover:scale-110 transition-all">
            <Zap className="text-white fill-white" size={24} />
          </div>
          <span className="text-xl font-black brand-glow hidden sm:block tracking-tighter ml-2">MOHOLLA BOOST</span>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl hover:bg-white/10 transition-all">
                <img src={user.photoURL} className="w-8 h-8 rounded-full border border-red-500/50" alt="" />
                <span className="text-sm font-bold text-white hidden sm:block">{user.displayName.split(' ')[0]}</span>
                <ChevronDown size={16} className="text-zinc-500" />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-[#1a0000] border border-white/10 rounded-3xl shadow-2xl py-3 overflow-hidden animate-in fade-in slide-in-from-top-4">
                  <button onClick={() => { onNavigate('profile'); setIsMenuOpen(false); }} className="w-full flex items-center gap-4 px-5 py-3 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-all"><UserIcon size={18} /> Profile</button>
                  <div className="h-px bg-white/5 my-2 mx-4"></div>
                  <button onClick={onLogout} className="w-full flex items-center gap-4 px-5 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all"><LogOut size={18} /> Logout</button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={onLogin} className="flex items-center gap-3 px-6 py-3 rounded-2xl btn-primary text-white text-sm font-black uppercase tracking-widest">
              <LogIn size={20} /> <span className="hidden sm:inline">Join Store</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

const Hero = ({ selectedCat, onCatChange }) => {
  const cats = ['All Services', 'Server Boosts', 'Members', 'Nitro Tokens'];
  return (
    <section className="relative py-20 text-center">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-6xl md:text-8xl font-black mb-8 brand-glow uppercase tracking-tighter leading-none">MOHOLLA BOOST</h1>
        <p className="text-zinc-400 max-w-2xl mx-auto text-xl mb-12 font-medium">The ultimate destination for premium Discord community enhancements. Trusted by <span className="text-red-500 font-bold">14k+ elites</span>.</p>
        <div className="flex flex-wrap justify-center gap-3">
          {cats.map(cat => (
            <button key={cat} onClick={() => onCatChange(cat)} className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${selectedCat === cat ? 'bg-red-600 text-white shadow-lg' : 'bg-white/5 text-zinc-400 border border-white/10 hover:bg-white/10'}`}>{cat}</button>
          ))}
        </div>
      </div>
    </section>
  );
};

const ProductCard = ({ product, onBuy, onDetail }) => (
  <div onClick={onDetail} className="glass-card rounded-[40px] overflow-hidden flex flex-col group cursor-pointer h-full">
    <div className="h-56 relative overflow-hidden">
      <img src={product.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0000] to-transparent"></div>
      {product.badge && <span className="absolute top-4 left-4 px-3 py-1 bg-red-600 text-white text-[10px] font-black rounded-full uppercase">{product.badge}</span>}
    </div>
    <div className="p-8 flex flex-col flex-grow">
      <h3 className="text-2xl font-black text-white mb-4 group-hover:text-red-400 transition-colors uppercase">{product.title}</h3>
      <div className="space-y-3 mb-8 flex-grow">
        {product.features.map((f, i) => (
          <div key={i} className="flex items-center gap-2 text-zinc-400 text-sm"><CheckCircle2 size={14} className="text-red-500" /> {f}</div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-6 border-t border-white/5">
        <div>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Price</p>
          <p className="text-2xl font-black text-white">{product.price}</p>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onBuy(); }} className="px-6 py-3 bg-white text-black rounded-2xl font-black uppercase text-xs hover:bg-red-600 hover:text-white transition-all">Buy Now</button>
      </div>
    </div>
  </div>
);

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{ role: 'model', text: 'Hey! I am Moholla AI. How can I assist you today?' }]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim(); setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })), { role: 'user', parts: [{ text: msg }] }],
        config: { systemInstruction: SYSTEM_INSTRUCTION }
      });
      setMessages(prev => [...prev, { role: 'model', text: response.text || '...' }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: 'System busy. Try again soon.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {isOpen ? (
        <div className="w-80 sm:w-96 h-[500px] bg-[#1a0000] border border-white/10 rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          <div className="p-5 bg-white/5 border-b border-white/5 flex justify-between items-center text-white font-black text-xs uppercase tracking-widest">
            <span className="flex items-center gap-2"><Bot className="text-red-500" /> AI Support</span>
            <button onClick={() => setIsOpen(false)}><X /></button>
          </div>
          <div ref={scrollRef} className="flex-grow p-5 overflow-y-auto space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-3xl text-sm ${m.role === 'user' ? 'bg-red-600 text-white shadow-lg' : 'bg-white/5 text-zinc-300'}`}>{m.text}</div>
              </div>
            ))}
            {loading && <Loader2 className="animate-spin text-red-500 mx-auto" />}
          </div>
          <div className="p-5 bg-white/5 border-t border-white/5 flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Ask..." className="flex-grow bg-[#0f0000] border border-white/10 px-4 py-3 rounded-2xl text-white outline-none" />
            <button onClick={handleSend} className="bg-red-600 text-white p-3 rounded-2xl"><Send size={20} /></button>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} className="w-16 h-16 bg-red-600 text-white rounded-3xl flex items-center justify-center shadow-xl hover:scale-110 transition-all"><MessageSquare size={28} /></button>
      )}
    </div>
  );
};

const CheckoutModal = ({ product, onClose, onFinish }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: '', sender: '', trx: '' });
  const bdt = Math.ceil(parseFloat(product.price.replace('$', '')) * BDT_RATE);

  const done = () => {
    onFinish({ id: `#MHL-${Math.floor(Math.random()*9000)+1000}`, productName: product.title, amount: product.price, date: new Date().toLocaleDateString(), status: 'Pending' });
    setStep(4);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#1a0000] border border-white/10 rounded-[40px] p-8 shadow-2xl">
        <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white"><X size={28} /></button>
        {step === 1 && (
          <div className="space-y-8">
            <h2 className="text-2xl font-black text-white uppercase flex items-center gap-3"><ShoppingCart className="text-red-500" /> Checkout</h2>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex gap-4 items-center">
              <img src={product.image} className="w-12 h-12 rounded-xl object-cover" />
              <div><p className="text-white font-bold">{product.title}</p><p className="text-red-400 font-bold">৳{bdt}</p></div>
            </div>
            <input placeholder="Delivery Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 rounded-3xl text-white outline-none" />
            <button onClick={() => setStep(2)} disabled={!form.email} className="w-full py-5 bg-red-600 text-white font-black rounded-3xl disabled:opacity-30">Next Step</button>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-xs font-black text-zinc-500 uppercase tracking-widest text-center mb-4">Select Payment (Personal)</p>
            <button onClick={() => setStep(3)} className="w-full p-6 bg-white/5 border border-white/10 rounded-3xl flex justify-between items-center hover:bg-white/10 text-white font-bold uppercase tracking-wider"><span>bKash</span><span>৳{bdt}</span></button>
            <button onClick={() => setStep(3)} className="w-full p-6 bg-white/5 border border-white/10 rounded-3xl flex justify-between items-center hover:bg-white/10 text-white font-bold uppercase tracking-wider"><span>Nagad</span><span>৳{bdt}</span></button>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center p-6 bg-white/5 rounded-3xl border border-white/10"><p className="text-xs text-zinc-500 uppercase font-black mb-2">Send Money to Personal</p><p className="text-3xl font-black text-white brand-glow">017XXXXXXXX</p></div>
            <input placeholder="Sender Number" value={form.sender} onChange={e => setForm({...form, sender: e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 rounded-3xl text-white outline-none" />
            <input placeholder="Transaction ID" value={form.trx} onChange={e => setForm({...form, trx: e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 rounded-3xl text-white outline-none uppercase" />
            <button onClick={done} disabled={!form.sender || !form.trx} className="w-full py-5 bg-red-600 text-white font-black rounded-3xl disabled:opacity-30">Complete Order</button>
          </div>
        )}
        {step === 4 && (
          <div className="text-center py-10">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20"><CheckCircle2 size={40} className="text-green-500" /></div>
            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Order Received</h3>
            <p className="text-zinc-500 mb-8 leading-relaxed">Our verification team is checking your transaction. Delivery usually takes 15 minutes.</p>
            <button onClick={onClose} className="w-full py-5 bg-white text-black font-black rounded-3xl">Return Home</button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- APP ---
function App() {
  const [view, setView] = useState('home');
  const [selectedCat, setSelectedCat] = useState('All Services');
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('mhl_user');
    if (saved) {
      const u = JSON.parse(saved); setUser(u);
      const o = localStorage.getItem(`orders_${u.uid}`); if (o) setOrders(JSON.parse(o));
    }
  }, []);

  const login = () => {
    const mock = { uid: 'u-1', displayName: 'Elite Buyer', photoURL: 'https://ui-avatars.com/api/?name=EB&background=b91c1c&color=fff' };
    setUser(mock); localStorage.setItem('mhl_user', JSON.stringify(mock));
  };

  const filtered = useMemo(() => {
    if (selectedCat === 'All Services') return PRODUCTS;
    const catMap = { 'Server Boosts': 'boosts', 'Members': 'members', 'Nitro Tokens': 'tokens' };
    return PRODUCTS.filter(p => p.category === catMap[selectedCat]);
  }, [selectedCat]);

  return (
    <div className="min-h-screen">
      <Navbar user={user} onLogin={login} onLogout={() => { setUser(null); localStorage.removeItem('mhl_user'); setView('home'); }} onNavigate={setView} />
      <main className="max-w-7xl mx-auto px-4 pb-20">
        {view === 'home' ? (
          <>
            <Hero selectedCat={selectedCat} onCatChange={setSelectedCat} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-in">
              {filtered.map(p => <ProductCard key={p.id} product={p} onBuy={() => setCheckoutProduct(p)} onDetail={() => {}} />)}
            </div>
            <section className="mt-40 py-16 border-t border-white/5 grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[ { icon: Truck, l: 'Fast Start' }, { icon: ShieldCheck, l: 'Secure Sync' }, { icon: Clock, l: '30D Refill' }, { icon: Headphones, l: '24/7 Live' } ].map((item, i) => (
                <div key={i} className="flex flex-col items-center p-8 glass-card rounded-3xl">
                  <div className="w-14 h-14 bg-red-600/10 rounded-2xl flex items-center justify-center mb-4 text-red-500 border border-red-500/20"><item.icon size={28} /></div>
                  <p className="text-xs font-black uppercase text-zinc-500 tracking-widest">{item.l}</p>
                </div>
              ))}
            </section>
          </>
        ) : (
          <div className="py-20 text-center animate-in fade-in">
            <img src={user?.photoURL} className="w-24 h-24 rounded-full border-4 border-red-600 mx-auto mb-6 shadow-2xl" />
            <h2 className="text-4xl font-black text-white brand-glow uppercase mb-2">{user?.displayName}</h2>
            <p className="text-zinc-500 mb-16 font-black uppercase tracking-widest text-xs">Premium Member</p>
            <div className="max-w-3xl mx-auto glass-card rounded-[40px] p-10 text-left">
              <h3 className="text-lg font-black text-white mb-8 uppercase flex items-center gap-3"><ShoppingBag className="text-red-500" /> Transaction Vault</h3>
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((o, i) => (
                    <div key={i} className="flex justify-between items-center p-6 bg-white/5 border border-white/5 rounded-3xl">
                      <div><p className="text-white font-bold uppercase tracking-tight">{o.productName}</p><p className="text-[10px] text-zinc-500 font-mono mt-1">{o.id} • {o.date}</p></div>
                      <span className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-yellow-500/20">{o.status}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-zinc-500 text-center py-10 italic">No transactions found.</p>}
            </div>
          </div>
        )}
      </main>
      <footer className="py-12 border-t border-white/5 text-center bg-black/40"><p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">&copy; {new Date().getFullYear()} MOHOLLA BOOST • Digital Elite Store</p></footer>
      <ChatBot />
      {checkoutProduct && <CheckoutModal product={checkoutProduct} onClose={() => setCheckoutProduct(null)} onFinish={(o) => {
        const updated = [o, ...orders]; setOrders(updated);
        if(user) localStorage.setItem(`orders_${user.uid}`, JSON.stringify(updated));
      }} />}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
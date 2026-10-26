import { useState } from "react";
import {
  ChevronLeft, ChevronRight, CalendarDays, Clock, CheckCircle2,
  X, LogIn, Scissors, ShoppingBag, Gem, ShoppingCart, Trash2,
  CreditCard, QrCode, Copy, Check, MessageSquare,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type Screen =
  | "login" | "services" | "outros_reason" | "dresses" | "cart"
  | "calendar" | "timeslots" | "checkout" | "confirmed" | "appointments";
type PayMethod = "" | "pix" | "visa" | "mastercard";
type DressCat  = "Casamento" | "Formatura" | "15 Anos" | "Outros";
type FilterCat = "Todos" | DressCat;

interface Service     { id: string; label: string; desc: string; icon: React.ReactNode; duration: string }
interface Dress       { id: string; name: string; category: DressCat; basePrice: number; photo: string }
interface CartItem    { dress: Dress; price: number }
interface Appointment {
  id: string; service: string; serviceReason?: string;
  cartItems: CartItem[]; day: string; time: string; cpf: string;
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function StarSvg({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  );
}

function DressIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2L6 7L3 10L7 13L7 21L17 21L17 13L21 10L18 7L16 2" />
      <path d="M8 2 Q12 5 16 2" />
      <path d="M7 13 Q12 15.5 17 13" />
    </svg>
  );
}

function MCIcon() {
  return (
    <svg width="26" height="18" viewBox="0 0 26 18">
      <circle cx="9"  cy="9" r="9" fill="#EB001B" opacity="0.92" />
      <circle cx="17" cy="9" r="9" fill="#F79E1B" opacity="0.92" />
      <path d="M13 2.8a9 9 0 0 1 0 12.4A9 9 0 0 1 13 2.8z" fill="#FF5F00" />
    </svg>
  );
}

function PixQR() {
  const dots: [number, number][] = [
    [9,0],[11,0],[9,2],[12,2],[10,3],[11,4],[9,5],[12,5],[10,6],[12,6],
    [0,8],[2,8],[4,8],[7,8],[9,8],[11,8],[14,8],[16,8],[18,8],[20,8],
    [1,9],[5,9],[8,9],[12,9],[15,9],[19,9],
    [0,10],[3,10],[7,10],[9,10],[11,10],[16,10],[18,10],[20,10],
    [2,11],[4,11],[6,11],[10,11],[13,11],[17,11],
    [0,12],[5,12],[8,12],[11,12],[14,12],[16,12],[20,12],
    [8,13],[10,13],[12,13],[14,13],[18,13],[20,13],
    [8,14],[11,14],[14,14],[16,14],[18,14],
    [9,15],[13,15],[17,15],[19,15],
    [8,16],[10,16],[12,16],[15,16],[19,16],[20,16],
    [9,17],[11,17],[14,17],[16,17],[18,17],
    [8,18],[12,18],[14,18],[17,18],[19,18],
    [9,19],[11,19],[15,19],[18,19],[20,19],
    [8,20],[10,20],[13,20],[16,20],[19,20],
  ];
  return (
    <div className="w-28 h-28 bg-white rounded-xl p-2 border border-emerald-200 flex items-center justify-center">
      <svg viewBox="0 0 21 21" className="w-full h-full">
        <rect x="0"  y="0"  width="7" height="7" rx="1" fill="#059669"/>
        <rect x="1"  y="1"  width="5" height="5" rx="0.5" fill="white"/>
        <rect x="2"  y="2"  width="3" height="3" fill="#059669"/>
        <rect x="14" y="0"  width="7" height="7" rx="1" fill="#059669"/>
        <rect x="15" y="1"  width="5" height="5" rx="0.5" fill="white"/>
        <rect x="16" y="2"  width="3" height="3" fill="#059669"/>
        <rect x="0"  y="14" width="7" height="7" rx="1" fill="#059669"/>
        <rect x="1"  y="15" width="5" height="5" rx="0.5" fill="white"/>
        <rect x="2"  y="16" width="3" height="3" fill="#059669"/>
        {dots.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#059669" />
        ))}
      </svg>
    </div>
  );
}

// ── Polka-dot background — triple size, staggered ─────────────────────────────
function PolkaDotBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none" aria-hidden="true"
      style={{
        backgroundColor: "#cde8f7",
        backgroundImage: [
          "radial-gradient(circle, #4a1800 12px, transparent 12px)",
          "radial-gradient(circle, #4a1800 12px, transparent 12px)",
        ].join(", "),
        backgroundSize: "60px 60px",
        backgroundPosition: "0 0, 30px 30px",
      }}
    />
  );
}

// ── Primitives ────────────────────────────────────────────────────────────────
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-card rounded-3xl shadow-xl shadow-amber-900/10 border border-border overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

function Btn({
  children, onClick, variant = "primary", disabled = false, className = "",
}: {
  children: React.ReactNode; onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean; className?: string;
}) {
  const base = "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-150 select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";
  const V = {
    primary:   "bg-primary text-primary-foreground hover:bg-blue-800 active:scale-95 shadow-md shadow-blue-200",
    secondary: "bg-secondary text-secondary-foreground hover:bg-amber-950 active:scale-95 shadow-md shadow-amber-200",
    ghost:     "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground active:scale-95",
  };
  return (
    <button className={`${base} ${V[variant]} ${className}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function Header({ title, onBack, right }: { title: string; onBack?: () => void; right?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-6 pt-7 pb-5">
      {onBack && (
        <button onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors shrink-0">
          <ChevronLeft size={20} />
        </button>
      )}
      <h1 className="flex-1 text-xl font-extrabold text-foreground tracking-tight">{title}</h1>
      {right}
    </div>
  );
}

const inputCls = "w-full px-4 py-3 rounded-2xl bg-input-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const MONTHS_PT      = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const WEEKDAYS_SHORT = ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];
const TIME_SLOTS     = ["09:00","09:30","10:00","10:30","11:00","14:00","14:30","15:00","15:30","16:00"];

const formatDate = (d: Date) => {
  const days   = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${days[d.getDay()]}`;
};

const formatCPF = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d.replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})\.(\d{3})(\d)/,"$1.$2.$3").replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/,"$1.$2.$3-$4");
};

const formatCard = (v: string) =>
  v.replace(/\D/g,"").slice(0,16).replace(/(.{4})(?=.)/g,"$1 ");

const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g,"").slice(0,4);
  return d.length > 2 ? `${d.slice(0,2)}/${d.slice(2)}` : d;
};

const getPrice = (base: number, cartSize: number) => Math.round(base * (1 + cartSize * 0.15));

// ── Data ──────────────────────────────────────────────────────────────────────
const SERVICES: Service[] = [
  { id:"retirada", label:"Retirada do Vestido",    desc:"Retire sua peça reservada",      icon:<ShoppingBag size={22}/>, duration:"30 min" },
  { id:"ideal",    label:"Idealização do Vestido", desc:"Crie o vestido dos seus sonhos", icon:<Scissors size={22}/>,    duration:"60 min" },
  { id:"aluguel",  label:"Aluguel de Vestidos",    desc:"Escolha e reserve sua peça",     icon:<DressIcon size={22}/>,   duration:"45 min" },
  { id:"outros",   label:"Outros",                 desc:"Demais atendimentos",             icon:<Gem size={22}/>,         duration:"45 min" },
];

const U = (id: string) => `https://images.unsplash.com/${id}?w=400&h=520&fit=crop&auto=format`;

const BASE_DRESSES: Dress[] = [
  // ── CASAMENTO ──
  { id:"c1", name:"Romântico Ivory",    category:"Casamento", basePrice:480, photo:U("photo-1549417229-7686ac5595fd") },
  { id:"c2", name:"Princesa Clássica",  category:"Casamento", basePrice:520, photo:U("photo-1710090411619-69da74080191") },
  { id:"c3", name:"Floral Delicado",    category:"Casamento", basePrice:450, photo:U("photo-1524048269000-9949b9a70cb0") },
  { id:"c4", name:"Minimalista Chic",   category:"Casamento", basePrice:500, photo:U("photo-1694349327531-eff421067771") },
  { id:"c5", name:"Sereia Elegante",    category:"Casamento", basePrice:560, photo:U("photo-1543290556-86c013a17574") },
  { id:"c6", name:"Renda Fina",         category:"Casamento", basePrice:490, photo:U("photo-1622277430358-f4d134452e2e") },
  { id:"c7", name:"Jardim Branco",      category:"Casamento", basePrice:470, photo:U("photo-1593575620619-602b4ddf6e96") },
  { id:"c8", name:"Floral Primavera",   category:"Casamento", basePrice:440, photo:U("photo-1594816935907-1e8f03b98437") },
  { id:"c9", name:"Nobre Vitoriano",    category:"Casamento", basePrice:530, photo:U("photo-1619693645061-031b0585ebd7") },
  // ── FORMATURA ──
  { id:"f1",  name:"Vermelho Intenso",  category:"Formatura", basePrice:320, photo:U("photo-1583039949165-96ee24b0d8de") },
  { id:"f2",  name:"Azul Brilhante",    category:"Formatura", basePrice:280, photo:U("photo-1776013837789-bcbdfb6e3d12") },
  { id:"f3",  name:"Verde Vibrante",    category:"Formatura", basePrice:300, photo:U("photo-1765229280659-d35a2467b976") },
  { id:"f4",  name:"Rosa Pink",         category:"Formatura", basePrice:340, photo:U("photo-1559629008-529e95644695") },
  { id:"f5",  name:"Preto Profundo",    category:"Formatura", basePrice:380, photo:U("photo-1623580674393-edf6eb7090f8") },
  { id:"f6",  name:"Laranja Radiante",  category:"Formatura", basePrice:260, photo:U("photo-1766801387070-dd48cf6fc7e4") },
  { id:"f7",  name:"Amarelo Sol",       category:"Formatura", basePrice:250, photo:U("photo-1621143814870-d28ef0bb3844") },
  { id:"f8",  name:"Roxo Imperial",     category:"Formatura", basePrice:270, photo:U("photo-1559034750-cdab70a66b8e") },
  { id:"f9",  name:"Branco Moderno",    category:"Formatura", basePrice:290, photo:U("photo-1631234764568-996fab371596") },
  { id:"f10", name:"Dourado Luxo",      category:"Formatura", basePrice:400, photo:U("photo-1728646995777-6dbb354691e3") },
  { id:"f11", name:"Bege Sofisticado",  category:"Formatura", basePrice:240, photo:U("photo-1553076699-6b6250481bd1") },
  { id:"f12", name:"Marrom Chocolate",  category:"Formatura", basePrice:230, photo:U("photo-1776841818497-81abbd62b20d") },
  // ── 15 ANOS — rosa (originais) ──
  { id:"q1",   name:"Jardim das Flores",   category:"15 Anos", basePrice:240, photo:U("photo-1566699282355-55466ad57d5b") },
  { id:"q2",   name:"Sonho Rosa",          category:"15 Anos", basePrice:220, photo:U("photo-1548047825-d315ab5df63f") },
  { id:"q3",   name:"Princesa Coroada",    category:"15 Anos", basePrice:260, photo:U("photo-1565630818262-65cd5df24407") },
  { id:"q4",   name:"Fada Encantada",      category:"15 Anos", basePrice:230, photo:U("photo-1565630916140-8518afed6329") },
  { id:"q5",   name:"Tiara Dourada",       category:"15 Anos", basePrice:280, photo:U("photo-1787031326799-52db12f5ac14") },
  // azul
  { id:"qb1",  name:"Azul Celeste",        category:"15 Anos", basePrice:250, photo:U("photo-1776142749920-2d67143768bb") },
  { id:"qb2",  name:"Azul Real",           category:"15 Anos", basePrice:270, photo:U("photo-1776013837789-bcbdfb6e3d12") },
  { id:"qb3",  name:"Azul Piscina",        category:"15 Anos", basePrice:240, photo:U("photo-1776013113750-9d3f165ff5b3") },
  // vermelho
  { id:"qr1",  name:"Vermelho Rubi",       category:"15 Anos", basePrice:260, photo:U("photo-1764265148862-7ee72a4fb367") },
  { id:"qr2",  name:"Vermelho Cereja",     category:"15 Anos", basePrice:245, photo:U("photo-1781385605587-01ae2d3a0916") },
  { id:"qr3",  name:"Vermelho Escarlate",  category:"15 Anos", basePrice:255, photo:U("photo-1626211274366-35dbf8cdf801") },
  // laranja
  { id:"qo1",  name:"Laranja Tropical",    category:"15 Anos", basePrice:220, photo:U("photo-1622080159549-11537bf939e6") },
  { id:"qo2",  name:"Laranja Pôr do Sol",  category:"15 Anos", basePrice:235, photo:U("photo-1693163314168-d6ffabc5720c") },
  { id:"qo3",  name:"Laranja Queimado",    category:"15 Anos", basePrice:215, photo:U("photo-1766801387070-dd48cf6fc7e4") },
  // amarelo
  { id:"qy1",  name:"Amarelo Canário",     category:"15 Anos", basePrice:200, photo:U("photo-1621143814870-d28ef0bb3844") },
  { id:"qy2",  name:"Amarelo Ouro",        category:"15 Anos", basePrice:215, photo:U("photo-1571682264230-283a290a30ab") },
  { id:"qy3",  name:"Amarelo Limão",       category:"15 Anos", basePrice:195, photo:U("photo-1586470208472-c20956a9996d") },
  // verde
  { id:"qg1",  name:"Verde Menta",         category:"15 Anos", basePrice:230, photo:U("photo-1765229285144-9adddf61410e") },
  { id:"qg2",  name:"Verde Esmeralda",     category:"15 Anos", basePrice:245, photo:U("photo-1700065404033-da12489d9738") },
  { id:"qg3",  name:"Verde Floresta",      category:"15 Anos", basePrice:225, photo:U("photo-1650603697154-e74e4725abcc") },
  // roxo
  { id:"qp1",  name:"Lilás Suave",         category:"15 Anos", basePrice:235, photo:U("photo-1559034750-cdab70a66b8e") },
  { id:"qp2",  name:"Roxo Violeta",        category:"15 Anos", basePrice:250, photo:U("photo-1656574781686-40935ee15db5") },
  { id:"qp3",  name:"Lavanda",             category:"15 Anos", basePrice:225, photo:U("photo-1559034881-41a26a539920") },
  // preto
  { id:"qbl1", name:"Preto Noite",         category:"15 Anos", basePrice:270, photo:U("photo-1742749361123-0436892d8da4") },
  { id:"qbl2", name:"Preto Elegante",      category:"15 Anos", basePrice:285, photo:U("photo-1623580674393-edf6eb7090f8") },
  { id:"qbl3", name:"Preto Clássico",      category:"15 Anos", basePrice:260, photo:"https://images.unsplash.com/flagged/photo-1555298011-46f4fb066cc5?w=400&h=520&fit=crop&auto=format" },
  // holográfico
  { id:"qh1",  name:"Prata Brilhante",     category:"15 Anos", basePrice:290, photo:U("photo-1765229280150-76ce5dbdb026") },
  { id:"qh2",  name:"Holográfico",         category:"15 Anos", basePrice:310, photo:U("photo-1765229283929-a7486cfe1e5a") },
  { id:"qh3",  name:"Glamour Prata",       category:"15 Anos", basePrice:295, photo:U("photo-1765229291008-0bcb59ad6c73") },
  // ── OUTROS ──
  { id:"ot1",  name:"Gala Especial",       category:"Outros",  basePrice:350, photo:U("photo-1776841818487-3383b74bf1f8") },
  { id:"ot2",  name:"Noite de Gala",       category:"Outros",  basePrice:340, photo:U("photo-1761574028992-1a72e1867b3c") },
  { id:"ot3",  name:"Red Carpet",          category:"Outros",  basePrice:360, photo:U("photo-1779974797095-f5b87f5652de") },
  { id:"ot4",  name:"Glamour Total",       category:"Outros",  basePrice:380, photo:U("photo-1779974797016-cf4cd39cf0ab") },
  { id:"ot5",  name:"Tapete Vermelho",     category:"Outros",  basePrice:355, photo:U("photo-1779974797066-eeb81d2d3a96") },
];

// ── FullCalendar ──────────────────────────────────────────────────────────────
function FullCalendar({ selected, onSelect }: { selected: Date | null; onSelect: (d: Date) => void }) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear,  setViewYear]  = useState(today.getFullYear());

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1); } else setViewMonth(m => m-1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y+1); } else setViewMonth(m => m+1); };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const rawFirst = new Date(viewYear, viewMonth, 1).getDay();
  const offset = rawFirst === 0 ? 6 : rawFirst - 1;

  const isUnavail = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    const past = d < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dow = d.getDay();
    return past || dow === 0 || dow === 6;
  };

  const isSel = (day: number) =>
    selected !== null && selected.getDate() === day &&
    selected.getMonth() === viewMonth && selected.getFullYear() === viewYear;

  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted transition-colors">
          <ChevronLeft size={18} className="text-muted-foreground" />
        </button>
        <span className="text-sm font-extrabold text-foreground">{MONTHS_PT[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted transition-colors">
          <ChevronRight size={18} className="text-muted-foreground" />
        </button>
      </div>
      <div className="grid grid-cols-7">
        {WEEKDAYS_SHORT.map(d => <div key={d} className="text-center text-[10px] font-bold text-muted-foreground py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />;
          const ua  = isUnavail(day);
          const sel = isSel(day);
          return (
            <button key={day} disabled={ua}
              onClick={() => onSelect(new Date(viewYear, viewMonth, day))}
              className={[
                "h-8 w-full flex items-center justify-center rounded-xl text-xs font-semibold transition-all",
                sel ? "bg-primary text-primary-foreground shadow-sm" :
                ua  ? "text-muted-foreground/30 cursor-not-allowed" :
                      "hover:bg-primary/12 hover:text-primary cursor-pointer",
              ].join(" ")}>
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Screen: Login ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  return (
    <Card>
      <div className="relative h-44 bg-blue-100 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=300&fit=crop&auto=format"
          alt="Boutique" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/30 to-transparent" />
        <div className="absolute bottom-4 left-6 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-blue-400">
            <StarSvg size={22} color="#fff" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-foreground leading-none tracking-tight">Style</p>
            <p className="text-xs text-muted-foreground font-medium">May L&apos;atelier</p>
          </div>
        </div>
      </div>
      <div className="px-8 pt-6 pb-10 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-muted-foreground">E-mail</label>
          <input type="email" placeholder="seu@email.com" value={email}
            onChange={e => setEmail(e.target.value)} className={inputCls} />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-muted-foreground">Senha</label>
          <input type="password" placeholder="••••••••" value={password}
            onChange={e => setPassword(e.target.value)} className={inputCls} />
        </div>
        <Btn variant="primary" className="w-full py-3.5 text-base mt-1"
          onClick={onLogin} disabled={!email || !password}>
          <LogIn size={18} /> Entrar
        </Btn>
        <p className="text-center text-xs text-muted-foreground">
          Esqueceu a senha?{" "}
          <span className="text-primary font-semibold cursor-pointer hover:underline">Recuperar</span>
        </p>
      </div>
    </Card>
  );
}

// ── Screen: Services ──────────────────────────────────────────────────────────
function ServicesScreen({ selectedId, onSelect, onNext, onViewAppts }: {
  selectedId: string; onSelect: (id: string) => void;
  onNext: () => void; onViewAppts: () => void;
}) {
  return (
    <Card>
      <Header title="Escolha o serviço"
        right={<button onClick={onViewAppts} className="text-xs font-semibold text-primary hover:underline">Meus agendamentos</button>} />
      <div className="px-6 pb-8 flex flex-col gap-3">
        {SERVICES.map(svc => {
          const active = svc.id === selectedId;
          return (
            <button key={svc.id} onClick={() => onSelect(svc.id)}
              className={["flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl border text-left transition-all active:scale-[0.98] cursor-pointer",
                active ? "bg-primary/10 border-primary" : "bg-muted border-border hover:bg-accent hover:border-primary/30"].join(" ")}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${active ? "bg-primary text-primary-foreground" : "bg-card text-secondary border border-border"}`}>
                {svc.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold leading-tight ${active ? "text-primary" : "text-foreground"}`}>{svc.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{svc.desc}</p>
              </div>
              <span className="text-xs font-semibold text-muted-foreground shrink-0">{svc.duration}</span>
            </button>
          );
        })}
        <Btn variant="primary" className="w-full py-3.5 text-base mt-2" onClick={onNext} disabled={!selectedId}>
          {selectedId === "aluguel" ? "Ver vestidos" : selectedId === "outros" ? "Informar motivo" : "Escolher data"}
        </Btn>
      </div>
    </Card>
  );
}

// ── Screen: Outros Reason ─────────────────────────────────────────────────────
function OutrosReasonScreen({ value, onChange, onNext, onBack }: {
  value: string; onChange: (v: string) => void; onNext: () => void; onBack: () => void;
}) {
  return (
    <Card>
      <Header title="Motivo da visita" onBack={onBack} />
      <div className="px-6 pb-8 flex flex-col gap-5">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/10 text-secondary text-sm font-semibold w-fit">
          <MessageSquare size={14} /> Nos conte o que você precisa
        </div>
        <textarea value={value} onChange={e => onChange(e.target.value)}
          placeholder="Descreva o motivo da sua visita..."
          rows={5}
          className="w-full px-4 py-3 rounded-2xl bg-input-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none" />
        <Btn variant="primary" className="w-full py-3.5 text-base" onClick={onNext} disabled={value.trim().length < 10}>
          <CalendarDays size={17} /> Escolher data
        </Btn>
      </div>
    </Card>
  );
}

// ── Screen: Dresses ───────────────────────────────────────────────────────────
function DressesScreen({ catalog, cart, onAddToCart, onOpenCart, onBack }: {
  catalog: Dress[]; cart: CartItem[];
  onAddToCart: (d: Dress) => void; onOpenCart: () => void; onBack: () => void;
}) {
  const [filter, setFilter] = useState<FilterCat>("Todos");
  const cats: FilterCat[] = ["Todos","Casamento","Formatura","15 Anos","Outros"];
  const visible = filter === "Todos" ? catalog : catalog.filter(d => d.category === filter);

  return (
    <Card>
      <Header title="Escolha os vestidos" onBack={onBack}
        right={
          <button onClick={onOpenCart}
            className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-white hover:bg-blue-800 transition-colors">
            <ShoppingCart size={18} />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-secondary text-white text-[10px] font-extrabold flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
        }
      />
      <div className="px-6 pb-8 flex flex-col gap-3">
        {/* Category tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {cats.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={["px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0",
                filter === cat ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-accent"].join(" ")}>
              {cat}
            </button>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-secondary font-semibold">
            <ShoppingCart size={12} />
            {cart.length} peça{cart.length > 1 ? "s" : ""} · preços atualizados
          </div>
        )}

        {visible.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <DressIcon size={36} />
            <p className="text-sm text-muted-foreground">Todos os vestidos desta categoria foram reservados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 max-h-[400px] overflow-y-auto pr-0.5">
            {visible.map(dress => (
              <button key={dress.id} onClick={() => onAddToCart(dress)}
                className="flex flex-col rounded-2xl overflow-hidden border border-border hover:border-primary/50 hover:shadow-md hover:shadow-blue-100 text-left transition-all active:scale-[0.97] cursor-pointer bg-card">
                <div className="relative h-40 bg-muted overflow-hidden">
                  <img src={dress.photo} alt={dress.name} className="w-full h-full object-cover object-top" />
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-lg bg-card/90 text-[9px] font-bold text-secondary">
                    {dress.category}
                  </span>
                </div>
                <div className="px-2.5 py-2">
                  <p className="text-xs font-bold text-foreground leading-tight">{dress.name}</p>
                  <p className="text-xs font-semibold text-primary mt-0.5">R$ {getPrice(dress.basePrice, cart.length)}/dia</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

// ── Screen: Cart ──────────────────────────────────────────────────────────────
function CartScreen({ cart, onRemove, onContinue, onBack }: {
  cart: CartItem[]; onRemove: (id: string) => void;
  onContinue: () => void; onBack: () => void;
}) {
  const total = cart.reduce((s, i) => s + i.price, 0);
  return (
    <Card>
      <Header title="Carrinho" onBack={onBack} />
      <div className="px-6 pb-8 flex flex-col gap-4">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <ShoppingCart size={36} className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Carrinho vazio.</p>
            <Btn variant="ghost" className="px-6 py-2.5 text-sm" onClick={onBack}>Ver vestidos</Btn>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-0.5">
              {cart.map(item => (
                <div key={item.dress.id} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-muted border border-border">
                  <div className="w-12 h-14 rounded-xl overflow-hidden bg-blue-50 shrink-0">
                    <img src={item.dress.photo} alt={item.dress.name} className="w-full h-full object-cover object-top" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{item.dress.name}</p>
                    <p className="text-[10px] text-muted-foreground">{item.dress.category}</p>
                    <p className="text-xs font-semibold text-primary">R$ {item.price}/dia</p>
                  </div>
                  <button onClick={() => onRemove(item.dress.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-primary/8 border border-primary/20">
              <span className="text-sm font-semibold text-foreground">Total estimado</span>
              <span className="text-base font-extrabold text-primary">R$ {total}/dia</span>
            </div>
            <Btn variant="primary" className="w-full py-3.5 text-base" onClick={onContinue}>
              <CalendarDays size={17} /> Escolher data
            </Btn>
            <Btn variant="ghost" className="w-full py-2.5 text-sm" onClick={onBack}>
              Continuar escolhendo
            </Btn>
          </>
        )}
      </div>
    </Card>
  );
}

// ── Screen: Calendar ──────────────────────────────────────────────────────────
function CalendarScreen({ serviceName, cartSize, selectedDate, onSelectDate, onNext, onBack }: {
  serviceName: string; cartSize: number;
  selectedDate: Date | null; onSelectDate: (d: Date) => void;
  onNext: () => void; onBack: () => void;
}) {
  return (
    <Card>
      <Header title="Escolha a data" onBack={onBack} />
      <div className="px-6 pb-8 flex flex-col gap-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/10 text-secondary text-sm font-semibold w-fit">
          <DressIcon size={13} /> {serviceName}
          {cartSize > 0 && <span className="ml-1 text-xs font-normal opacity-70">· {cartSize} peça{cartSize > 1 ? "s" : ""}</span>}
        </div>
        <FullCalendar selected={selectedDate} onSelect={onSelectDate} />
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-primary/20 inline-block"/>Disponível</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-muted/50 inline-block"/>Indisponível/fim de semana</span>
        </div>
        <Btn variant="primary" className="w-full py-3.5 text-base" onClick={onNext} disabled={!selectedDate}>
          <Clock size={17} /> Ver horários
        </Btn>
      </div>
    </Card>
  );
}

// ── Screen: Time Slots ────────────────────────────────────────────────────────
function TimeSlotsScreen({ day, serviceName, selectedTime, onSelectTime, onBack, onNext }: {
  day: string; serviceName: string; selectedTime: string;
  onSelectTime: (t: string) => void; onBack: () => void; onNext: () => void;
}) {
  return (
    <Card>
      <Header title="Horários" onBack={onBack} />
      <div className="px-6 pb-8 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent/70 text-accent-foreground text-sm font-semibold w-fit">
            <CalendarDays size={14} /> {day}
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/10 text-secondary text-sm font-semibold w-fit">
            <DressIcon size={13} /> {serviceName}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {TIME_SLOTS.map(slot => (
            <button key={slot} onClick={() => onSelectTime(slot)}
              className={["flex items-center justify-center gap-1.5 py-3 rounded-2xl border text-sm font-semibold transition-all active:scale-95 cursor-pointer",
                selectedTime === slot
                  ? "bg-primary text-primary-foreground border-primary shadow-md shadow-blue-200"
                  : "border-border bg-muted hover:bg-accent hover:border-primary/30"].join(" ")}>
              <Clock size={13} /> {slot}
            </button>
          ))}
        </div>
        <Btn variant="primary" className="w-full py-3.5 text-base mt-1" onClick={onNext} disabled={!selectedTime}>
          <CreditCard size={18} /> Ir para pagamento
        </Btn>
      </div>
    </Card>
  );
}

// ── Screen: Checkout ──────────────────────────────────────────────────────────
function CheckoutScreen({ onConfirm, onBack }: { onConfirm: (cpf: string) => void; onBack: () => void }) {
  const [method,   setMethod]   = useState<PayMethod>("");
  const [cardNum,  setCardNum]  = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry,   setExpiry]   = useState("");
  const [cvv,      setCvv]      = useState("");
  const [cpf,      setCpf]      = useState("");
  const [copied,   setCopied]   = useState(false);

  const isCard    = method === "visa" || method === "mastercard";
  const cardOk    = cardNum.length >= 19 && cardName.trim().length > 2 && expiry.length === 5 && cvv.length >= 3;
  const canConfirm = method !== "" && cpf.length === 14 && (method === "pix" || cardOk);

  const pixKey = "style@maylatelier.com.br";
  const copyPix = () => {
    navigator.clipboard.writeText(pixKey).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const payBtn = (id: PayMethod, label: React.ReactNode, accent: string, active: string) => (
    <button onClick={() => setMethod(id)}
      className={["flex flex-col items-center gap-1.5 py-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer",
        method === id ? active : `bg-muted border-border text-muted-foreground ${accent}`].join(" ")}>
      {label}
    </button>
  );

  return (
    <Card>
      <Header title="Pagamento" onBack={onBack} />
      <div className="px-6 pb-8 flex flex-col gap-5 max-h-[82vh] overflow-y-auto">
        {/* Method */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-3">Forma de pagamento</p>
          <div className="grid grid-cols-3 gap-2">
            {payBtn("pix",        <><QrCode size={22}/>Pix</>,        "hover:border-emerald-400", "bg-emerald-50 border-emerald-500 text-emerald-700")}
            {payBtn("visa",       <><CreditCard size={22}/><span className="italic font-black tracking-tighter">VISA</span></>, "hover:border-primary/50",  "bg-blue-50 border-primary text-primary")}
            {payBtn("mastercard", <><MCIcon/>Mastercard</>,            "hover:border-orange-400",  "bg-orange-50 border-orange-500 text-orange-700")}
          </div>
        </div>

        {/* Pix */}
        {method === "pix" && (
          <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <PixQR />
            <p className="text-xs text-muted-foreground">Chave Pix</p>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-border w-full">
              <span className="flex-1 text-xs font-mono text-foreground truncate">{pixKey}</span>
              <button onClick={copyPix} className="text-emerald-600 hover:text-emerald-800 transition-colors">
                {copied ? <Check size={14}/> : <Copy size={14}/>}
              </button>
            </div>
          </div>
        )}

        {/* Card form */}
        {isCard && (
          <div className="flex flex-col gap-3">
            <Field label="Número do cartão">
              <input value={cardNum} onChange={e => setCardNum(formatCard(e.target.value))}
                placeholder="0000 0000 0000 0000" className={inputCls} />
            </Field>
            <Field label="Nome no cartão">
              <input value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())}
                placeholder="NOME COMO NO CARTÃO" className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Validade">
                <input value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/AA" className={inputCls} />
              </Field>
              <Field label="CVV">
                <input value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g,"").slice(0,4))}
                  placeholder="000" className={inputCls} />
              </Field>
            </div>
          </div>
        )}

        {/* CPF */}
        <Field label="CPF">
          <input value={cpf} onChange={e => setCpf(formatCPF(e.target.value))}
            placeholder="000.000.000-00" className={inputCls} />
        </Field>

        <Btn variant="primary" className="w-full py-3.5 text-base" onClick={() => onConfirm(cpf)} disabled={!canConfirm}>
          <CheckCircle2 size={18} /> Confirmar Agendamento
        </Btn>
      </div>
    </Card>
  );
}

// ── Screen: Confirmed ─────────────────────────────────────────────────────────
function ConfirmedScreen({ onDone }: { onDone: () => void }) {
  return (
    <Card>
      <div className="flex flex-col items-center gap-4 py-16 px-8 text-center">
        <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center shadow-lg shadow-blue-300">
          <CheckCircle2 size={42} className="text-white" />
        </div>
        <h1 className="text-2xl font-extrabold text-foreground">Agendado!</h1>
        <p className="text-sm text-muted-foreground">Sua reserva foi confirmada com sucesso.</p>
        <Btn variant="primary" className="px-8 py-3.5 text-base mt-2" onClick={onDone}>
          Ver agendamentos
        </Btn>
      </div>
    </Card>
  );
}

// ── Screen: Appointments ──────────────────────────────────────────────────────
function AppointmentsScreen({ appointments, onCancel, onBack }: {
  appointments: Appointment[]; onCancel: (id: string) => void; onBack: () => void;
}) {
  const svcLabel = (id: string) => SERVICES.find(s => s.id === id)?.label ?? id;
  return (
    <Card>
      <Header title="Meus agendamentos" onBack={onBack} />
      <div className="px-6 pb-8 flex flex-col gap-3">
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <DressIcon size={36} />
            <p className="text-muted-foreground text-sm">Nenhum agendamento ainda.</p>
            <Btn variant="secondary" className="px-6 py-2.5 text-sm mt-1" onClick={onBack}>Agendar agora</Btn>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground font-medium pb-1">
              {appointments.length} agendamento{appointments.length > 1 ? "s" : ""}
            </p>
            {appointments.map(appt => (
              <div key={appt.id} className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl bg-muted border border-border">
                <div className="flex items-center gap-3 min-w-0">
                  {appt.cartItems.length > 0 ? (
                    <div className="w-10 h-12 rounded-xl overflow-hidden shrink-0 bg-blue-50">
                      <img src={appt.cartItems[0].dress.photo} alt={appt.cartItems[0].dress.name}
                        className="w-full h-full object-cover object-top" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <DressIcon size={17} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground leading-tight truncate">{svcLabel(appt.service)}</p>
                    {appt.cartItems.length > 0 && (
                      <p className="text-xs text-primary font-semibold">{appt.cartItems.length} peça{appt.cartItems.length > 1 ? "s" : ""}</p>
                    )}
                    {appt.serviceReason && (
                      <p className="text-xs text-muted-foreground italic truncate">"{appt.serviceReason.slice(0,30)}..."</p>
                    )}
                    <p className="text-xs text-muted-foreground">{appt.day} · {appt.time}</p>
                  </div>
                </div>
                <button onClick={() => onCancel(appt.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors shrink-0">
                  <X size={16} />
                </button>
              </div>
            ))}
            <Btn variant="secondary" className="w-full py-3 text-sm mt-2" onClick={onBack}>
              <CalendarDays size={16} /> Novo agendamento
            </Btn>
          </>
        )}
      </div>
    </Card>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen,        setScreen]      = useState<Screen>("login");
  const [serviceId,     setServiceId]   = useState("");
  const [serviceReason, setReason]      = useState("");
  const [catalog,       setCatalog]     = useState<Dress[]>(BASE_DRESSES);
  const [cart,          setCart]        = useState<CartItem[]>([]);
  const [selectedDate,  setDate]        = useState<Date | null>(null);
  const [selectedTime,  setTime]        = useState("");
  const [appointments,  setAppts]       = useState<Appointment[]>([]);

  const service = SERVICES.find(s => s.id === serviceId);

  const goNext = () => {
    if (serviceId === "aluguel")  { setCart([]); setCatalog(BASE_DRESSES); setScreen("dresses"); }
    else if (serviceId === "outros") { setScreen("outros_reason"); }
    else { setDate(null); setTime(""); setScreen("calendar"); }
  };

  const addToCart = (dress: Dress) => {
    setCart(prev => [...prev, { dress, price: getPrice(dress.basePrice, prev.length) }]);
    setCatalog(prev => prev.filter(d => d.id !== dress.id));
  };

  const removeFromCart = (dressId: string) => {
    const item = cart.find(c => c.dress.id === dressId);
    if (!item) return;
    setCart(prev => prev.filter(c => c.dress.id !== dressId));
    setCatalog(prev =>
      [...prev, item.dress].sort((a, b) =>
        BASE_DRESSES.findIndex(d => d.id === a.id) - BASE_DRESSES.findIndex(d => d.id === b.id)
      )
    );
  };

  const book = (cpf: string) => {
    setAppts(prev => [...prev, {
      id: Date.now().toString(),
      service: serviceId,
      serviceReason: serviceReason || undefined,
      cartItems: [...cart],
      day: selectedDate ? formatDate(selectedDate) : "",
      time: selectedTime,
      cpf,
    }]);
    setCart([]);
    setScreen("confirmed");
  };

  const cancelAppt = (id: string) => {
    const appt = appointments.find(a => a.id === id);
    if (appt?.cartItems.length) {
      setCatalog(prev =>
        [...prev, ...appt.cartItems.map(c => c.dress)].sort((a, b) =>
          BASE_DRESSES.findIndex(d => d.id === a.id) - BASE_DRESSES.findIndex(d => d.id === b.id)
        )
      );
    }
    setAppts(prev => prev.filter(a => a.id !== id));
  };

  const calBack = () =>
    serviceId === "aluguel" ? setScreen("cart") :
    serviceId === "outros"  ? setScreen("outros_reason") :
    setScreen("services");

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4"
      style={{ fontFamily: "'Nunito', sans-serif" }}>
      <PolkaDotBackground />
      <div className="relative z-10 w-full max-w-sm">
        {screen === "login" && <LoginScreen onLogin={() => setScreen("services")} />}

        {screen === "services" && (
          <ServicesScreen selectedId={serviceId} onSelect={setServiceId}
            onNext={goNext} onViewAppts={() => setScreen("appointments")} />
        )}

        {screen === "outros_reason" && (
          <OutrosReasonScreen value={serviceReason} onChange={setReason}
            onNext={() => { setDate(null); setTime(""); setScreen("calendar"); }}
            onBack={() => setScreen("services")} />
        )}

        {screen === "dresses" && (
          <DressesScreen catalog={catalog} cart={cart}
            onAddToCart={addToCart} onOpenCart={() => setScreen("cart")}
            onBack={() => setScreen("services")} />
        )}

        {screen === "cart" && (
          <CartScreen cart={cart} onRemove={removeFromCart}
            onContinue={() => { setDate(null); setTime(""); setScreen("calendar"); }}
            onBack={() => setScreen("dresses")} />
        )}

        {screen === "calendar" && (
          <CalendarScreen serviceName={service?.label ?? ""} cartSize={cart.length}
            selectedDate={selectedDate} onSelectDate={setDate}
            onNext={() => { setTime(""); setScreen("timeslots"); }}
            onBack={calBack} />
        )}

        {screen === "timeslots" && (
          <TimeSlotsScreen day={selectedDate ? formatDate(selectedDate) : ""}
            serviceName={service?.label ?? ""}
            selectedTime={selectedTime} onSelectTime={setTime}
            onBack={() => setScreen("calendar")}
            onNext={() => setScreen("checkout")} />
        )}

        {screen === "checkout" && (
          <CheckoutScreen onConfirm={book} onBack={() => setScreen("timeslots")} />
        )}

        {screen === "confirmed" && <ConfirmedScreen onDone={() => setScreen("appointments")} />}

        {screen === "appointments" && (
          <AppointmentsScreen appointments={appointments}
            onCancel={cancelAppt} onBack={() => setScreen("services")} />
        )}
      </div>
    </div>
  );
}

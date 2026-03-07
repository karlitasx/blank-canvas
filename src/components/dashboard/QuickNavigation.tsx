import { useNavigate } from "react-router-dom";
import { 
  Target, 
  Wallet, 
  Briefcase, 
  Heart, 
  Users, 
  User,
  Shield,
  ChevronRight 
} from "lucide-react";

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  gradient: string;
  onClick: () => void;
}

const NavButton = ({ icon, label, description, gradient, onClick }: NavButtonProps) => (
  <button
    onClick={onClick}
    className={`glass-card p-4 text-left group hover:scale-105 active:scale-95 transition-all duration-300 relative overflow-hidden`}
  >
    {/* Background gradient on hover */}
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
    
    <div className="relative z-10 flex items-center gap-4">
      <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm md:text-base truncate group-hover:text-primary transition-colors">{label}</p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all duration-300" />
    </div>
  </button>
);

const QuickNavigation = () => {
  const navigate = useNavigate();

  const navItems = [
    {
      icon: <Target className="w-6 h-6 text-white" />,
      label: "Hábitos & Metas",
      description: "Acompanhe seus hábitos diários",
      gradient: "from-purple-500 to-indigo-600",
      path: "/habits",
    },
    {
      icon: <Wallet className="w-6 h-6 text-white" />,
      label: "Finanças Pessoais",
      description: "Controle suas finanças",
      gradient: "from-emerald-500 to-teal-600",
      path: "/finances",
    },
    {
      icon: <Briefcase className="w-6 h-6 text-white" />,
      label: "Finanças do Negócio",
      description: "Gestão empresarial",
      gradient: "from-blue-500 to-cyan-600",
      path: "/finances",
    },
    {
      icon: <Heart className="w-6 h-6 text-white" />,
      label: "Autocuidado",
      description: "Cuide do seu bem-estar",
      gradient: "from-pink-500 to-rose-600",
      path: "/selfcare",
    },
    {
      icon: <Shield className="w-6 h-6 text-white" />,
      label: "Reserva de Emergência",
      description: "Calculadora financeira",
      gradient: "from-violet-500 to-purple-600",
      path: "/finances",
    },
    {
      icon: <Users className="w-6 h-6 text-white" />,
      label: "Comunidade",
      description: "Conecte-se com outros",
      gradient: "from-orange-500 to-amber-600",
      path: "/community",
    },
    {
      icon: <User className="w-6 h-6 text-white" />,
      label: "Perfil",
      description: "Suas configurações",
      gradient: "from-slate-500 to-gray-600",
      path: "/profile",
    },
  ];

  return (
    <div className="animate-fade-in">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span>🚀</span>
        Acesso Rápido
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {navItems.map((item) => (
          <NavButton
            key={item.label}
            icon={item.icon}
            label={item.label}
            description={item.description}
            gradient={item.gradient}
            onClick={() => navigate(item.path)}
          />
        ))}
      </div>
    </div>
  );
};

export default QuickNavigation;

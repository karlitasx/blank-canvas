import { useState, useRef } from "react";
import { Users, ArrowRight, Clock, Star, Sparkles, Crown, TrendingUp, Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GroupDetailView } from "./GroupDetailView";

interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  members: number;
  emoji: string;
  isJoined: boolean;
  comingSoon?: boolean;
  accent: string;
  defaultBanner: string;
}

const BANNER_STORAGE_KEY = "group-banners-urls";

const getStoredBanners = (): Record<string, string> => {
  try {
    const stored = localStorage.getItem(BANNER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const storeBannerUrl = (groupId: string, url: string) => {
  const banners = getStoredBanners();
  banners[groupId] = url;
  localStorage.setItem(BANNER_STORAGE_KEY, JSON.stringify(banners));
};

const mockGroups: Group[] = [
  {
    id: "1",
    name: "Educação Financeira",
    description: "Aprenda a organizar suas finanças, investir com segurança e construir uma vida financeira equilibrada.",
    category: "Finanças",
    members: 0,
    emoji: "💰",
    isJoined: false,
    comingSoon: true,
    accent: "hsl(var(--primary))",
    defaultBanner: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=200&fit=crop",
  },
  {
    id: "2",
    name: "Clube do Livro",
    description: "Compartilhe suas leituras favoritas, discuta livros sobre finanças, desenvolvimento pessoal e histórias inspiradoras.",
    category: "Cultura",
    members: 0,
    emoji: "📚",
    isJoined: false,
    comingSoon: true,
    accent: "hsl(var(--secondary))",
    defaultBanner: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=200&fit=crop",
  },
  {
    id: "3",
    name: "Divulgue Seu Trabalho",
    description: "Seu espaço para brilhar! Compartilhe seus projetos, serviços e empreendimentos. Faça networking e conecte-se.",
    category: "Networking",
    members: 0,
    emoji: "💼",
    isJoined: false,
    comingSoon: true,
    accent: "hsl(var(--accent))",
    defaultBanner: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&h=200&fit=crop",
  },
  {
    id: "4",
    name: "Grupo das Empreendedoras",
    description: "Não precisa mais se sentir sozinha nessa jornada! Aprenda estratégias para alavancar seu negócio e faça conexões.",
    category: "Empreendedorismo",
    members: 0,
    emoji: "🚀",
    isJoined: false,
    comingSoon: true,
    accent: "hsl(var(--warning))",
    defaultBanner: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=600&h=200&fit=crop",
  },
  {
    id: "5",
    name: "Autocuidado & Bem-estar",
    description: "Troque experiências sobre saúde mental, rotinas de autocuidado e hábitos saudáveis com outras mulheres.",
    category: "Saúde",
    members: 0,
    emoji: "🧘‍♀️",
    isJoined: false,
    comingSoon: true,
    accent: "hsl(var(--success))",
    defaultBanner: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=200&fit=crop",
  },
  {
    id: "6",
    name: "Metas & Produtividade",
    description: "Defina metas, compartilhe conquistas e mantenha-se motivada com apoio da comunidade.",
    category: "Produtividade",
    members: 0,
    emoji: "🎯",
    isJoined: false,
    comingSoon: true,
    accent: "hsl(var(--ring))",
    defaultBanner: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&h=200&fit=crop",
  },
];

const GroupCard = ({ group, index, onSelect }: { group: Group; index: number; onSelect: (group: Group) => void }) => {
  const [hovered, setHovered] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [bannerUrl, setBannerUrl] = useState(() => {
    const stored = getStoredBanners();
    return stored[group.id] || group.defaultBanner;
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB.");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `group-${group.id}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("group-banners")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("group-banners")
        .getPublicUrl(fileName);

      setBannerUrl(urlData.publicUrl);
      storeBannerUrl(group.id, urlData.publicUrl);
      toast.success("Banner atualizado!");
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao enviar imagem.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div
      className="group relative bg-card rounded-2xl border border-border overflow-hidden flex flex-col transition-all duration-500 hover:shadow-xl hover:-translate-y-1 animate-fade-in"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "both" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Banner Image */}
      <div className="relative h-32 sm:h-36 overflow-hidden">
        <img
          src={bannerUrl}
          alt={`Banner ${group.name}`}
          className="w-full h-full object-cover transition-transform duration-700"
          style={{ transform: hovered ? "scale(1.05)" : "scale(1)" }}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Edit banner button */}
        <button
          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
          disabled={uploading}
          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/60 transition-all duration-300 opacity-0 group-hover:opacity-100"
          title="Alterar banner"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Camera className="w-4 h-4" />
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleBannerUpload}
        />

        {/* Badges on banner */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <Badge className="bg-black/30 text-white border-0 backdrop-blur-sm text-[10px] font-medium">
            {group.category}
          </Badge>
          {group.comingSoon && (
            <Badge className="bg-accent/80 text-accent-foreground border-0 backdrop-blur-sm text-[10px] font-medium gap-1">
              <Clock className="w-2.5 h-2.5" />
              Em Breve
            </Badge>
          )}
        </div>

        {/* Title on banner */}
        <div className="absolute bottom-3 left-4 right-4 flex items-end gap-2.5">
          <span
            className="text-2xl transition-transform duration-500 inline-block drop-shadow-md"
            style={{ transform: hovered ? "scale(1.15) rotate(-5deg)" : "scale(1) rotate(0deg)" }}
          >
            {group.emoji}
          </span>
          <h3 className="font-bold text-white text-base leading-tight drop-shadow-md truncate">
            {group.name}
          </h3>
          {group.isJoined && (
            <Crown className="w-4 h-4 text-warning drop-shadow-md flex-shrink-0" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {group.description}
        </p>

        {/* Footer */}
        <div className="mt-auto pt-1 flex items-end justify-between">
          <span className="text-xs text-primary font-medium">Acessar grupo →</span>
        </div>
      </div>
    </div>
  );
};

const GroupsTab = () => {
  const [subTab, setSubTab] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const joinedGroups = mockGroups.filter((g) => g.isJoined);
  const availableGroups = mockGroups.filter((g) => !g.isJoined && !g.comingSoon);
  const comingSoonGroups = mockGroups.filter((g) => g.comingSoon);

  const getFilteredGroups = () => {
    switch (subTab) {
      case "joined":
        return joinedGroups;
      case "discover":
        return [...availableGroups, ...comingSoonGroups];
      default:
        return mockGroups;
    }
  };

  const filteredGroups = getFilteredGroups();

  // If a group is selected, show the detail view
  if (selectedGroup) {
    const storedBanners = getStoredBanners();
    return (
      <GroupDetailView
        group={{
          id: selectedGroup.id,
          name: selectedGroup.name,
          description: selectedGroup.description,
          emoji: selectedGroup.emoji,
          category: selectedGroup.category,
          bannerUrl: storedBanners[selectedGroup.id] || selectedGroup.defaultBanner,
        }}
        onBack={() => setSelectedGroup(null)}
        isSubscriber={false}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Sub-tabs */}
      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList className="bg-muted/50 w-full sm:w-auto rounded-full p-1">
          <TabsTrigger value="all" className="text-xs sm:text-sm rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300">
            <Star className="w-3.5 h-3.5 sm:mr-1.5" />
            <span>Todos</span>
            <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0 hidden sm:inline-flex">
              {mockGroups.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="joined" className="text-xs sm:text-sm rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300">
            <Crown className="w-3.5 h-3.5 sm:mr-1.5" />
            <span>Meus Grupos</span>
            {joinedGroups.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0 hidden sm:inline-flex">
                {joinedGroups.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="discover" className="text-xs sm:text-sm rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300">
            <Sparkles className="w-3.5 h-3.5 sm:mr-1.5" />
            <span>Descobrir</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredGroups.map((group, i) => (
          <GroupCard key={group.id} group={group} index={i} onSelect={setSelectedGroup} />
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-16 bg-card rounded-2xl border border-border animate-fade-in">
          <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
          <h3 className="font-semibold text-foreground mb-1">Nenhum grupo encontrado</h3>
          <p className="text-sm text-muted-foreground">Explore outros grupos disponíveis!</p>
        </div>
      )}
    </div>
  );
};

export default GroupsTab;

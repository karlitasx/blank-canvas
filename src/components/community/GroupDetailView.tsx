import { useState } from "react";
import { ArrowLeft, MessageSquare, Calendar, FileText, Settings, Lock, Heart, MessageCircle, ExternalLink, Send, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface GroupPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  link?: string;
  linkTitle?: string;
  createdAt: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
  expanded: boolean;
}

interface GroupDetailViewProps {
  group: {
    id: string;
    name: string;
    description: string;
    emoji: string;
    category: string;
    bannerUrl: string;
  };
  onBack: () => void;
  isSubscriber?: boolean;
}

const MOCK_POSTS: GroupPost[] = [
  {
    id: "1",
    authorName: "Vértice App",
    authorAvatar: "🌱",
    content: "Estamos começando uma nova etapa da nossa jornada em educação financeira! Dessa vez vamos falar sobre como organizar suas finanças pessoais de forma prática e eficiente.\n\nNesse conteúdo você vai entender:\n• Como criar um orçamento simples\n• Dicas para economizar no dia a dia\n• Como definir prioridades financeiras",
    link: "https://verticegroup1.lovable.app",
    linkTitle: "Guia de Finanças Pessoais",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    likes: 12,
    comments: 3,
    isLiked: false,
    expanded: false,
  },
  {
    id: "2",
    authorName: "Vértice App",
    authorAvatar: "🌱",
    content: "No post anterior, falamos sobre base, processo e visão de longo prazo.\nAgora, vamos avançar um passo.\n\nEntender investimentos não é apenas escolher onde colocar seu dinheiro — é saber proteger o que você já conquistou!",
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    likes: 17,
    comments: 5,
    isLiked: false,
    expanded: false,
  },
];

const GROUP_RULES = [
  "Mantenha sempre o respeito e educação nas discussões",
  "Não faça spam ou promoção de produtos sem autorização",
  "Ajude outros membros com suas dúvidas sempre que possível",
  "Use as tags adequadas para organizar suas postagens",
];

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "hoje";
  if (days === 1) return "há 1 dia";
  return `há ${days} dias`;
};

export const GroupDetailView = ({ group, onBack, isSubscriber = false }: GroupDetailViewProps) => {
  const [activeTab, setActiveTab] = useState("feed");
  const [posts, setPosts] = useState<GroupPost[]>(MOCK_POSTS);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostLink, setNewPostLink] = useState("");
  const [showPostForm, setShowPostForm] = useState(false);

  const handleLike = (postId: string) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  const toggleExpand = (postId: string) => {
    setPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, expanded: !p.expanded } : p))
    );
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;
    const newPost: GroupPost = {
      id: Date.now().toString(),
      authorName: "Você",
      authorAvatar: "😊",
      content: newPostContent,
      link: newPostLink || undefined,
      linkTitle: newPostLink ? "Link compartilhado" : undefined,
      createdAt: new Date(),
      likes: 0,
      comments: 0,
      isLiked: false,
      expanded: false,
    };
    setPosts(prev => [newPost, ...prev]);
    setNewPostContent("");
    setNewPostLink("");
    setShowPostForm(false);
    toast.success("Post publicado no grupo!");
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar / {group.name}
      </button>

      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden">
        <img
          src={group.bannerUrl}
          alt={group.name}
          className="w-full h-36 sm:h-44 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/70 to-accent/80" />
        <div className="absolute inset-0 flex flex-col justify-end p-5">
          <h1 className="text-2xl font-extrabold text-primary-foreground drop-shadow-md">
            {group.emoji} {group.name}
          </h1>
          <p className="text-sm text-primary-foreground/80 mt-1 line-clamp-2">
            {group.description}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-card rounded-xl border border-border p-2">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-transparent gap-0">
            <TabsTrigger
              value="feed"
              className="flex-1 flex flex-col items-center gap-1 py-3 data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-xs font-medium">Feed</span>
            </TabsTrigger>
            <TabsTrigger
              value="aulas"
              className="flex-1 flex flex-col items-center gap-1 py-3 data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground"
            >
              <Calendar className="w-5 h-5" />
              <span className="text-xs font-medium">Aulas</span>
            </TabsTrigger>
            <TabsTrigger
              value="recursos"
              className="flex-1 flex flex-col items-center gap-1 py-3 data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground"
            >
              <FileText className="w-5 h-5" />
              <span className="text-xs font-medium">Recursos</span>
            </TabsTrigger>
            <TabsTrigger
              value="sobre"
              className="flex-1 flex flex-col items-center gap-1 py-3 data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground"
            >
              <Settings className="w-5 h-5" />
              <span className="text-xs font-medium">Sobre</span>
            </TabsTrigger>
          </TabsList>

          {/* Feed Tab */}
          <TabsContent value="feed" className="mt-4 space-y-4">
            {/* New post button */}
            {!showPostForm ? (
              <Button
                variant="outline"
                className="w-full justify-start text-muted-foreground gap-2"
                onClick={() => setShowPostForm(true)}
              >
                <MessageSquare className="w-4 h-4" />
                Escreva algo para o grupo...
              </Button>
            ) : (
              <div className="bg-card rounded-xl border border-border p-4 space-y-3">
                <Textarea
                  placeholder="O que você gostaria de compartilhar?"
                  value={newPostContent}
                  onChange={e => setNewPostContent(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
                <Input
                  placeholder="Cole um link (opcional)"
                  value={newPostLink}
                  onChange={e => setNewPostLink(e.target.value)}
                  className="text-sm"
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => setShowPostForm(false)}>
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleCreatePost} disabled={!newPostContent.trim()}>
                    <Send className="w-4 h-4 mr-1" />
                    Publicar
                  </Button>
                </div>
              </div>
            )}

            {/* Posts */}
            {posts.map(post => (
              <div key={post.id} className="bg-card rounded-xl border border-border p-4 space-y-3">
                {/* Author */}
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/10 text-lg">
                      {post.authorAvatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{post.authorName}</p>
                    <p className="text-xs text-muted-foreground">{formatTimeAgo(post.createdAt)}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                  {post.expanded || post.content.length <= 150
                    ? post.content
                    : post.content.slice(0, 150) + "..."}
                  {post.content.length > 150 && (
                    <button
                      onClick={() => toggleExpand(post.id)}
                      className="text-primary font-medium ml-1 hover:underline"
                    >
                      {post.expanded ? "ver menos" : "ver mais"}
                    </button>
                  )}
                </div>

                {/* Link preview */}
                {post.link && (
                  <a
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity w-fit"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {post.linkTitle || "Acessar link"}
                  </a>
                )}

                {/* Separator */}
                <div className="border-t border-border" />

                {/* Actions */}
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={cn(
                      "flex items-center gap-1.5 text-sm transition-colors",
                      post.isLiked ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Heart className={cn("w-4 h-4", post.isLiked && "fill-current")} />
                    {post.likes}
                  </button>
                  <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    {post.comments}
                  </button>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Aulas Tab */}
          <TabsContent value="aulas" className="mt-4">
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
              <h3 className="font-semibold text-foreground mb-1">Aulas em breve</h3>
              <p className="text-sm text-muted-foreground">
                As aulas do grupo serão disponibilizadas aqui em breve!
              </p>
            </div>
          </TabsContent>

          {/* Recursos Tab - Locked for non-subscribers */}
          <TabsContent value="recursos" className="mt-4">
            {isSubscriber ? (
              <div className="space-y-4">
                <div className="bg-card rounded-xl border border-border p-4">
                  <h3 className="font-semibold text-foreground mb-2">Materiais do Grupo</h3>
                  <p className="text-sm text-muted-foreground">
                    Recursos exclusivos serão adicionados em breve.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-border p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  Conteúdo Exclusivo para Assinantes
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Os recursos do grupo estão disponíveis apenas para membros com assinatura paga. 
                  Você está no período de teste gratuito - assine um plano para ter acesso a materiais 
                  exclusivos, PDFs, vídeos e muito mais!
                </p>
                <Button className="gap-2" onClick={() => toast.info("Em breve! Aguarde o lançamento dos planos.")}>
                  Conhecer Planos
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Sobre Tab */}
          <TabsContent value="sobre" className="mt-4 space-y-4">
            {/* Description */}
            <div className="bg-card rounded-xl border border-border p-5">
              <p className="text-sm text-foreground/90 leading-relaxed">
                {group.description}. E claro, de uma forma super simples e prática!
              </p>
            </div>

            {/* Group Rules */}
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <h3 className="text-xl font-bold text-foreground">Regras do Grupo</h3>
              <div className="space-y-3">
                {GROUP_RULES.map((rule, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-sm text-foreground/80 pt-1">{rule}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Report */}
            <div className="bg-card rounded-xl border border-border p-5 space-y-3">
              <h3 className="text-xl font-bold text-foreground">Reportar Problema</h3>
              <p className="text-sm text-muted-foreground">
                Encontrou algum conteúdo inadequado ou comportamento que viola nossas regras?
              </p>
              <Button variant="outline" className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10">
                <Flag className="w-4 h-4" />
                Reportar Grupo
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

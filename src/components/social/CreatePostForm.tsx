import { useState } from "react";
import { Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { POST_EMOJIS } from "@/types/posts";
import { cn } from "@/lib/utils";

interface CreatePostFormProps {
  onSubmit: (content: string, emoji: string) => Promise<boolean>;
  userAvatar?: string | null;
  userName?: string;
}

export const CreatePostForm = ({ onSubmit, userAvatar, userName }: CreatePostFormProps) => {
  const [content, setContent] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState(POST_EMOJIS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const success = await onSubmit(content.trim(), selectedEmoji);
    
    if (success) {
      setContent("");
      setSelectedEmoji(POST_EMOJIS[0]);
    }
    setIsSubmitting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={userAvatar || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {userName?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <Textarea
              placeholder="O que você está fazendo hoje? Compartilhe seu progresso! ✨"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[80px] resize-none border-0 bg-muted/50 focus-visible:ring-1"
              maxLength={280}
            />

            <div className="flex items-center justify-between gap-2">
              {/* Emoji selector */}
              <div className="flex gap-1 flex-wrap">
                {POST_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(emoji)}
                    className={cn(
                      "p-1.5 rounded-md transition-all text-lg",
                      selectedEmoji === emoji
                        ? "bg-primary/20 scale-110"
                        : "hover:bg-muted"
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {content.length}/280
                </span>
                <Button
                  onClick={handleSubmit}
                  disabled={!content.trim() || isSubmitting}
                  size="sm"
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  Publicar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

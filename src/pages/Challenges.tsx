import DashboardLayout from "@/components/layout/DashboardLayout";
import { useSupabaseChallenges } from "@/hooks/useSupabaseChallenges";
import ChallengeCard from "@/components/challenges/ChallengeCard";
import CreateChallengeModal from "@/components/challenges/CreateChallengeModal";
import { Button } from "@/components/ui/button";
import { Plus, Trophy } from "lucide-react";
import { useState } from "react";

const Challenges = () => {
  const { challenges, loading, createChallenge, joinChallenge, leaveChallenge, deleteChallenge } = useSupabaseChallenges();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <DashboardLayout activeNav="/challenges">
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Desafios</h1>
          </div>
          <Button onClick={() => setShowCreate(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Novo Desafio
          </Button>
        </div>

        {loading ? (
          <p className="text-muted-foreground text-center py-12">Carregando desafios...</p>
        ) : challenges.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">Nenhum desafio disponível ainda.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {challenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onJoin={(id) => joinChallenge(id)}
                onLeave={(id) => leaveChallenge(id)}
                onViewLeaderboard={() => {}}
                onDelete={(id) => deleteChallenge(id)}
              />
            ))}
          </div>
        )}

        <CreateChallengeModal
          open={showCreate}
          onOpenChange={setShowCreate}
          onSubmit={createChallenge}
        />
      </div>
    </DashboardLayout>
  );
};

export default Challenges;

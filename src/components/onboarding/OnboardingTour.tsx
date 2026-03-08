import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';

interface OnboardingTourProps {
  run: boolean;
  onFinish: () => void;
}

const OnboardingTour = ({ run, onFinish }: OnboardingTourProps) => {
  const steps: Step[] = [
    {
      target: '[data-tour="hero"]',
      content: '👋 Bem-vindo! Aqui você acompanha seu progresso diário e motivação.',
      disableBeacon: true,
    },
    {
      target: '[data-tour="quick-stats"]',
      content: '📊 Suas estatísticas principais: pontos, nível, sequências e conquistas desbloqueadas.',
    },
    {
      target: '[data-tour="daily-progress"]',
      content: '✅ Acompanhe seus hábitos do dia e marque como concluídos.',
    },
    {
      target: '[data-tour="virtual-plant"]',
      content: '🌱 Sua planta virtual cresce conforme você completa seus hábitos!',
    },
    {
      target: '[data-tour="quick-nav"]',
      content: '🚀 Acesso rápido para todas as seções: Hábitos, Finanças, Autocuidado e mais.',
    },
    {
      target: '[data-tour="sidebar"]',
      content: '📱 Use o menu lateral (ou inferior no celular) para navegar entre as páginas.',
    },
    {
      target: '[data-tour="achievements"]',
      content: '🏆 Suas conquistas recentes aparecem aqui. Complete desafios para ganhar mais!',
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      onFinish();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: 'hsl(var(--primary))',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: '12px',
          fontSize: '15px',
        },
        buttonNext: {
          backgroundColor: 'hsl(var(--primary))',
          borderRadius: '8px',
          padding: '8px 16px',
        },
        buttonBack: {
          color: 'hsl(var(--muted-foreground))',
        },
        buttonSkip: {
          color: 'hsl(var(--muted-foreground))',
        },
      }}
      locale={{
        back: 'Voltar',
        close: 'Fechar',
        last: 'Concluir',
        next: 'Próximo',
        skip: 'Pular tour',
      }}
    />
  );
};

export default OnboardingTour;

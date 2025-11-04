import { formatTime } from '@/lib/utils';
import type { TrainingPhase } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TimerDisplayProps {
  phase: TrainingPhase | 'finished' | 'ready';
  timeRemaining: number;
  currentRound: number;
  totalRounds: number;
  holdTarget: number;
}

export function TimerDisplay({
  phase,
  timeRemaining,
  currentRound,
  totalRounds,
  holdTarget
}: TimerDisplayProps) {
  
  const phaseText = () => {
    switch(phase) {
      case 'prep':
        return 'RECOVERY (Breathe Slowly)';
      case 'hold':
        return 'HOLD';
      case 'finished':
        return 'Session Complete';
      case 'ready':
        return 'READY';
      default:
        return '';
    }
  }

  const phaseColor = () => {
     switch(phase) {
      case 'prep':
        return 'text-green-400'; // status-prep
      case 'hold':
        return 'text-red-400'; // status-hold
      default:
        return 'text-white';
    }
  }

  const isEnding = timeRemaining <= 3 && timeRemaining > 0;

  return (
    <div className="w-full flex flex-col items-center justify-center p-8 bg-card rounded-xl shadow-2xl border-0 space-y-4">
       <div className="flex justify-center items-center space-x-2 text-xl font-medium text-gray-400">
          { phase !== 'finished' && phase !== 'ready' ? (
            <>
              <span>Round {currentRound} / {totalRounds}</span>
              <span className="text-gray-600">•</span>
              <span>Hold: {formatTime(holdTarget)}</span>
            </>
          ) : <div className="h-6"/>}
       </div>

      <p className={cn("text-2xl font-semibold", phaseColor())}>
        {phaseText()}
      </p>
      <div
        className={cn(
          'text-7xl font-bold font-mono tabular-nums transition-colors duration-300',
           phaseColor(),
           isEnding && 'animate-pulse'
        )}
      >
        {formatTime(timeRemaining)}
      </div>
    </div>
  );
}
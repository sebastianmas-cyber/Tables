import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SafetyWarningProps {
  tableType: 'co2' | 'o2';
}

export function SafetyWarning({ tableType }: SafetyWarningProps) {
  if (tableType === 'co2') {
    return (
      <Alert variant="destructive" className="bg-yellow-800/50 border-yellow-500 text-yellow-300">
        <AlertTriangle className="h-4 w-4 text-yellow-300" />
        <AlertTitle className="text-yellow-100">⚠️ CRITICAL SAFETY WARNING:</AlertTitle>
        <AlertDescription>
          <ul className="list-disc space-y-1 pl-5">
            <li><strong>NEVER</strong> practice this alone. <strong>ALWAYS</strong> have a spotter present.</li>
            <li><strong>NEVER</strong> practice this in or near water.</li>
            <li>Stop immediately if you feel dizzy, lightheaded, or intensely uncomfortable.</li>
            <li><strong>DO NOT</strong> hyperventilate (over-breathe) before the holds. Breathe slowly and comfortably.</li>
          </ul>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive" className="bg-red-800/50 border-red-500 text-red-300">
      <ShieldAlert className="h-4 w-4 text-red-300" />
      <AlertTitle className="text-red-100">🛑 EXTREME HYPOXIA WARNING:</AlertTitle>
      <AlertDescription>
        <ul className="list-disc space-y-1 pl-5">
            <li><strong>THIS IS DANGEROUS.</strong> You must be trained and experienced with breath-hold to use this.</li>
            <li><strong>NEVER</strong> practice this alone. <strong>ALWAYS</strong> have a dedicated, experienced spotter present.</li>
            <li>Stop the session immediately if you experience dizziness, uncontrollable diaphragm spasms, or intense discomfort.</li>
            <li><strong>DO NOT</strong> hyperventilate (over-breathe) before the holds. Breathe normally for the 2:00 prep period.</li>
        </ul>
      </AlertDescription>
    </Alert>
  );
}
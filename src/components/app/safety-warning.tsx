import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function SafetyWarning() {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Safety First!</AlertTitle>
      <AlertDescription>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Never train alone.</strong> Always have a qualified buddy
            watching you.
          </li>
          <li>
            Never hyperventilate before a breath-hold. It can lead to blackouts.
          </li>
          <li>
            Stop immediately if you feel dizzy, unwell, or experience
            overly strong contractions.
          </li>
          <li>
            This is a training tool, not a substitute for proper freediving
            education.
          </li>
        </ul>
      </AlertDescription>
    </Alert>
  );
}

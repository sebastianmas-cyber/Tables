import { SafetyWarning } from "@/components/app/safety-warning";
import { TrainingController } from "@/components/app/training-controller";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-4xl space-y-8">
        <header className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight font-headline">
            Tables
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Freediving Training Assistant
          </p>
        </header>
        <SafetyWarning />
        <TrainingController />
        <footer className="pt-8 text-center text-muted-foreground text-xs">
          <p>
            This tool is for training purposes only. Misuse can be dangerous.
          </p>
          <p>
            <strong>Never train alone.</strong> Always have a qualified buddy.
          </p>
        </footer>
      </div>
    </main>
  );
}

import { TrainingController } from "@/components/app/training-controller";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-2xl space-y-8">
        <header className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-primary">
            Apnea Training Tables
          </h1>
          <p className="mt-2 text-lg text-gray-300">
            Select a training protocol to begin your session.
          </p>
        </header>
        
        <TrainingController />

        <footer className="pt-8 text-center text-gray-600 text-xs">
          <p>
            Remember: Never train alone or near water.
          </p>
        </footer>
      </div>
    </main>
  );
}
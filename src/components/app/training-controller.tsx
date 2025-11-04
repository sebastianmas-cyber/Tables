"use client";

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import * as Tone from 'tone';
import {
  Play,
  Square,
  Zap,
} from 'lucide-react';

import { generateCo2Table, generateO2Table } from '@/lib/tables';
import type { TrainingPhase, TrainingRound } from '@/lib/types';
import { cn, formatTime } from '@/lib/utils';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TimerDisplay } from './timer-display';
import { SafetyWarning } from './safety-warning';

const FormSchema = z.object({
  pb: z.coerce.number().int().min(30, "Min PB is 30s").max(600, "Max PB is 600s"),
});

type FormValues = z.infer<typeof FormSchema>;

export function TrainingController() {
  const [tableType, setTableType] = React.useState<'co2' | 'o2'>('co2');
  const [tableData, setTableData] = React.useState<TrainingRound[] | null>(null);
  const [isSessionActive, setIsSessionActive] = React.useState(false);
  const [currentRoundIndex, setCurrentRoundIndex] = React.useState(0);
  const [currentPhase, setCurrentPhase] =
    React.useState<TrainingPhase | 'finished' | 'ready'>('ready');
  const [timeRemaining, setTimeRemaining] = React.useState(0);
  const [showStopModal, setShowStopModal] = React.useState(false);
  const [showAlert, setShowAlert] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState('');

  const synth = React.useRef<Tone.Synth | null>(null);
  const timerId = React.useRef<NodeJS.Timeout | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: { pb: 90 },
  });

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
        synth.current = new Tone.Synth().toDestination();
    }
    return () => {
      synth.current?.dispose();
    };
  }, []);

  const playTone = (freq: number, duration: Tone.Unit.Time) => {
    try {
      if (synth.current) {
        if (Tone.context.state !== 'running') {
          Tone.context.resume();
        }
        synth.current.triggerAttackRelease(freq, duration);
      }
    } catch (e) {
      console.error("Audio playback error:", e);
    }
  };

  const playEndSound = () => playTone(500, '8n');
  const playStartSound = () => playTone(700, '8n');
  const playTickSound = () => playTone(900, '16n');

  const advancePhase = React.useCallback(() => {
    if (!tableData) return;
  
    if (currentPhase === 'hold') {
      if (currentRoundIndex === tableData.length - 1) {
        // Last hold finished
        setIsSessionActive(false);
        setCurrentPhase('finished');
        return;
      }
      // After hold, go to next round's prep
      setCurrentPhase('prep');
      setCurrentRoundIndex(prev => prev + 1);
    } else if (currentPhase === 'prep') {
      // After prep, go to hold
      setCurrentPhase('hold');
    }
  }, [currentPhase, currentRoundIndex, tableData]);

  React.useEffect(() => {
    if (!isSessionActive || !tableData) return;
  
    const round = tableData[currentRoundIndex];
    if (!round) {
        // session over
        setIsSessionActive(false);
        setCurrentPhase('finished');
        return;
    }
    const duration = round[currentPhase as 'prep' | 'hold'];
    setTimeRemaining(duration);
    playStartSound();
  
  }, [isSessionActive, currentPhase, currentRoundIndex, tableData]);
  
  
  React.useEffect(() => {
    if (!isSessionActive) {
        if (timerId.current) clearTimeout(timerId.current);
        return;
    }

    if (timeRemaining === 0) {
      playEndSound();
      advancePhase();
      return;
    }

    timerId.current = setTimeout(() => {
      setTimeRemaining(t => t - 1);
      if (timeRemaining > 1 && timeRemaining <= 4) {
        playTickSound();
      }
    }, 1000);

    return () => {
      if (timerId.current) clearTimeout(timerId.current);
    };
  }, [isSessionActive, timeRemaining, advancePhase]);
  

  function onSubmit(data: FormValues) {
    if (tableType === 'co2' && data.pb < 30) {
        setAlertMessage("Please enter a comfortable Personal Best time of at least 30 seconds.");
        setShowAlert(true);
        return;
    }
    if (tableType === 'o2' && data.pb < 60) {
        setAlertMessage("Please enter a comfortable Personal Best time of at least 60 seconds.");
        setShowAlert(true);
        return;
    }
    
    const newTable =
      tableType === 'co2'
        ? generateCo2Table(data.pb)
        : generateO2Table(data.pb);
    setTableData(newTable);
    resetSessionState();
  }
  
  const resetSessionState = () => {
     setIsSessionActive(false);
     setCurrentRoundIndex(0);
     setCurrentPhase('ready');
     setTimeRemaining(0);
  }

  const startSession = () => {
    if (!tableData) return;
    setIsSessionActive(true);
    setCurrentRoundIndex(0);
    setCurrentPhase('prep');
  };

  const stopSession = () => {
    setIsSessionActive(false);
    setShowStopModal(false);
    if (timerId.current) clearTimeout(timerId.current);
    resetSessionState();
    setTableData(null); // Force regeneration
    form.reset();
  };

  const SetupView = () => (
    <div className='space-y-6'>
       <SafetyWarning tableType={tableType} />
       <TableForm description={
           tableType === 'co2' 
           ? "Enter your maximum *comfortable* breath-hold time (PB) in seconds. The table's constant hold time will be calculated based on this (approx. 60-70% of PB)."
           : "Enter your maximum *comfortable* breath-hold time (PB) in seconds. The table will start hold times at about 50% of your PB and increase by 10 seconds each set."
       } />
    </div>
  );

  const TableForm = ({ description }: { description: string }) => (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
         <p className="text-sm text-gray-300">{description}</p>
        <div className="flex items-start space-x-3">
          <FormField
            control={form.control}
            name="pb"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="e.g., 90 (seconds)" 
                    {...field} 
                    className="p-3 h-auto"
                   />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="px-6 py-3 h-auto font-semibold whitespace-nowrap">
             Generate Table
          </Button>
        </div>
      </form>
    </Form>
  );

  const SessionView = () => (
    <div className="space-y-6">
      <TimerDisplay
        phase={ currentPhase }
        timeRemaining={timeRemaining}
        currentRound={currentRoundIndex + 1}
        totalRounds={tableData?.length ?? 0}
        holdTarget={tableData?.[currentRoundIndex]?.hold ?? 0}
      />
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="destructive"
          className="bg-gray-700 hover:bg-gray-600 text-white w-full py-3 font-semibold text-lg"
          onClick={() => setShowStopModal(true)}
        >
          STOP SESSION
        </Button>
      </div>
    </div>
  );

  const SessionCompletionView = () => (
     <div className="text-center p-6 rounded-lg bg-green-900/50 text-green-300 space-y-4">
        <p className="text-xl font-bold mb-2">Session Complete!</p>
        <p>Congratulations! Remember to recover fully and wait at least 24 hours before your next session.</p>
        <Button onClick={stopSession}>
            Start New Session
        </Button>
    </div>
  )
  
  if (currentPhase === 'finished') {
    return <SessionCompletionView />;
  }

  const handleTabChange = (value: string) => {
    setTableType(value as 'co2' | 'o2');
    setTableData(null);
    form.reset();
    resetSessionState();
  };

  return (
    <section className="w-full space-y-6">
      <Tabs
        value={tableType}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 bg-secondary">
          <TabsTrigger value="co2">CO₂ Tolerance Table</TabsTrigger>
          <TabsTrigger value="o2">O₂ Tolerance Table</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {isSessionActive ? <SessionView /> : <SetupView />}

      {tableData && !isSessionActive && (
        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-3 text-center text-primary">Training Protocol</h3>
            <div className="rounded-lg overflow-hidden border-0">
                <Table>
                    <TableHeader className="bg-secondary text-gray-300 uppercase text-xs">
                    <TableRow>
                        <TableHead className="px-3 py-2 sm:px-6 sm:py-3 w-[50px]">Set</TableHead>
                        <TableHead className="px-3 py-2 sm:px-6 sm:py-3">{tableType === 'co2' ? 'Prep (Recovery)' : 'Prep (Constant 2:00)'}</TableHead>
                        <TableHead className="px-3 py-2 sm:px-6 sm:py-3">{tableType === 'co2' ? 'Hold (Constant)' : 'Hold (Increasing)'}</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-secondary">
                    {tableData.map((row, index) => (
                        <TableRow
                        key={row.round}
                        data-active={isSessionActive && index === currentRoundIndex}
                        className="hover:bg-accent text-white border-b-0"
                        >
                        <TableCell className="px-3 py-2 sm:px-6 sm:py-3 font-medium">{row.round}</TableCell>
                        <TableCell className="px-3 py-2 sm:px-6 sm:py-3">{formatTime(row.prep)}</TableCell>
                        <TableCell className="px-3 py-2 sm:px-6 sm:py-3">{formatTime(row.hold)}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button onClick={startSession} className="w-full py-3 h-auto font-semibold text-lg">
              START SESSION
            </Button>
          </div>

        </div>
      )}

      <AlertDialog open={showStopModal} onOpenChange={setShowStopModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will end your current training session. 
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={stopSession}>
              Confirm Stop
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
       <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Invalid Input</AlertDialogTitle>
            <AlertDialogDescription>
              {alertMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowAlert(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { History } from 'lucide-react';

export interface ActionLogItem {
  timestamp: string;
  action: string;
}

interface ActionLogProps {
  logs: ActionLogItem[];
}

export function ActionLog({ logs }: ActionLogProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="text-primary" />
          <span>Action Log</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-4">
          {logs.length === 0 ? (
             <p className="text-muted-foreground text-center pt-4">No actions logged yet.</p>
          ) : (
            <div className="space-y-4">
              {logs.map((log, index) => (
                <div key={index}>
                    <div className="text-sm">
                        <p className="font-medium">{log.action}</p>
                        <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                    </div>
                    {index < logs.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
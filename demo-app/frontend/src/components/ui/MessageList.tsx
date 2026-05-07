import { formatTimeAgo } from '@/lib/utils';

interface Message {
  id: string;
  incidentId: string;
  agentName: string;
  content: string;
  timestamp: string;
}

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No messages yet</p>
      </div>
    );
  }

  const agentColors: Record<string, string> = {
    triage: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    rca: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    mitigation: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    communication: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    sre: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div key={message.id} className="flex gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${agentColors[message.agentName.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
                {message.agentName}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatTimeAgo(message.timestamp)}
              </span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

import { useEffect, useRef } from "react";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MessageCard } from "./message-card";
import { MessageForm } from "./message-form";
import { Fragement } from "@/generated/prisma";
import { MessageLoading } from "./message-loading";

interface Props {
  projectId: string;
  activeFragment: Fragement | null;
  setActiveFragment : (fragment : Fragement | null) => void
}

export const MessagesContainer = ({
  projectId,
  activeFragment,
  setActiveFragment,
}: Props) => {
  const trpc = useTRPC();
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastAssistantMessageRef = useRef<string | null>(null);

  //get all the messages
  const { data: messages } = useSuspenseQuery(
    trpc.messages.getMany.queryOptions({ 
      projectId: projectId,
    }, {
      refetchInterval : 3000,
    })
  );


  //selects last message with fragment and highlight fragment        
  useEffect(() => {
    const lastAssistantMessageWithFragment = messages.findLast(
      (message) => message.role === "ASSISTANT",
    );

    if (
      lastAssistantMessageWithFragment?.fragement &&
      lastAssistantMessageWithFragment.id !== lastAssistantMessageRef.current
    ) {
      setActiveFragment(lastAssistantMessageWithFragment.fragement);
      lastAssistantMessageRef.current = lastAssistantMessageWithFragment.id;
    }
  }, [messages, setActiveFragment]);

  //scrolls to bottom when new message appears
  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [messages.length]);

  const lastMessage = messages[messages.length-1];
  const isLastMessageUser = lastMessage?.role === "USER";

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="pt-2 pr-1">
          {messages.map((message) => (
            <MessageCard
              key={message.id}
              content={message.content}
              role={message.role}
              fragement={message.fragement}
              createdAt={message.createdAt}
              isActiveFragment={activeFragment?.id === message.fragement?.id}
              onFragmentClick={() => setActiveFragment(message.fragement)}
              type={message.type}
            />
          ))}
          {isLastMessageUser && <MessageLoading />}
          <div ref={bottomRef}></div>
        </div>
      </div>
      <div className="relative p-3 pt-1">
        <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-background/70 pointer-events-none" />
        <MessageForm projectId={projectId} />
      </div>
    </div>
  );
};
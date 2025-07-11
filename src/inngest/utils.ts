import { Sandbox }from "@e2b/code-interpreter"
import { AgentResult, Message, TextMessage } from "@inngest/agent-kit";
import { SANDBOX_TIMEOUT } from "./types";

export async function getSandbox(sandboxID : string){
    const sandbox = await Sandbox.connect(sandboxID);
    await sandbox.setTimeout(SANDBOX_TIMEOUT)
    return sandbox;
}

export function lastAssistentTextMessageContent(result : AgentResult){
    const lastAssistentTextMessageIndex = result.output.findLastIndex(
        (message) => message.role === "assistant",
    );

    const message = result.output[lastAssistentTextMessageIndex] as 
    | TextMessage 
    | undefined;

    return message ?.content 
        ? typeof message.content === "string" 
            ? message.content 
            : message.content.map((c) => c.text).join("")
        : undefined;
}

export const parseAgentOutput = (value: Message[]) => {
  const output = value[0];
  if (output.type !== "text") {
    return "Here you go.";
  }
  if (Array.isArray(output.content))
    return output.content.map((txt) => txt).join("");
  else return output.content;
};
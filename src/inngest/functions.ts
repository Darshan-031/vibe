import {gemini,createAgent,} from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import {inngest} from "./client";
import { getSandbox } from "./utils";

export const helloWorld =  inngest.createFunction(
  { id: "code-contents" },
  { event: "app/ticket.created" },
  async ({ event, step }) => {

    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("darshan-vibe-nextjs");
      return sandbox.sandboxId;
    });

    const codeAgent = createAgent({
      name: "code-agent",
      system: "You are an expert next.js developer. You write readable, maintainable code. You write simple Next.js and react code snippets.",
      model: gemini({ model: "gemini-2.0-flash" }),
    });

    // Run the agent with an input prompt.
    const { output } = await codeAgent.run(`Give me code snippet only : ${event.data.value}`);

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    })

    console.log(output);

    return {output, sandboxUrl};
  }
);

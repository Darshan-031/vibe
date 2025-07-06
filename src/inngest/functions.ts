import {gemini,createAgent,} from "@inngest/agent-kit";

import {inngest} from "./client";

export const helloWorld =  inngest.createFunction(
  { id: "summarize-contents" },
  { event: "app/ticket.created" },
  async ({ event }) => {
    const writer = createAgent({
      name: "summarize",
      system: "You are an expert summarizer. You can summarize in 2 words",

      model: gemini({ model: "gemini-2.0-flash" }),
    });

    // Run the agent with an input prompt.
    const { output } = await writer.run(`summarize the text : ${event.data.value}`);

    console.log(output);

    return output;
  }
);

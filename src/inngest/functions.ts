import { z } from "zod";
import {gemini,createAgent, createTool, createNetwork,} from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import {inngest} from "./client";
import { getSandbox, lastAssistentTextMessageContent } from "./utils";
import { PROMPT } from "@/prompt";

export const helloWorld =  inngest.createFunction(
  { id: "code-contents" },
  { event: "app/ticket.created" },
  async ({ event, step }) => {

    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("darshan-vibe-nextjs");
      return sandbox.sandboxId;
    });

    //Our agent that is capable of generating website
    const codeAgent = createAgent({
      name: "code-agent",
      description: "An expert coding agent.",
      system: PROMPT,
      model: gemini({
        model: "gemini-2.5-pro",
      }),
      tools: [
        //creating tools for agent like terminal, create or update file, readfile
        createTool({
          //terminal tool
          name: "terminal",
          description: "Use the terminal to run commands",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) => {
            return await step?.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" };

              try {
                const sandbox = await getSandbox(sandboxId);
                const result = await sandbox.commands.run(command, {
                  onStdout: (data: string) => {
                    buffers.stdout += data;
                  },
                  onStderr: (data: string) => {
                    buffers.stderr += data;
                  },
                });
                return result.stdout;
              } catch (error) {
                console.error(
                  `Command failed: ${error} \nstdout : ${buffers.stdout}\nstderr : ${buffers.stderr}`
                );
                return `Command failed: ${error} \nstdout : ${buffers.stdout}\nstderr : ${buffers.stderr}`;
              }
            });
          },
        }),
        //createOrUpdate Tool
        createTool({
          name: "createOrUpdateFiles",
          description: "Create or Update files in the sendbox",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              })
            ),
          }),
          handler: async ({ files }, { step, network }) => {
            const newFiles = await step?.run(
              "createOrUpdateFiles",
              async () => {
                try {
                  const updatedFile = network.state.data.files || {};
                  const sandbox = await getSandbox(sandboxId);
                  for (const file of files) {
                    await sandbox.files.write(file.path, file.content);
                    updatedFile[file.path] = file.content;
                  }

                  return updatedFile;
                } catch (error) {
                  return "return : " + error;
                }
              }
            );
            if (typeof newFiles === "object") {
              network.state.data.files = newFiles;
            }
          },
        }),
        //readFile Tool
        createTool({
          name: "readFiles",
          description: "Read files form the sandbox",
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, { step }) => {
            return await step?.run("readFiles", async () => {
              try {
                const sandbox = await getSandbox(sandboxId);
                const contents = [];
                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({ path: file, content });
                }
                return JSON.stringify(contents);
              } catch (error) {
                return "Error : " + error;
              }
            });
          },
        }),
      ],
      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssistentMessageText =
            lastAssistentTextMessageContent(result);

          if (lastAssistentMessageText && network) {
            if (lastAssistentMessageText.includes("<task_summary>")) {
              network.state.data.summary = lastAssistentMessageText;
            }
          }

          return result;
        },
      },
    });

    const network = createNetwork({
      name : "coding-agent-network",
      agents : [codeAgent],
      maxIter: 7,
      router: async ({network}) => {
        const summary = network.state.data.summary;

        if(summary){
          return;
        }

        return codeAgent;
      }
    })

    const result = await network.run(event.data.value);

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    })

    return {
      url : sandboxUrl,
      title : "Fregment",
      files : result.state.data.files,
      summary : result.state.data.summary,
    };
  }
);

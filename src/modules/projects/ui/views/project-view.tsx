"use client";

import { Fragement } from "@/generated/prisma";
import { Suspense, useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { CodeIcon, CrownIcon, EyeIcon } from "lucide-react";
import { FileExplorer } from "@/components/file-explorer";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { FragmentWeb } from "../components/fragment-web";
import { ProjectHeader } from "../components/project-header";
import { MessagesContainer } from "../components/message-container";

interface Props {
    projectId : string,
}

export const ProjectView = ({ projectId } : Props) => {
      const [activeFragment, setActiveFragment] = useState<Fragement | null>(null);
      const [tabState, setTabState] = useState<"preview" | "code">("preview");

      return (
        <div className="h-screen">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel
              defaultSize={35}
              minSize={20}
              className="flex flex-col min-h-0"
            >
              <Suspense fallback={<p>Loading project...</p>}>
                <ProjectHeader projectId={projectId} />
              </Suspense>
              <Suspense fallback={<p>Loading messages...</p>}>
                <MessagesContainer
                  projectId={projectId}
                  activeFragment={activeFragment}
                  setActiveFragment={setActiveFragment}
                />
              </Suspense>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={65} minSize={50}>
              <Tabs
                className="h-full gap-y-4"
                defaultValue="preview"
                value={tabState}
                onValueChange={(value) =>
                  setTabState(value as "preview" | "code")
                }
              >
                <div className="w-full flex items-center p-2 border-b gap-x-2">
                  <TabsList className="">
                    <TabsTrigger value="preview" className="rounded-md">
                      <EyeIcon />
                      <span>Demo</span>
                    </TabsTrigger>
                    <TabsTrigger value="code" className="rounded-md">
                      <CodeIcon />
                      <span>Code</span>
                    </TabsTrigger>
                  </TabsList>
                  <div className="ml-auto flex items-center gap-x-2">
                    <Button asChild size="sm" variant="default">
                      <Link href="/pricing">
                        <CrownIcon />
                        Upgrede
                      </Link>
                    </Button>
                  </div>
                </div>
                <TabsContent value="preview">
                  {!!activeFragment && <FragmentWeb data={activeFragment} />}
                </TabsContent>
                <TabsContent value="code" className="min-h-0">
                  {!!activeFragment?.files && (
                    <FileExplorer
                      files={activeFragment.files as { [path: string]: string }}
                    />
                  )}
                </TabsContent>
              </Tabs>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      );
};
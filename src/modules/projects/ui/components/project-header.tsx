import { Button } from "@/components/ui/button"
import { useTRPC } from "@/trpc/client"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useSuspenseQuery } from "@tanstack/react-query"
import { ChevronDownIcon, ChevronLeftIcon, SunMoonIcon } from "lucide-react"
import { useTheme } from "next-themes"
import Image from "next/image"
import Link from "next/link";

interface Props {
    projectId : string;
}

export const ProjectHeader = ({projectId} : Props) => {
    const trpc = useTRPC();
    const {data : project} = useSuspenseQuery(
        trpc.projects.getOne.queryOptions({ id : projectId})
    )

    const {setTheme, theme} = useTheme();

    return (
      <header className="p-2 flex justify-between items-center border-b">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Image src="/logo.svg" alt="Vibe" width={18} height={18} />
              <span className="text-sm font-medium">{project.name}</span>
              <ChevronDownIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="start">
            <DropdownMenuItem>
              <Link href="/" className="flex gap-2 items-center">
                <ChevronLeftIcon />
                <span className="text-sm font-medium">Go to Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <SunMoonIcon className="size-4" />
                <span>Appearance</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                    <DropdownMenuRadioItem value="light">
                      <span>Light</span>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark">
                      <span>Dark</span>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="system">
                      <span>System</span>
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>



          </DropdownMenuContent>
        </DropdownMenu>
      </header>
    );
}
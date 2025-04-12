"use client";

import dynamic from "next/dynamic";
import { BrowserShapeUtil } from "@/components/BrowserShape";
import { ProjectIdeaUtil } from "@/components/ProjectIdea";
import { useEditor } from "tldraw";
import { useEffect, useState } from "react";
import { BottomBar } from "@/components/BottomBar";
import { BrowserTool } from "@/tools/BrowserTool";
import { SignOutButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { snapshot } from "@/lib/snapshot";
import { shouldUseAuth } from "@/lib/shouldUseAuth";
import { Settings } from "@/components/Settings";
import { PromptShapeTool } from "@/tools/PromptShapeTool";
import { breed } from "@/lib/breed";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useAtom } from "jotai";
import { settingsAtom } from "@/state/settings";
import { SettingsIcon } from "lucide-react";

const Tldraw = dynamic(async () => (await import("tldraw")).Tldraw, {
  ssr: false,
});

const shapeUtils = [ProjectIdeaUtil];

export function Canvas() {
  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Tldraw
        persistenceKey="tlweb"
        shapeUtils={shapeUtils}
        hideUi={false}
        tools={[BrowserTool, PromptShapeTool]}
        components={{
          Toolbar: null,
          PageMenu: null,
          MainMenu: null,
          StylePanel: null,
          DebugPanel: null,
        }}
      >
        <UI />
      </Tldraw>
    </div>
  );
}

function UI() {
  const editor = useEditor();
  const [settings] = useAtom(settingsAtom);

  useEffect(() => {
    const currentShapeIds = Array.from(editor.getCurrentPageShapeIds());
    if (settings.apiKey && currentShapeIds.length === 0) {
      const recordsToLoad = Object.values(snapshot.store);
      editor.store.put(recordsToLoad as any);
    } else if (!settings.apiKey && currentShapeIds.length > 0) {
      editor.deleteShapes(currentShapeIds);
    }
  }, [editor, settings.apiKey]);

  return (
    <>
      <div
        className="absolute top-1 right-1 flex gap-1"
        style={{ zIndex: 1000 }}
      >
        <Settings />
        {shouldUseAuth && (
          <SignOutButton>
            <Button size="sm">Sign Out</Button>
          </SignOutButton>
        )}
      </div>
      {settings.apiKey ? (
        <div
          className="absolute bottom-1 left-1/2 transform -translate-x-1/2"
          style={{ zIndex: 1000 }}
        >
          <BottomBar />
        </div>
      ) : (
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 bg-yellow-100 border border-yellow-400 rounded text-yellow-800 text-center shadow-lg"
          style={{ zIndex: 999 }}
        >
          Please add your OpenRouter API Key in the <SettingsIcon className="inline h-4 w-4 mx-1" /> settings (top right) to begin.
        </div>
      )}
    </>
  );
}

/* Commented out BreedButton definition
function BreedButton() {
  const editor = useEditor();
  const [isBreeding, setIsBreeding] = useState(false);
  return (
    <Button
      onClick={async () => {
        setIsBreeding(true);
        await breed(editor);
        setIsBreeding(false);
      }}
      disabled={isBreeding}
      size="sm"
    >
      {isBreeding ? <ReloadIcon className="h-4 w-4 animate-spin" /> : "Breed"}
    </Button>
  );
}
*/

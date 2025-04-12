// Import necessary UI components from Shadcn UI library
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Import icons from lucide-react library
import { Info, Settings as SettingsIcon, TriangleAlert } from "lucide-react";
// Import Textarea component
import { Textarea } from "./ui/textarea";
// Import Jotai hook for state management
import { useAtom } from "jotai";
// Import the global settings state atom
import { settingsAtom } from "@/state/settings";
// Import Alert components for displaying warnings
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

// Define the Settings component
export function Settings() {
  // Use the useAtom hook to get the current settings state and a function to update it.
  // settingsAtom holds the global application settings (apiKey, model, prompt).
  const [settings, setSettings] = useAtom(settingsAtom);

  // Render the component structure
  return (
    // Root Dialog component from Shadcn UI
    <Dialog>
      {/* DialogTrigger defines the element that opens the dialog. 
          asChild={true} merges the trigger props onto the child Button instead of rendering its own button. */}
      <DialogTrigger asChild={true}>
        {/* This Button acts as the trigger to open the settings dialog */}
        <Button size="icon" variant="ghost" title="Settings">
          {/* Icon for the settings button */}
          <SettingsIcon />
        </Button>
      </DialogTrigger>
      {/* DialogContent contains the modal content that appears when the dialog is open */}
      <DialogContent className="sm:max-w-[425px]">
        {/* DialogHeader contains the title and description of the dialog */}
        <DialogHeader>
          <DialogTitle>Edit Settings</DialogTitle>
          <DialogDescription>
            Make changes to settings that will be applied to generation.
          </DialogDescription>
        </DialogHeader>
        {/* Main container for the form elements, using flex layout */}
        <div className="flex flex-col gap-4">
          {/* Section for the API Key input */}
          <div className="flex flex-col gap-2">
            {/* Label for the API Key input, includes a link to Open Router */}
            <Label htmlFor="key" className="text-xs flex items-center gap-1">
              Open Router Key
              {/* Link to Open Router website */}
              <a href="https://openrouter.ai/" target="_blank">
                <Info className="h-3 w-3" />
              </a>
            </Label>
            {/* Input field for the API Key */}
            <Input
              id="key"
              // Bind the input value to the apiKey property in the settings state
              value={settings.apiKey}
              // Update the settings state when the input value changes
              onChange={(e) =>
                // Create a new settings object, copying existing settings and updating only the apiKey
                setSettings({ ...settings, apiKey: e.target.value })
              }
              // Use type="password" to obscure the key input
              type="password"
            />
          </div>
          {/* Horizontal rule to separate sections */}
          <hr />
          {/* Section for the Model selection */}
          <div className="flex flex-col gap-2">
            {/* Label for the Model select dropdown */}
            <Label htmlFor="model" className="text-xs">
              Model
            </Label>
            {/* Select component for choosing the AI model */}
            <Select
              name="model"
              // Bind the select value to the model property in the settings state
              value={settings.model}
              // Update the settings state when the selected value changes
              onValueChange={(value) =>
                // Create a new settings object, copying existing settings and updating only the model
                setSettings({ ...settings, model: value as any }) // Using 'as any' likely to match expected type, might need refinement
              }
            >
              {/* SelectTrigger displays the currently selected value or placeholder */}
              <SelectTrigger>
                <SelectValue placeholder="Select a Model" />
              </SelectTrigger>
              {/* SelectContent contains the list of available options */}
              <SelectContent>
                {/* Define individual model options */}
                <SelectItem value="haiku">Haiku</SelectItem>
                <SelectItem value="sonnet">Sonnet</SelectItem>
                <SelectItem value="opus">Opus</SelectItem>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* Section for the Prompt input - Commented out
        <div className="flex flex-col gap-2">
          <Label htmlFor="prompt" className="text-xs">
            Prompt
          </Label>
          <Textarea
            id="prompt"
            placeholder="Make sure to specify that the return value should be a standalone html file."
            // Bind the textarea value to the prompt property in the settings state
            value={settings.prompt}
            // Update the settings state when the textarea value changes
            onChange={(e) =>
              // Create a new settings object, copying existing settings and updating only the prompt
              setSettings({ ...settings, prompt: e.target.value })
            }
          />
        </div>
        */}

        {/* Conditional rendering: Show an alert if the API key is not provided */}
        {!settings.apiKey && (
          // Alert component indicating a warning/error
          <Alert variant="destructive">
            <TriangleAlert className="h-4 w-4" />
            <AlertDescription>
              You must provide an Open Router API key to change the model and
              prompt.
            </AlertDescription>
          </Alert>
        )}
        {/* DialogFooter contains action buttons like Close */}
        <DialogFooter>
          {/* DialogClose wraps the button that closes the dialog */}
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

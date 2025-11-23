import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ModelSelector({models, REDIRECT_BASE_PATH}: {models: {value: string, label: string}[], REDIRECT_BASE_PATH: string}) {
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState("");
  const navigate = useNavigate();

  // Find the selected model's label for display
  const selectedLabel = models.find((model) => model.value === selectedValue)?.label;

  const handleSelect = (currentValue: string) => {
    setSelectedValue(currentValue === selectedValue ? "" : currentValue);
    setOpen(false); // Close the popover after selection
  };
  
  const handleRedirect = () => {
    if (selectedValue) {
      navigate({to:`${REDIRECT_BASE_PATH}${selectedValue}` as any});
    }
  };

  return (
        <Card className="w-[400px]">
            <CardHeader>
                <CardTitle>Select the model to open in playground</CardTitle>
                <CardDescription>
                    Choose a model from the list.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between"
                        >
                            {selectedValue
                                ? selectedLabel
                                : "Select model..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[368px] p-0">
                        <Command>
                            <CommandInput placeholder="Search model..." />
                            <CommandList>
                                <CommandEmpty>No model found.</CommandEmpty>
                                <CommandGroup>
                                    {models.map((model) => (
                                        <CommandItem
                                            key={model.value}
                                            value={model.label} // Use label for command filtering
                                            onSelect={() => handleSelect(model.value)}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selectedValue === model.value
                                                        ? "opacity-100"
                                                        : "opacity-0"
                                                )}
                                            />
                                            {model.label}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
                <Button 
                    onClick={handleRedirect} 
                    disabled={!selectedValue} 
                    className="w-full"
                >
                    Go to {selectedLabel || "Model"} Details
                </Button>
            </CardContent>
        </Card>
  );
}
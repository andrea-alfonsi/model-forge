"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandList,
  CommandItem,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown, Check } from "lucide-react";
const InputWithDropdown = ({
className,
  endList,
  onSelect,
  selectedValue,
  name,
  type,
  error,
  helperText,
  disabled,
  listPosition = "end",
  searchPlaceholder = "Search...",
  emptyListMessage = "No items found.",
  startIcon,
  endIcon,
  helperTextClassname,
  outerClass,
  startIconClass,
  buttonClassName,
  ...props
}: any) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const selected = endList?.find((val: any) => val?.id === selectedValue);
const filteredList = React.useMemo(() => {
    if (!search) {
      return endList || [];
    }
    return (
      endList?.filter((item: any) =>
        item?.name?.toLowerCase()?.includes(search.toLowerCase())
      ) || []
    );
  }, [endList, search]);

  const stopWheelEventPropagation = (e: any) => {
    e.stopPropagation();
  };
  const stopTouchMoveEventPropagation = (e: any) => {
    e.stopPropagation();
  };
  return (
    <div className={cn("w-full relative", outerClass)}>
      <Input
        type={type}
        startIcon={startIcon}
        startIconClass={startIconClass}
        disabled={disabled}
        className={cn(
          "flex h-[32px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:bg-[#F4F4F4] disabled:cursor-not-allowed disabled:opacity-80 dark:border-slate-800 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300",
          startIcon ? "pl-5" : "",

          endIcon || (endList && listPosition === "end") ? "pr-24" : "",
          listPosition === "start" && endList ? "pl-24" : "",
          error ? "border-red-600 focus-visible:ring-0" : "",
          className
        )}
        {...props}
      />
      {endList && (
        <div
          className={cn(
            "absolute top-1/2 transform -translate-y-1/2",
            listPosition === "start" ? "left-[1px]" : "right-[1px]"
          )}
        >
          <Popover
            open={open}
            onOpenChange={(val) => {
              setOpen(val);
              if (!val) {
                setSearch("");
              }
            }}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={cn(
                  "w-[85px] h-[30px] px-2 focus:ring-0 focus-border-none rounded-none",
                  listPosition === "start"
                    ? "rounded-tl-md rounded-bl-md"
                    : "rounded-tr-md rounded-br-md",
                  "border-none bg-[#F4F4F5] hover:bg-[#F4F4F5] justify-between disabled:opacity-80 disabled:cursor-not-allowed",
                  buttonClassName
                )}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                disabled={disabled}
              >
                <div className="flex justify-between items-center overflow-hidden w-full gap-1">
                  <p className="m-0 text-start font-ttHoves text-[#27272A] text-sm font-medium truncate">
                    {selected?.name || "-"}
                  </p>
                  {!disabled && <ChevronDown className="h-4 w-4 shrink-0" />}
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[200px] p-0"
              onEscapeKeyDown={() => setOpen(false)}
              onWheel={stopWheelEventPropagation}
              onTouchMove={stopTouchMoveEventPropagation}
            >
              <Command>
                <CommandInput
                  placeholder={searchPlaceholder}
                  className="h-9"
                  onValueChange={setSearch}
                  onClick={(e) => e.stopPropagation()}
                />
                <CommandList className="max-h-[200px] overflow-y-auto">
                  <CommandEmpty>{emptyListMessage}</CommandEmpty>
                  <CommandGroup>
                    {filteredList.map((item: any) => (
                      <CommandItem
                        key={item.id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onSelect={() => {
                          onSelect(item?.id);
                          setOpen(false);
                        }}
                      >
                        <div className="flex justify-between w-full items-center">
                          <p className="my-0">{item.name}</p>
                          {selected?.id === item?.id && (
                            <Check className="h-4 w-4 text-[#F08B32]" />
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}
      {error && helperText && (
        <p
          className={`absolute left-0 bottom-[-20px] text-[8px] mx-2 mt-1 text-red-600 ${helperTextClassname}`}
        >
          {helperText}
        </p>
      )}
    </div>
  );
};
InputWithDropdown.displayName = "InputWithDropdown";
export { InputWithDropdown };

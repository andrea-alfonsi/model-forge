import { cn } from "@/lib/utils";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import type React from "react";

interface ActionCardProps {
  children: React.ReactNode
  onClick?: () => void;
  action: string
  className?: string;
}

export const ActionCard = ({
  children,
  onClick,
  action,
  className,
}: ActionCardProps) => {
  return (
    <Card className={cn(
      "p-4 flex items-center justify-between max-w-xl mx-auto flex-row",
      className
    )}>
      <div className="flex items-center space-x-3">
        { children }
      </div>
      <div className="flex-shrink-0">
        <Button onClick={onClick} variant="outline" size="sm">
          {action}
        </Button>
      </div>
    </Card>
  );
};
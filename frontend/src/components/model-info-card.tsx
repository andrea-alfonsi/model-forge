import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

// Based on backend/app/schemas/model.py ModelRead schema
interface Model {
  id: string;
  name: string;
  description: string | null;
  task: string;
  created_at: string;
  updated_at: string;
}

interface ModelInfoCardProps {
  model: Model | null;
}

export function ModelInfoCard({ model }: ModelInfoCardProps) {
  if (!model) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Model Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading model details...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{model.name}</CardTitle>
        <CardDescription>{model.description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div>
            <p className="text-sm font-medium leading-none">Task</p>
            <p className="text-sm text-muted-foreground">{model.task}</p>
        </div>
        <Separator />
        <div>
            <p className="text-sm font-medium leading-none">Created At</p>
            <p className="text-sm text-muted-foreground">
                {new Date(model.created_at).toLocaleString()}
            </p>
        </div>
        <Separator />
        <div>
            <p className="text-sm font-medium leading-none">Last Updated</p>
            <p className="text-sm text-muted-foreground">
                {new Date(model.updated_at).toLocaleString()}
            </p>
        </div>
      </CardContent>
    </Card>
  );
}

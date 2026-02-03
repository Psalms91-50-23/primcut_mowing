import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function QuickActions() {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-col gap-3">
          <Button>Create Quote</Button>
          <Button variant="secondary">Add Customer</Button>
          <Button variant="outline">Schedule Job</Button>
        </div>
      </CardContent>
    </Card>
  );
}

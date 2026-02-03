import { Card, CardContent } from "@/components/ui/card";
import { JobItem } from "./"

export default function Jobs() {
  return (
    <Card className="lg:col-span-2 rounded-2xl shadow-sm">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Upcoming Jobs</h2>
        <ul className="space-y-3">
          <JobItem name="John Smith" date="Tomorrow" service="Lawn Mowing" />
          <JobItem name="Sarah Lee" date="Jan 29" service="Hedge Trimming" />
          <JobItem name="Mike Brown" date="Jan 30" service="Weed Control" />
        </ul>
        <Button variant="outline" className="mt-4">View all jobs</Button>
      </CardContent>
    </Card>
  );
}

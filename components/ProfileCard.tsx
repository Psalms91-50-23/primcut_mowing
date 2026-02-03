import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type User = {
  first_name: string;
  last_name: string;
  email: string;
  mobile?: string;
  landline?: string,
};


export default function ProfileCard({ user }: { user: User }) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent>
        <h2 className="text-xl font-semibold">Profile</h2>

        <div className="mt-4 space-y-2">
          <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.mobile}</p>
        </div>

        <Button className="mt-4">Edit Profile</Button>
      </CardContent>
    </Card>
  );
}

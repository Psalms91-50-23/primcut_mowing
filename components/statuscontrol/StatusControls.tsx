import { Button } from "@/components/ui/button";

interface StatusControlsProps {
  status: string;
  canToggle: boolean;
  onStatusChange: (value: string) => void;
  onUpdate: () => void;
  onSend: () => void;
}
const StatusControls: React.FC<StatusControlsProps> = ({ status, canToggle, onStatusChange, onUpdate, onSend }) => (
  <section className="flex flex-col sm:flex-row gap-4 justify-end">
    <select
      value={status}
      disabled={!canToggle}
      onChange={(e) => onStatusChange(e.target.value)}
      className="border rounded px-3 py-2 shadow-sm focus:ring-1 focus:ring-green-500"
    >
      <option value="draft">Draft</option>
      <option value="sent">Sent</option>
      <option value="accepted">Accepted</option>
      <option value="expired">Expired</option>
    </select>
    <Button onClick={onUpdate}>Update Quote</Button>
    <Button onClick={onSend} className="bg-green-600 text-white hover:bg-green-700">
      Send Quote
    </Button>
  </section>
);

export default StatusControls;
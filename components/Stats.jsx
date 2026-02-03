import { StatCard } from "./";

export default function Stats() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <StatCard title="Active Jobs" value="12" icon={<Calendar />} />
      <StatCard title="Customers" value="84" icon={<Users />} />
      <StatCard title="Quotes Sent" value="27" icon={<FileText />} />
      <StatCard title="Revenue (MTD)" value="$4,320" icon={<DollarSign />} />
    </section>
  );
}

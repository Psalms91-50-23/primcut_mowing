

export default function JobItem({ name, date, service }: { name: string; date: string; service: string }) {
  return (
    <li className="flex justify-between items-center border-b pb-2 last:border-none">
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-sm text-gray-500">{service}</p>
      </div>
      <span className="text-sm text-gray-600">{date}</span>
    </li>
  );
}

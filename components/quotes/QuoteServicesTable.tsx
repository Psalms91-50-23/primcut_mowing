import React from "react";

export type Service = {
  label: string;
  unit_price: number;
  quantity: number;
};

export type Image = {
  url?: string;
  label?: string;
};

type QuoteTableProps = {
  services: Service[];
  images?: Image[];
  subtotal?: number;
  gst?: number;
  total?: number;
  onImageClick?: (url: string) => void;
  className?: string;
};

const QuoteServicesTable: React.FC<QuoteTableProps> = ({
  services,
  images = [],
  subtotal,
  gst,
  total,
  onImageClick,
  className = "",
}) => {
  return (
    <div className={`border rounded-lg shadow-sm overflow-hidden ${className}`}>
      <table className="w-full table-auto">
        {/* Table Head */}
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left px-4 py-2">Service</th>
            <th className="text-left px-4 py-2">Image</th>
            <th className="text-left px-4 py-2">Unit Price</th>
            <th className="text-left px-4 py-2">Quantity</th>
            <th className="text-left px-4 py-2">Total</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="bg-white divide-y divide-gray-200">
          {services.map((s, idx) => {
            const img = images[idx];
            return (
              <tr key={idx}>
                <td className="px-4 py-2">{s.label}</td>
                <td className="px-4 py-2">
                  {img?.url && (
                    <button
                      onClick={() => img.url && onImageClick?.(img.url)}
                      className="w-20 h-20 overflow-hidden rounded-lg border cursor-pointer group"
                    >
                      <img
                        src={img.url}
                        alt={img.label ?? `Quote image ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                    </button>
                  )}
                </td>
                <td className="px-4 py-2">${s.unit_price.toFixed(2)}</td>
                <td className="px-4 py-2">{s.quantity}</td>
                <td className="px-4 py-2">${(s.unit_price * s.quantity).toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>

        {/* Table Footer: Subtotal, GST, Total */}
        <tfoot>
          {subtotal !== undefined && (
            <tr className="bg-gray-50">
              <td colSpan={4} className="px-4 py-2 font-semibold border-t border-gray-300 text-right">
                SubTotal
              </td>
              <td className="px-4 py-2 font-semibold border-t border-gray-300">${subtotal.toFixed(2)}</td>
            </tr>
          )}
          {gst !== undefined && (
            <tr className="bg-gray-50">
              <td colSpan={4} className="px-4 py-2 font-semibold border-t border-gray-300 text-right">
                GST 15%
              </td>
              <td className="px-4 py-2 font-semibold border-t border-gray-300">${gst.toFixed(2)}</td>
            </tr>
          )}
          {total !== undefined && (
            <tr className="bg-gray-50">
              <td colSpan={4} className="px-4 py-2 font-bold border-t border-gray-400 text-lg text-right">
                Total
              </td>
              <td className="px-4 py-2 font-bold border-t border-gray-400 text-lg">${total.toFixed(2)}</td>
            </tr>
          )}
        </tfoot>
      </table>
    </div>
  );
};

export default QuoteServicesTable;
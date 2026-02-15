
interface TotalsBoxProps {
  subtotal: number;
  gst: number;
  total: number;
}

const TotalsBox: React.FC<TotalsBoxProps> = ({ subtotal, gst, total }) => (
  <section className="mb-6 flex flex-col sm:flex-row justify-end gap-4">
    <div className="w-full sm:w-64 border rounded-lg p-4 bg-white shadow-sm space-y-2">
      <div className="flex justify-between font-semibold">
        <span>Subtotal:</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between font-semibold">
        <span>GST (15%):</span>
        <span>${gst.toFixed(2)}</span>
      </div>
      <div className="flex justify-between font-bold text-green-900 text-lg">
        <span>Total:</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </div>
  </section>
);

export default TotalsBox;
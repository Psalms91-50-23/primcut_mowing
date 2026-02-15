interface QuoteHeaderProps {
  quoteUuid: string;
  expiry?: string;
}
const QuoteHeader: React.FC<QuoteHeaderProps> = ({ quoteUuid, expiry }) => (
  <div className="bg-green-900 rounded-t-lg shadow-md p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 text-white">
    <h1 className="flex items-center font-bold m-0 p-0 text-xl sm:text-2xl md:text-3xl">
      <span className="text-2xl sm:text-3xl md:text-4xl translate-x-1">H</span>
      <img
        src="/images/seedream-image.png"
        alt="Happy Logo"
        className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-1"
      />
      <span className="text-xl sm:text-2xl md:text-3xl">ppy Lawns</span>
    </h1>
    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
      <span className="text-sm">Date: {new Date().toLocaleDateString()}</span>
      <span className="text-sm">Quote ID: {quoteUuid}</span>
      {expiry && <span className="text-sm">Expiry: {expiry}</span>}
    </div>
  </div>
);

export default QuoteHeader;
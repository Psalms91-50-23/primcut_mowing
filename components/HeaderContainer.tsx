

export default function HeaderContainer() {
    return (
    <div className="flex flex-col items-center mb-6 bg-green-800 py-3 rounded-t-2xl">
        <h1 className="flex items-center font-bold text-2xl text-white">
          <span className="text-4xl translate-x-1">H</span>
          <span className="ml-1">
            <img
              src="/images/happy-house-1.png"
              alt="Happy Property Logo"
              className="w-12 h-12 inline-block"
            />
          </span>
          <span className="text-4xl ml-1">ppy Property</span>
        </h1>
      </div>
    );
}
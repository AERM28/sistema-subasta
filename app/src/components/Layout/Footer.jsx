export function Footer() {
  return (
    <footer className="fixed bottom-0 w-full bg-primary/95 text-white flex items-center justify-center px-4 py-3 shadow-md">
      <div className="w-full max-w-7xl text-center">
        <p className="text-sm font-medium">SubastaSeries — ISW-613</p>
        <p className="text-xs opacity-70">{new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
export function TypingIndicator() {
  return (
    <div className="flex items-center space-x-2 p-3 bg-card rounded-2xl w-fit border border-border/50">
      <div
        className="w-2 h-2 bg-primary rounded-full animate-bounce shadow-[0_0_8px_hsla(185,100%,50%,0.6)]"
        style={{ animationDelay: '0ms' }}
      ></div>
      <div
        className="w-2 h-2 bg-primary rounded-full animate-bounce shadow-[0_0_8px_hsla(185,100%,50%,0.6)]"
        style={{ animationDelay: '150ms' }}
      ></div>
      <div
        className="w-2 h-2 bg-primary rounded-full animate-bounce shadow-[0_0_8px_hsla(185,100%,50%,0.6)]"
        style={{ animationDelay: '300ms' }}
      ></div>
    </div>
  );
}

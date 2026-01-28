import React from "react";

type LoadingBarProps = {
  routeKey: string;
};

const LoadingBar = ({ routeKey }: LoadingBarProps) => {
  const [loading, setLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    setLoading(true);
    setProgress(6);

    const timer1 = window.setTimeout(() => setProgress(28), 60);
    const timer2 = window.setTimeout(() => setProgress(56), 160);
    const timer3 = window.setTimeout(() => setProgress(84), 320);
    const timer4 = window.setTimeout(() => {
      setProgress(100);
      window.setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 180);
    }, 460);

    return () => {
      window.clearTimeout(timer1);
      window.clearTimeout(timer2);
      window.clearTimeout(timer3);
      window.clearTimeout(timer4);
    };
  }, [routeKey]);

  if (!loading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1">
      <div
        className="h-full bg-primary transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          boxShadow: "0 0 10px hsl(var(--primary) / 0.5)",
        }}
      />
    </div>
  );
};

export default LoadingBar;

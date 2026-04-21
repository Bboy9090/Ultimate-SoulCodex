import React from "react";

interface LoaderProps {
  label?: string;
  fullPage?: boolean;
}

const CosmicLoader: React.FC<LoaderProps> = ({ label, fullPage = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="relative">
        <div className="loader-orb" />
        <div 
          className="absolute inset-0 rounded-full blur-xl opacity-30 animate-pulse"
          style={{ background: "var(--sc-gold)" }}
        />
      </div>
      
      {label && (
        <div className="space-y-2">
          <p className="text-sc-gold font-serif text-lg tracking-widest uppercase animate-pulse">
            {label}
          </p>
          <div className="ritual-progress-container w-48 mx-auto">
            <div className="ritual-progress-bar" />
          </div>
        </div>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-sc-bg-ink/90 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return content;
};

export default CosmicLoader;

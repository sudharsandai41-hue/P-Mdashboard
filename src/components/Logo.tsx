export default function Logo() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex items-end font-sans tracking-tight text-brand-text mb-1">
        <span className="font-bold text-3xl">pencil</span>
        <span className="text-xl pb-[2px] opacity-70 ml-1">& monk</span>
        <span className="text-[10px] pb-4 ml-1 opacity-50 relative -top-1">TM</span>
      </div>
      {/* Brand Color Bar */}
      <div className="flex w-full h-1 mt-1">
        <div className="bg-[#E6D4AA] flex-1"></div>
        <div className="bg-[#C8B6E2] flex-1"></div>
        <div className="bg-[#F3C4D6] flex-1"></div>
        <div className="bg-[#BCE2C2] flex-1"></div>
        <div className="bg-[#F7E7A6] flex-1"></div>
      </div>
    </div>
  );
}

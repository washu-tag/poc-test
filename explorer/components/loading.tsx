export function LoadingEllipses() {
  const commonCss = `w-2 h-2 bg-gray-600 rounded-full animate-bounce`;
  return (
    <>
      <div className="flex justify-center items-center mt-2">
        <div className={`${commonCss} mr-1 [animation-delay:-0.3s]`}></div>
        <div className={`${commonCss} mr-1 [animation-delay:-0.15s]`}></div>
        <div className={`${commonCss}`}></div>
      </div>
    </>
  );
}

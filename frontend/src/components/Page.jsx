function Page({ children, className = "" }) {
  return (
    <main
      className={`mx-auto min-h-screen max-w-md bg-[#101511] px-5 pb-24 pt-6 text-white ${className}`}
    >
      {children}
    </main>
  );
}

export default Page;
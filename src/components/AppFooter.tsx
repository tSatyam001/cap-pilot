export default function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="h-10  bg-# px-6 flex items-center justify-center">
      <span className="text-xs text-muted-foreground text-center">
        © {year} CapPilot. All rights reserved.
      </span>
    </footer>
  );
}

import { SidebarProvider } from "@/components/ui/sidebar";

// Main App component
function App() {
  return (
    // Provide sidebar context and dark mode, set default open state from cookie
    <SidebarProvider className="dark" defaultOpen={getSidebarDefaultOpen()}>
      {/* ...your routes/components... */}
    </SidebarProvider>
  );
}

// Helper to read sidebar state from cookie
function getSidebarDefaultOpen(): boolean {
  // Match sidebar_state cookie for expanded/collapsed
  const match = document.cookie.match(/(?:^|; )sidebar_state=(expanded|collapsed)/);
  if (match) {
    return match[1] === "expanded";
  }
  return true; // default to open if cookie not set
}

export default App;
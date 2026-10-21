import { Component, StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import messages from "../shared/generated/web/ui.json";
class ApplicationBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error) { console.error("Application render failed:", error.message); }
  render() {
    const labels = messages[__WEB_CONFIG__.defaultUiLanguage];
    return this.state.error ? <main role="alert"><h1>{labels.error}</h1><p>{this.state.error.message}</p>
      <button onClick={() => this.setState({ error: null })}>{labels.retry}</button></main> : this.props.children;
  }
}
const root = document.getElementById("root");
if (!root) throw new Error("Missing application root");
createRoot(root).render(<StrictMode><ApplicationBoundary><App /></ApplicationBoundary></StrictMode>);

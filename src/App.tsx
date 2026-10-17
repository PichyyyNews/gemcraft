import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { GemcraftLogo } from "./components/GemcraftLogo";
import "./App.css";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  // Default theme is dark (white logo as main)
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <main className={`container app-theme-${theme}`}>
      <div className="theme-toggle-bar">
        <button type="button" onClick={toggleTheme} className="theme-btn">
          Switch to {theme === "dark" ? "Light (Black Logo)" : "Dark (White Logo)"}
        </button>
      </div>

      <div className="logo-hero">
        <GemcraftLogo
          theme={theme}
          className="gemcraft-main-logo"
          style={{ width: "160px", height: "160px" }}
        />
      </div>

      <h1>Gemcraft</h1>
      <p className="subtitle">
        Local Reverse-Engineered NotebookLM Desktop
      </p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>
      <p className="greet-msg">{greetMsg}</p>
    </main>
  );
}

export default App;


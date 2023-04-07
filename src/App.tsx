import GamesList from "./components/GamesList";
import Upload from "./components/Upload";
import { useState } from "react";

export default function App() {
  const [success, setSuccess] = useState<string | null>(null);

  return (
    <div className="App">
      <div className="head-title">Shanto Games Collection</div>

      <Upload setSuccess={setSuccess} />
      <GamesList />
    </div>
  );
}

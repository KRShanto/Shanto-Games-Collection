import GamesList from "./components/GamesList";
import Upload from "./components/Upload";
import { useState } from "react";
import { PopupType } from "./types/popup";

export default function App() {
  const [popup, setPopup] = useState<PopupType>(null);
  const [success, setSuccess] = useState<string | null>(null);

  return (
    <div className="App">
      <div className="head-title">Shanto Games Collection</div>

      <Upload setSuccess={setSuccess} setPopup={setPopup} />
      <GamesList />
    </div>
  );
}

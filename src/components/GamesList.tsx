import { useState, useEffect } from "react";
import { GameType } from "../types/game";
import { FiDownload } from "react-icons/fi";
import { FiCopy } from "react-icons/fi";

export default function GamesList({ games }: { games: GameType[] }) {
  const [queryGame, setQueryGame] = useState<string | null>(null);

  useEffect(() => {
    // Check if the URL has a game query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const game = urlParams.get("game");

    if (game) {
      setQueryGame(game);
    }
  }, []);

  const handleCopy = (slug: string) => {
    const text = `${window.location.origin}?game=${slug}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="games-list">
      {games.map((game) => (
        <div
          key={game.id}
          className={`game ${queryGame === game.slug ? "active" : ""}`}
        >
          <h3 className="name">{game.name}</h3>

          <div className="options">
            <button
              className="copy option"
              onClick={() => handleCopy(game.slug)}
            >
              Copy Link
              <FiCopy />
            </button>

            <a href={game.downloadUrl} className="download option">
              Download
              <FiDownload />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

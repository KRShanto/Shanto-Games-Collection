import { useState, useEffect } from "react";
import GamesList from "./components/GamesList";
import Upload from "./components/Upload";
import Update from "./components/Update";
import { PopupType } from "./types/popup";
import { GameType } from "./types/game";
import { collection, getDocs } from "firebase/firestore";
import { db, storage } from "./configs/firebase";
import { getDownloadURL, ref } from "firebase/storage";
import SiteOptions from "./components/SiteOptions";

export default function App() {
  const [popup, setPopup] = useState<PopupType>(null);
  const [games, setGames] = useState<GameType[]>([]);

  useEffect(() => {
    const getGames = async () => {
      const querySnapshot = await getDocs(collection(db, "games"));

      querySnapshot.forEach(async (doc) => {
        const url = await getDownloadURL(
          ref(storage, `games/${doc.data().slug}`)
        );

        setGames((prev) => [
          ...prev,
          {
            id: doc.id,
            name: doc.data().name,
            slug: doc.data().slug,
            downloadUrl: url,
          },
        ]);
      });
    };

    getGames();
  }, []);

  return (
    <div className="App">
      <h1 className="site-title">Shanto Games Collection</h1>

      <SiteOptions setPopup={setPopup} />

      {popup === "UploadForm" && (
        <Upload setPopup={setPopup} setGames={setGames} />
      )}

      {popup === "UpdateForm" && (
        <Update setPopup={setPopup} setGames={setGames} games={games} />
      )}

      <GamesList games={games} />
    </div>
  );
}

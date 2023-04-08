import React, { useState } from "react";
import Dragzone from "react-dropzone";
import { storage, db } from "../configs/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { query, where, getDocs, collection, addDoc } from "firebase/firestore";
import slugify from "slugify";
import { PopupType } from "../types/popup";
import { FiUploadCloud } from "react-icons/fi";
import { GameType } from "../types/game";

export default function Update({
  setPopup,
  games,
  setGames,
}: {
  setPopup: React.Dispatch<React.SetStateAction<PopupType>>;
  games: GameType[];
  setGames: React.Dispatch<React.SetStateAction<GameType[]>>;
}) {
  const [gameName, setGameName] = useState<GameType>(games[0]);
  const [pasword, setPassword] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string>();
  const [focus, setFocus] = useState(false);

  const onDrop = (acceptedFiles: File[]) => {
    // Check if the file ends with .apk or not
    if (acceptedFiles[0].name.endsWith(".apk")) {
      setFile(acceptedFiles[0]);
    } else {
      setError("Please upload a .apk file");
    }
  };

  const updateFile = async () => {
    if (pasword === "") {
      setError("Please enter a password");
      return;
    } else {
      const actualPassword = process.env.REACT_APP_PASSWORD;

      if (actualPassword !== pasword) {
        setError("Wrong password");
        return;
      }
    }

    if (file === null) {
      setError("Please select a file");
      return;
    }

    const slug = gameName.slug;

    const storageRef = ref(storage, `games/${slug}`);
    // update the file
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      },
      (error) => {
        setError(error.message);
      },
      async () => {
        // Get the download URL
        const downloadURL = await getDownloadURL(storageRef);

        // successfully updated
        setProgress(0);
        setPopup(null);
        setFile(null);

        // update the game in the state
        // update only downloadURL
        setGames((prevGames) => {
          return prevGames.map((game) => {
            if (game.slug === slug) {
              return {
                ...game,
                downloadURL,
              };
            } else {
              return game;
            }
          });
        });
      }
    );
  };

  return (
    <div className="popup form upload-form">
      <h1 className="title">
        <FiUploadCloud className="icon" />
        Update Game
      </h1>

      {error && <p className="error">{error}</p>}

      <div className="form-wrapper select">
        <label htmlFor="select-update">Select game</label>

        <div className="select-input">
          <button
            type="button"
            id={gameName.name}
            className="select-btn"
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
          >
            {gameName.name}
          </button>

          <div
            className="select-options"
            style={{
              transform: focus ? "scaleY(1)" : "scaleY(0)",
            }}
          >
            {games.map((game) => (
              <button
                className="option"
                type="button"
                key={game.slug}
                onClick={() => {
                  setGameName(game);
                }}
              >
                {game.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="form-wrapper label-input">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={pasword}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="form-wrapper drag">
        <Dragzone onDrop={onDrop}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <p className="text">
                Drag your game file here or click here to select a file
              </p>
            </div>
          )}
        </Dragzone>
      </div>

      {file && (
        <div className="file-info">
          <p className="name">
            File name: <span className="data">{file.name}</span>
          </p>
          <p className="size">
            File size:{" "}
            <span className="data">
              {Math.round((file.size / 1024 / 1024) * 100) / 100}
              MB
            </span>
          </p>
        </div>
      )}

      {progress > 0 && (
        <div className="progress">
          <p className="perc">{Math.round(progress)}%</p>

          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
      )}

      <button onClick={updateFile} type="submit" className="btn">
        Update
      </button>

      <button className="btn" onClick={() => setPopup(null)} type="button">
        Cancel
      </button>
    </div>
  );
}

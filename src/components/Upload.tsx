import React, { useState } from "react";
import Dragzone from "react-dropzone";
import { storage, db } from "../configs/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { query, where, getDocs, collection, addDoc } from "firebase/firestore";
import slugify from "slugify";
import { PopupType } from "../types/popup";
import { FiUploadCloud } from "react-icons/fi";
import { GameType } from "../types/game";

// A component that allows the user to upload a file to Firebase Storage.
export default function Upload({
  setPopup,
  setGames,
}: {
  setPopup: React.Dispatch<React.SetStateAction<PopupType>>;
  setGames: React.Dispatch<React.SetStateAction<GameType[]>>;
}) {
  const [gameName, setGameName] = useState<string>("");
  const [pasword, setPassword] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string>();

  const onDrop = (acceptedFiles: File[]) => {
    // Check if the file ends with .apk or not
    if (acceptedFiles[0].name.endsWith(".apk")) {
      setFile(acceptedFiles[0]);
    } else {
      setError("Please upload a .apk file");
    }
  };

  const uploadFile = async () => {
    if (gameName === "") {
      setError("Please enter a game name");
      return;
    }

    if (file === null) {
      setError("Please select a file");
      return;
    }

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

    const slug = slugify(gameName, {
      replacement: "-",
      strict: true,
      lower: true,
    });

    const q = query(collection(db, "games"), where("slug", "==", slug));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.size > 0) {
      setError("Game name already exists");
      return;
    }

    const newGame = await addDoc(collection(db, "games"), {
      name: gameName,
      slug: slug,
    });

    const storageRef = ref(storage, `games/${slug}`);
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
        // successfull upload
        setProgress(0);
        setFile(null);
        setGameName("");
        setPopup(null);

        // update games list
        const newGameData = {
          id: newGame.id,
          name: gameName,
          slug: slug,
          downloadUrl: await getDownloadURL(storageRef),
        };

        setGames((prev) => {
          return [...prev, newGameData];
        });
      }
    );
  };

  return (
    <div className="upload-form popup form">
      <h1 className="title">
        <FiUploadCloud className="icon" />
        Upload Game
      </h1>

      {error && <p className="error">{error}</p>}

      <div className="form-wrapper label-input">
        <label htmlFor="game-name">Game Name</label>
        <input
          type="text"
          id="game-name"
          value={gameName}
          onChange={(e) => setGameName(e.target.value)}
        />
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

      <button onClick={uploadFile} type="submit" className="btn">
        Upload
      </button>

      <button className="btn" onClick={() => setPopup(null)} type="button">
        Cancel
      </button>
    </div>
  );
}

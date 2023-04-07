import React, { useState } from "react";
import Dragzone from "react-dropzone";
import { storage, db } from "../configs/firebase";
import { ref, uploadBytesResumable } from "firebase/storage";
import { query, where, getDocs, collection, addDoc } from "firebase/firestore";
import slugify from "slugify";
import { PopupType } from "../types/popup";
import { FiUploadCloud } from "react-icons/fi";

// A component that allows the user to upload a file to Firebase Storage.
export default function Upload({
  setSuccess,
  setPopup,
}: {
  setSuccess: React.Dispatch<React.SetStateAction<string | null>>;
  setPopup: React.Dispatch<React.SetStateAction<PopupType>>;
}) {
  const [gameName, setGameName] = useState<string>("");
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

    await addDoc(collection(db, "games"), {
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
      () => {
        // successfull upload
        setSuccess("File uploaded successfully");
        setProgress(0);
        setFile(null);
        setGameName("");
        setPopup(null);
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
          <p>File name: {file.name}</p>
          <p>
            File size:
            {Math.round((file.size / 1024 / 1024) * 100) / 100}
            MB
          </p>
        </div>
      )}

      {progress > 0 && (
        <div className="progress">
          <p className="perc">{Math.round(progress)}%</p>

          <div className="bar">
            <div
              className="progress-bar"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      <button onClick={uploadFile} type="submit">
        Upload
      </button>
    </div>
  );
}

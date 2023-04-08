import React from "react";
import { PopupType } from "../types/popup";

export default function SiteOptions({
  setPopup,
}: {
  setPopup: React.Dispatch<React.SetStateAction<PopupType>>;
}) {
  return (
    <div className="site-options">
      <button className="upload option" onClick={() => setPopup("UploadForm")}>
        Upload
      </button>

      <button className="update option" onClick={() => setPopup("UpdateForm")}>
        Update
      </button>

      <button className="delete option" onClick={() => setPopup("DeleteForm")}>
        Delete
      </button>
    </div>
  );
}

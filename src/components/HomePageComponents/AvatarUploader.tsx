import React, { useState, useEffect } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../utils/firebase/firebase.config";
import { getFirestore, setDoc, doc, getDoc } from "firebase/firestore";
import { useUser } from "../RequireAuth/context/AuthContext";
import { useFirebaseFetch } from "../hooks/useFirebaseFetch";

const AvatarUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const user = useUser();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
      handleUpload(event.target.files[0]);
    }
  };

  const handleUpload = async (file: File) => {
    if (!user) return alert("Nie znaleziono użytkownika");

    setIsLoading(true);
    setUploading(true);
    if (file.size > 1.5 * 1024 * 1024) {
      alert("Plik powinien być miejszy niż 1.5 MB.");
      setUploading(false);
      return setIsLoading(false);
    }

    const storageRef = ref(storage, `/files/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on(
      "state_changed",
      null,
      (err) => {
        console.log(err);
        setUploading(false);
        setIsLoading(false);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        setImageUrl(url);
        setUploading(false);
        await setDoc(
          doc(getFirestore(), "users", user.uid),
          { avatar: file.name },
          { merge: true }
        );
        setIsLoading(false);
      }
    );
  };

  useEffect(() => {
    if (!user) return;

    const fetchAvatar = async () => {
      const userRef = doc(getFirestore(), "users", user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData && userData.avatar && userData.avatar !== "-1") {
          const avatarUrl = await getDownloadURL(
            ref(storage, `/files/${userData.avatar}`)
          );
          setImageUrl(avatarUrl);
        }
      }
      setIsLoading(false);
    };

    fetchAvatar();
  }, [user]);

  return (
    <div>
      <label htmlFor="fileInput">
        {isLoading ? (
          <div>Czekaj</div>
        ) : imageUrl ? (
          <img
            className="avatar"
            src={imageUrl}
            alt="Uploaded"
            style={{
              borderRadius: "50%",
              width: "150px",
              height: "150px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              background: uploading ? "#f3f3f3" : undefined,
            }}
          />
        ) : (
          <div
            style={{
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              border: "2px solid",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
            }}>
            Dodaj avatar
          </div>
        )}
      </label>
      <input
        id="fileInput"
        type="file"
        onChange={handleChange}
        accept="image/*"
        style={{ display: "none" }}
      />
    </div>
  );
};

export default AvatarUploader;

import { useEffect, useState } from "react";
import { getDoc, doc } from "firebase/firestore";
import { Outlet, useNavigate } from "react-router-dom";
import { useUser } from "./context/AuthContext";
import { database } from "../../utils/firebase/firebase.config";

const RequireAuth = () => {
  const user = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) return;

      const docRef = doc(database, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        console.log(userData.role);
        if (userData.role === "admin") {
          setIsAdmin(true);
        }
      }
    };

    checkUserRole();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      navigate("/panelAdmina");
    }
  }, [isAdmin, navigate]);

  return user ? <Outlet /> : null;
};

export default RequireAuth;

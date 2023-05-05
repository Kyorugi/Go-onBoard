import { useState, useEffect, createContext } from "react";
import { database } from "../../utils/firebase/firebase.config"; // import storage
import { collection, getDocs } from "firebase/firestore";
import { ref, getDownloadURL, getStorage } from "firebase/storage";
import { getApp } from "firebase/app";
import { Outlet, Link } from "react-router-dom";
import "../../index.css";
import { StagesContext, StagesContextValue } from "./Context/StagesContext";
import { useUser } from "../RequireAuth/context/AuthContext";
import ProgressEtap from "../activities/ProgressEtap";
import { EtapsContainer, EtapsIcon } from "../activities/ProgressEtap.styled";

interface Etap {
  id: string;
  name: string;
  sort: number;
  icon: string;
}

interface Props {
  etapData: {
    etapsID: string;
    onActivityConfirmation: (newActivityId: string) => void;
  };
}

function Etaps() {
  const user = useUser();
  const [etaps, setEtaps] = useState<Etap[]>([]);
  const [etapId, setEtapId] = useState<string | null>(null);
  const [activitiesByEtap, setActivitiesByEtap] = useState<
    Record<string, { etap_id: string; id: string }[]>
  >({});
  const [userActivityIds, setUserActivityIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEtapId, setSelectedEtapId] = useState<string | null>(null);

  useEffect(() => {
    async function getEtaps() {
      const etapsRef = collection(database, "etaps");
      const etapsData = await getDocs(etapsRef);

      //make array with etpaid and activities
      const activitiesRef = collection(database, "activities");
      const activitiesData = await getDocs(activitiesRef);
      const activitiesByEtap = activitiesData.docs.reduce<
        Record<string, { etap_id: string; id: string }[]>
      >((acc, doc) => {
        const etapId = doc.data().etap_id;

        if (!acc[etapId]) {
          acc[etapId] = [];
        }

        acc[etapId].push({
          etap_id: etapId,
          id: doc.id,
        });

        return acc;
      }, {});

      setActivitiesByEtap(activitiesByEtap);
      //make array from user_activities with etpaid and activityid
      const userActivitiesRef = collection(database, "user_activities");
      const useractivitiesData = await getDocs(userActivitiesRef);
      const userActivityIds = useractivitiesData.docs
        .filter((doc) => doc.data().user_id === user?.uid) // Filter based on user ID
        .map((doc) => doc.data().user_activity_id);

      setUserActivityIds(userActivityIds);
      console.log(userActivityIds);

      //icon part, take from storage and push in button
      const etapsArray: Etap[] = await Promise.all(
        etapsData.docs.map(async (doc) => {
          const etap = {
            id: doc.id,
            name: doc.data().name,
            sort: doc.data().sort,
            icon: "",
          };

          const firebaseApp = getApp();
          const storage = getStorage(firebaseApp);

          const iconRef = ref(storage, doc.data().icon);
          const iconUrl = await getDownloadURL(iconRef);
          etap.icon = iconUrl;

          return etap;
        })
      );

      setEtaps(etapsArray);
      setIsLoading(false);
    }

    getEtaps();
  }, []);

  //props to confirm button-after confirm check status to show etpas when all activ in etap are completed

  const handleActivityConfirmation = (newActivityId: string) => {
    setUserActivityIds((prevActivityIds) => [
      ...prevActivityIds,
      newActivityId,
    ]);
  };

  const stagesContextValue: StagesContextValue = {
    handleActivityConfirmation,
    etapId,
  };
  // sort etaps by "sort" key in firebase
  const sortedEtaps = [...etaps].sort((a, b) => a.sort - b.sort);

  if (isLoading) {
    return <div>Ładowanie...</div>; // Show a loading indicator while fetching data
  }

  return (
    <StagesContext.Provider value={stagesContextValue}>
      <Link to={`/dashboard/${user?.uid}`}>
        <button>Powrót</button>
      </Link>
      <EtapsContainer>
        <ProgressEtap />
        <div className="contentWrap">
          <>
            <div className="listEtaps">
              {sortedEtaps.map((etap, index) => {
                //check previous etap if all activities are completed, next etap is enable
                const isPreviousEtapCompleted =
                  index === 0 ||
                  (index > 0 &&
                    activitiesByEtap[sortedEtaps[index - 1].id]?.length ===
                      userActivityIds.filter((activityId) =>
                        activitiesByEtap[sortedEtaps[index - 1].id].some(
                          (activity) => activity.id === activityId
                        )
                      ).length);

                const enableLink = isPreviousEtapCompleted;
                return (
                  <Link
                    className="stages-links"
                    to={enableLink ? `/etaps/${etap.id}` : "#"}
                    key={etap.id}
                    onClick={() => {
                      setEtapId(etap.id);
                      setSelectedEtapId(etap.id);
                    }}
                    style={{
                      pointerEvents: enableLink ? "auto" : "none",
                      backgroundColor:
                        etap.id === selectedEtapId
                          ? "var(--active)"
                          : enableLink
                          ? ""
                          : "var(--primary-2)", // Kolor dla etapów niedostępnych
                    }}>
                    {etap.icon && (
                      <EtapsIcon
                        src={etap.icon}
                        alt={etap.name}
                      />
                    )}
                    <span className="title-etaps">{etap.name}</span>
                  </Link>
                );
              })}
            </div>
            <Outlet />
          </>
        </div>
      </EtapsContainer>
    </StagesContext.Provider>
  );
}

export default Etaps;

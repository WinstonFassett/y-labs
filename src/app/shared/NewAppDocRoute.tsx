import { useNavigate } from "react-router-dom";
import { generateId } from "@/app/shared/generateId";
import { useEffect } from "react";
import { saveOfflineDoc } from "./store/local-yjs-idb";

export function NewAppDocRoute() {
  const id = generateId();
  const navigate = useNavigate();

  useEffect(() => {
    async function enablePersistence() {
      await saveOfflineDoc(id);
      navigate(`/edit/${id}`, { replace: true });
    }
    enablePersistence();
  }, []);

  return <div>Creating {id}...</div>;
}

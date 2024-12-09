import { useParams } from "react-router-dom";

export function useDocParams({ type: docType }: { type?: string; } = {}) {
  const { docId, type } = useParams();
  return { docId, type: type ?? docType };
}

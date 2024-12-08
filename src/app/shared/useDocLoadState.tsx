import { useParams, useSearchParams } from "react-router-dom";
import { getDocLoadState } from "./store/doc-loader";
import { useStoreIfPresent } from "./useStoreIfPresent";

export function useDocLoadState() {
  const { docId } = useParams();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");
  const $loadState = docId ? getDocLoadState(docId!, roomId) : undefined
  const loadState = useStoreIfPresent($loadState);
  return { docId, $loadState, loadState };
}

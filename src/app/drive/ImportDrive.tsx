import { map } from "nanostores";

const const importDriveState = map({
  visible: false,
  importing: false,
  progress: 0,
  total: 0,
  errors: [] as string[],
});

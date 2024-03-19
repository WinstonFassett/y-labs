import React from "react";

export const LazyDocPersistenceToggle = React.lazy(
  () => import("../../shared/DocPersistenceToggle"),
);

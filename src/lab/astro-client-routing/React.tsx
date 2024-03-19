/** @jsxImportSource react */
import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  RouterProvider,
  createHashRouter,
  useNavigate,
  useParams,
  useRoutes,
  useSearchParams,
} from "react-router-dom";

export const routes = [
  {
    path: "/",
    element: <Root />,
  },
  { path: "/page1", element: <Page1 /> },
  { path: "/edit", element: <NewDoc /> },
  { path: "/new", element: <NewDoc /> },
  {
    path: "/edit/:docId",
    element: <Editor />,
  },
];
const router = createHashRouter(routes);
export default function App() {
  return (
    <div className="bg-base-300 p-4 rounded">
      <p>This is rendered by React</p>
      <RouterProvider router={router} />
    </div>
  );
}

function Routes() {
  let element = useRoutes(routes);
  console.log({ element, routes });
  return element;
}

function Root() {
  return (
    <div>
      <Nav />
      <h1>Root Page</h1>
    </div>
  );
}

function Page1() {
  return (
    <div>
      <Nav />
      <h1>Page 1</h1>
    </div>
  );
}

function NewDoc() {
  const id = Math.random().toString(36).substr(2, 9);
  return <Navigate to={`/edit/${id}`} replace />;
}

function Editor() {
  const params = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const x = searchParams.get("x");
  const [key, setKey] = useState("");
  let { docId } = params;
  useEffect(() => {
    setKey("");
  }, [docId]);
  console.log({ params, searchParams, x: x });
  useEffect(() => {
    if (x) {
      setKey(x);
      setSearchParams(undefined, { replace: true });
      // navigate("");
    }
  }, [x]);
  return (
    <div>
      <Nav />
      <h1>Editing {docId}</h1>
      <pre className="code whitespace-pre-wrap p-2 bg-base-200">
        {JSON.stringify({ x, key })}
      </pre>
    </div>
  );
}

function Nav() {
  return (
    <div className="flex gap-2">
      <Link className="link" to={routes[0].path}>
        Root
      </Link>
      <Link className="link" to={routes[1].path}>
        Page 1
      </Link>
      <Link className="link" to={"/edit/ABC?x=123"}>
        Edit Doc ABC
      </Link>
      <Link className="link" to={"/edit/DEF?x=456"}>
        Edit Doc DEF
      </Link>
      <Link className="link" to={"/edit"}>
        Edit new doc
      </Link>
    </div>
  );
}

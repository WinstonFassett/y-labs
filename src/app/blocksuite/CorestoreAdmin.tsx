import { Card } from "@/components/ui/card";
import Hyperdrive from "hyperdrive";
import { useEffect, useRef, useState } from "react";
import { corestore } from "../shared/corestore";
import { DbAdmin } from "./DbAdmin";

export function CorestoreAdmin () {
  return (
    <div>
      <h1 className='text-2xl'>Corestore Admin</h1>
      <DbAdmin />
    </div>
  )
}

export function CorestoreAdminR1() {
  const [cores, setCores] = useState<Map<string, any>>(corestore.cores);
  const coreDriveMapRef = useRef<Map<string, Hyperdrive>>(new Map()); 
  const [coreDrives, setCoreDrives] = useState<{[key: string]: Hyperdrive}>([]);
  useEffect(() => {
    function onCoreOpen(core) {
      setCores(new Map(corestore.cores));
    }
    function onCoreClose(core) {
      setCores(new Map(corestore.cores));
      const drive = coreDriveMapRef.current.get(core.key);
      if (drive) {
        coreDriveMapRef.current.delete(core.key);
        setCoreDrives(value => value.filter(v => v !== drive));
      }
    }
    corestore.on('open', onCoreOpen)
    corestore.on('close', onCoreClose)
    return () => {
      corestore.off('open', onCoreOpen)
      corestore.off('close', onCoreClose)
    }
  }, [corestore])
  return <div>
    <h1 className='text-2xl'>Corestore Admin</h1>
    <ul className="flex flex-col gap-2">
      {Array.from(cores.keys()).map((key) => {
        const core = cores.get(key);
        return <Card key={key} className='p-2 m-2 overflow-auto'>
          <p>Count: {core.length}</p>
          <p>Bytes: {core.byteLength}</p>
          <p>Key:</p>
          <p>
            {key}
          </p>
          {/* {drive && <DriveAdminR1 drive={drive} />} */}
        </Card>
      })}
    </ul>
  </div>;
}

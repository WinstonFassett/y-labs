import { useEffect, useMemo, useRef, useState } from "react";
import { corestore } from "../shared/corestore";
import { Card } from "@/components/ui/card";
import Hyperdrive from "hyperdrive";
import { $attachmentDrivesById, db, getAttachmentDriveStore } from "../shared/store/corestore-attachments";
import { useStore } from "@nanostores/react";
import prettyBytes from 'pretty-bytes';
import b4a from 'b4a';
import { collection } from "../shared/store/blocksuite-docs";
import { Loading } from "@/components/ui/loading";
import { getHyperdrivePermalink } from "@/lib/parseHyperdrivePermalink";

export function CorestoreAdmin () {
  const driveMap = useStore($attachmentDrivesById)
  console.log('driveMap', driveMap);
  console.log('db', db);
  const driveEntries = Object.entries(driveMap);
  return (
    <div>
      <h1 className='text-2xl'>Corestore Admin</h1>

      <DbAdmin />

      {/* <h2 className='text-lg'>Drives ({
        Object.keys(driveMap).length  
      })</h2>
      {driveEntries.map(([key, $drive]) => {
        return <DriveStoreCard key={key} $drive={$drive} />
      })}


      <h1 className='text-2xl'>Older</h1>

      <CorestoreAdminR1 />       */}

    </div>
  )
}

function DbAdmin () {
  const [records, setRecords] = useState<any>({});
  useEffect(() => {
    async function go() {
      const cleanup = {}
      for await (const entry of db.createReadStream(null, { live: true })) {
        console.log('entry', entry);
        if (!entry.key.startsWith('hyper:')) {
          cleanup[entry.key] = entry;
          continue;

        }
        setRecords(value => {
          return {
            ...value,
            [entry.key]: entry
          }
        })
      }
      for (const [key, entry] of Object.entries(cleanup)) {
        console.log('cleanup', key, entry);
        await db.del(key);
      }
    }
    go();
  }, [])
  const rows = useMemo(() => {
    return Object.entries(records)
  }, [records])
  return <div>
    <h1 className='text-2xl'>Db Admin</h1>
    
    <p>{rows.length} rows</p>

    <ul className="list-disc list-inside">
      {rows.map(([key, { value }]) => {        
        const driveKeyStr = b4a.toString(value, 'hex');
        return <li key={key}>
          <p>{key}</p>
          <p>{driveKeyStr}</p>
          <DriveStoreCard driveKey={key} />
        </li>
      })}
    </ul>

  </div>  
}

function DriveStoreCard ({ driveKey}) {
  const $drive = getAttachmentDriveStore(driveKey);  
  const drive = useStore($drive);
  useEffect(() => {
    console.log('drive', drive);
    async function init() {
      // await drive.ready();
      console.log('ready!')
    }
    init()
  }, [drive])
  return (
    <Card>
      <p>Drive</p>
      <p>Key: {drive.key}</p>
      <p>Version: {drive.version}</p>
      <DriveAdminR1 drive={drive} />
    </Card>
  )
}

export function CorestoreAdminR1() {
  console.log('corestore', corestore);
  const [cores, setCores] = useState<Map<string, any>>(corestore.cores);
  const coreDriveMapRef = useRef<Map<string, Hyperdrive>>(new Map()); 
  const [coreDrives, setCoreDrives] = useState<{[key: string]: Hyperdrive}>(
    Array.from(cores.entries()).reduce((acc, [key, core]) => {
      let hyperdrive
      // hyperdrive = getHyperdriveMaybe(core);
      // if (hyperdrive) {
      //   coreDriveMapRef.current.set(key, hyperdrive);
      //   acc[key] = hyperdrive;
      // }
      return acc;
    }, {} as any)
  );
  useEffect(() => {
    function onCoreOpen(core) {
      console.log('corestore opened', core);
      setCores(new Map(corestore.cores));
      // const drive = getHyperdriveMaybe(core);
      // if (drive) {
      //   coreDriveMapRef.current.set(core.key, drive);
      //   setCoreDrives(value => value.concat(drive));
      // }
    }
    function onCoreClose(core) {
      console.log('corestore closed');
      setCores(new Map(corestore.cores));
      const drive = coreDriveMapRef.current.get(core.key);
      if (drive) {
        // drive.close();
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



  // const cores: Map<string, any> = corestore.cores;
  console.log('cores', cores);
  


  return <div>
    <h1 className='text-2xl'>Corestore Admin</h1>
    <ul className="flex flex-col gap-2">
      {Array.from(cores.keys()).map((key) => {
        const core = cores.get(key);
        
        // const drive = coreDriveMapRef.current.get(key);
        // if (drive) {
        //   console.log('DRIVE!', drive);
        // }

        // if (core.length > 1) {
        //   console.log('maybe drive', core);
        //   let hyperdrive
        //   try {
        //     hyperdrive = new Hyperdrive(corestore, core.key)
        //   } catch (err) {
        //     console.error('error getting hyperdrive', err);
        //   }
        // }
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
function getHyperdriveMaybe(core: any) {
  if (core.length > 1) {
    console.log('maybe drive', core);
    try {
      return new Hyperdrive(corestore, core.key);
    } catch (err) {
      console.error('error getting hyperdrive', err);
    }
  }  
}


function DriveAdminR1({drive}: {drive: Hyperdrive}) {
  const [files, setFiles] = useState<any[]>([]);
  console.log('get files', drive)
  useEffect(() => {
    async function getfiles() {
      console.log('get files from drive. waiting for ready', drive)
      await drive.ready()
      console.log('ready to list', drive)
      for await (const file of drive.list('/')) {
        console.log('list', file) // => { key, value }
        setFiles(value => value.concat(file));
      }
    }
    getfiles();
    return () => {
      setFiles([])
    }
  }, [drive])
  return <div>
    <h2 className='text-lg'>Drive Admin</h2>
    {files && <div>Files: {files?.length ?? "0"}</div>}

    <ul className="list-disc list-inside">
      {files.map((file) => {
        const {
          key, 
          seq,
          value: { 
            blob: {
              byteLength
            },
            metadata
          }
        } = file
        return <li key={key}>
          <div>
            ({ prettyBytes(byteLength) }) at v{seq} {key}
          </div>
          <SavedImage drive={drive} path={key} />
        </li>
      })}
    </ul>
    
    {/* <InspectCore core={drive.core} /> */}
  </div>
}

function blobToImage(blob: Blob) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}

function SavedImage ({ permalink, drive, path }: { permalink?: string, drive: Hyperdrive, path?: string }) { 
  const [resolvedPermalink, setResolvedPermalink] = useState<string | undefined>(permalink);
  useEffect(() => {
    if (drive && path) {
      getHyperdrivePermalink(drive, path).then((permalink) => {
        setResolvedPermalink(permalink);
      });
    }
  }, [permalink])
  // const resolvedPermalink = useMemo(() =>{
  //   if (permalink) {
  //     return permalink
  //   }
  //   if (drive && path) {
  //     return getHyperdrivePermalink(drive, path);
  //   }
  //   return null;
  // }, [permalink])
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    async function go() {
      if (!resolvedPermalink) { return }
      const blob = await collection.blobSync.get(resolvedPermalink);
      if (!blob) {
        console.error('no blob found for', resolvedPermalink);
        return
      };
      // const blob = await readBlobFromHyperdrive(drive, resolvedPermalink);
      setBlobUrl(URL.createObjectURL(blob));
    }
    go();
  }, [drive, resolvedPermalink])
  
  return (
    <div>
      <h2 className='text-lg'>Saved Image</h2>
      {!blobUrl ? <Loading />  : <img src={blobUrl} />}
    </div>
  )
  
  // const drive = getAttachmentDrive(permalink);
  // const [blob, setBlob] = useState<Blob | null>(null);
  // useEffect(() => {
  //   async function go() {
  //     const blob = await readBlobFromHyperdrive(drive, permalink);
  //     setBlob(blob);
  //   }
  //   go();
  // }, [drive, permalink])
  // return <div>
  //   <h2 className='text-lg'>Saved Image</h2>
  //   <img src={URL.createObjectURL(blob)} />
  // </div>
}

function InspectCore({core}: {core: any}) {
  return <div>
    <h2 className='text-md'>Core</h2>
    <p>Key: {core.key}</p>
    <p>Length: {core.length}</p>
    <p>ByteLength: {core.byteLength}</p>
  </div>
}
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import Hyperdrive from "hyperdrive";
import { db, getAttachmentDriveStore } from "../shared/store/corestore-attachments";
import { useStore } from "@nanostores/react";
import prettyBytes from 'pretty-bytes';
import b4a from 'b4a';
import { collection } from "../shared/store/blocksuite-docs";
import { Loading } from "@/components/ui/loading";
import { getHyperdrivePermalink } from "@/lib/parseHyperdrivePermalink";

export function DbAdmin() {
  const [records, setRecords] = useState<any>({});
  useEffect(() => {
    async function go() {
      const cleanup = {};
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
          };
        });
      }
      for (const [key, entry] of Object.entries(cleanup)) {
        console.log('cleanup', key, entry);
        await db.del(key);
      }
    }
    go();
  }, []);
  const rows = useMemo(() => {
    return Object.entries(records);
  }, [records]);
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
        </li>;
      })}
    </ul>

  </div>;
}
function DriveStoreCard({ driveKey }) {
  const $drive = getAttachmentDriveStore(driveKey);
  const drive = useStore($drive);
  useEffect(() => {
    console.log('drive', drive);
    async function init() {
      // await drive.ready();
      console.log('ready!');
    }
    init();
  }, [drive]);
  return (
    <Card>
      <p>Drive</p>
      <p>Key: {drive.key}</p>
      <p>Version: {drive.version}</p>
      <DriveAdminR1 drive={drive} />
    </Card>
  );
}
function DriveAdminR1({ drive }: { drive: Hyperdrive; }) {
  const [files, setFiles] = useState<any[]>([]);
  console.log('get files', drive);
  useEffect(() => {
    async function getfiles() {
      console.log('get files from drive. waiting for ready', drive);
      await drive.ready();
      console.log('ready to list', drive);
      for await (const file of drive.list('/')) {
        console.log('list', file); // => { key, value }
        setFiles(value => value.concat(file));
      }
    }
    getfiles();
    return () => {
      setFiles([]);
    };
  }, [drive]);
  return <div>
    <h2 className='text-lg'>Drive Admin</h2>
    {files && <div>Files: {files?.length ?? "0"}</div>}

    <ul className="list-disc list-inside">
      {files.map((file) => {
        const {
          key, seq, value: {
            blob: {
              byteLength
            }, metadata
          }
        } = file;
        return <li key={key}>
          <div>
            ({prettyBytes(byteLength)}) at v{seq} {key}
          </div>
          <SavedImage drive={drive} path={key} />
        </li>;
      })}
    </ul>

    {/* <InspectCore core={drive.core} /> */}
  </div>;
}
function SavedImage({ permalink, drive, path }: { permalink?: string; drive: Hyperdrive; path?: string; }) {
  const [resolvedPermalink, setResolvedPermalink] = useState<string | undefined>(permalink);
  useEffect(() => {
    if (drive && path) {
      getHyperdrivePermalink(drive, path).then((permalink) => {
        setResolvedPermalink(permalink);
      });
    }
  }, [permalink]);
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
      if (!resolvedPermalink) { return; }
      const blob = await collection.blobSync.get(resolvedPermalink);
      if (!blob) {
        console.error('no blob found for', resolvedPermalink);
        return;
      };
      // const blob = await readBlobFromHyperdrive(drive, resolvedPermalink);
      setBlobUrl(URL.createObjectURL(blob));
    }
    go();
  }, [drive, resolvedPermalink]);

  return (
    <div>
      <h2 className='text-lg'>Saved Image</h2>
      {!blobUrl ? <Loading /> : <img src={blobUrl} />}
    </div>
  );

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

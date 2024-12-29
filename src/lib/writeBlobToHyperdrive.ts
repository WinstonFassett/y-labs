import Hyperdrive from 'hyperdrive';

export async function writeBlobToHyperdrive(blob: Blob, drive: Hyperdrive, path: string) {
  await drive.ready();
  const readableStream = blob.stream();
  const writer = drive.createWriteStream(path);
  const reader = readableStream.getReader();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      writer.write(value);
    }
  } catch (error) {
    console.error("Error during streaming:", error);
  } finally {
    writer.end();
    return new Promise<void>((resolve, reject) => {
      writer.once('finish', () => {
        resolve();
      });
      writer.once('error', (err) => {
        console.error('write error', err);
        reject(err);
      });
    });
  }
}

export async function readBlobFromHyperdrive(hyperdrive: Hyperdrive, path: string): Promise<Blob> {
  await hyperdrive.ready();
  const readable = hyperdrive.createReadStream(path);
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of readable) {
        controller.enqueue(chunk);
      }
      controller.close();
    }
  });
  return new Response(stream).blob();  
}

import Hyperdrive from 'hyperdrive';

export async function writeBlobToHyperdrive(blob: Blob, drive: Hyperdrive, path: string) {
  await drive.ready();
  const readableStream = blob.stream(); // Get ReadableStream from Blob
  const writer = drive.createWriteStream(path); // Create Hyperdrive WritableStream
  const reader = readableStream.getReader(); // Get a reader for the ReadableStream

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break; // Exit when the stream is done
      writer.write(value); // Write each chunk to the Hyperdrive stream
    }
  } catch (error) {
    console.error("Error during streaming:", error);
  } finally {
    writer.end(); // Close the writable stream
    return new Promise<void>((resolve, reject) => {
      writer.once('finish', () => {
        console.log('write finished');
        resolve();
      });
      writer.once('error', (err) => {
        console.error('write error', err);
        reject(err);
      });
    });
    // wsonsole.log("Stream finished");
  }
}

async function writeBlobToHyperdriveR1(blob: Blob, hyperdrive: Hyperdrive, path: string) {
  await hyperdrive.ready();

  // const readable = new Readable({
  //   async read(size) {
  //     try {
  //       const { done, value } = await this.reader.read();
  //       if (done) {
  //         this.push(null); // Signal end of stream
  //       } else {
  //         this.push(value); // Push chunk
  //       }
  //     } catch (err) {
  //       this.destroy(err);
  //     }
  //   }
  // });
  // readable.reader = blob.stream().getReader();
  // const writable = hyperdrive.createWriteStream(path);
  // return new Promise<void>((resolve, reject) => {
  //   pipeline(
  //     readable,
  //     writable,
  //     (err) => {
  //       if (err) {
  //         console.error('Pipeline failed', err);
  //         reject(err);
  //       } else {
  //         console.log('Successfully wrote blob to hyperdrive');
  //         resolve();
  //       }
  //     }
  //   );
  // });
}
export async function readBlobFromHyperdrive(hyperdrive: Hyperdrive, path: string): Promise<Blob> {
  console.log('reading', path, { hyperdrive });
  await hyperdrive.ready();
  const readable = hyperdrive.createReadStream(path);

  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of readable) {
        console.log('chunk', chunk);
        controller.enqueue(chunk);
      }
      controller.close();
    }
  });
  const blob = new Response(stream).blob();
  console.log('blob', blob);
  return blob;
}

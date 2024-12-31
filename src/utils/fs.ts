export function getFileName(fileHandle: FileSystemFileHandle) {
  return fileHandle.name
}

export async function writeFile(
  fileHandle: FileSystemFileHandle,
  contents: string,
) {
  // Create a FileSystemWritableFileStream to write to.
  const writable = await fileHandle.createWritable()
  // Write the contents of the file to the stream.
  await writable.write(contents)
  // Close the file and write the contents to disk.
  await writable.close()
}

export async function readFile(
  fileHandle: FileSystemFileHandle,
): Promise<string> {
  const file = await fileHandle.getFile()
  const contents = await file.text()
  return contents
}

const urlMap = new Map<File, string>()

export async function createFileURL(
  fileHandle: FileSystemFileHandle,
): Promise<string> {
  const file = await fileHandle.getFile()
  const cached = urlMap.get(file)
  if (cached) return cached
  const url = URL.createObjectURL(file)
  urlMap.set(file, url)
  return url
}

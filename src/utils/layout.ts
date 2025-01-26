export interface Box {
  xmin: number
  ymin: number
  xmax: number
  ymax: number
  text: string
}

type BoxOutput = [number, number, number, number, string]
type JsonOutput = {
  contents: BoxOutput[]
  imginfo: {
    img_width: number
    img_height: number
    img_path: string
    img_name: string
  }
}

export function convertFormat(old: JsonOutput): Box[] {
  const [width, height] = [old.imginfo.img_width, old.imginfo.img_height]
  return old.contents.map((i) => ({
    xmin: i[0] / width,
    ymin: i[1] / height,
    xmax: i[2] / width,
    ymax: i[3] / height,
    text: i[4],
  }))
}

export function saveBack(boxes: Box[], old: JsonOutput): JsonOutput {
  const [width, height] = [old.imginfo.img_width, old.imginfo.img_height]
  return {
    contents: boxes.map((i) => [
      Math.round(i.xmin * width),
      Math.round(i.ymin * height),
      Math.round(i.xmax * width),
      Math.round(i.ymax * height),
      i.text,
    ]),
    imginfo: old.imginfo,
  }
}

export function genKey(box: Box) {
  return [box.xmin, box.ymin, box.xmax, box.ymax]
    .map((i) => Math.round((i * 10) ^ 6))
    .join('-')
}

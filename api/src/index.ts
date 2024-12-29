interface PageContent {
  page: number
  content: string
}

function getAll(book: string): PageContent[] {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(book)
  if (sheet === null) return []

  const result: PageContent[] = []
  const data = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues()
  data.map((row, index) => {
    const content = row[0]
    result.push({
      page: index + 1,
      content: `${content}`,
    })
  })
  return result
}

function getByPage(book: string, _page: string): PageContent | null {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(book)
  const page = parseInt(_page)
  if (sheet === null || isNaN(page)) return null

  const value = sheet.getRange(page, 1).getValue()
  return { page, content: value }
}

const createJson = (result: any) =>
  ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
    ContentService.MimeType.JSON,
  )
const createText = (result: string) =>
  ContentService.createTextOutput(result).setMimeType(
    ContentService.MimeType.TEXT,
  )

function updateAll(book: string, pages: PageContent[]) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(book)
  if (sheet === null) return

  pages.forEach(({ page, content }) => {
    sheet.getRange(page, 1).setValue(content)
  })
}

function updateByPage(book: string, { page, content }: PageContent) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(book)
  if (sheet === null) return

  sheet.getRange(page, 1).setValue(content)
}

function doGet(e: GoogleAppsScript.Events.DoGet) {
  try {
    const { book, type, page } = e.parameter
    switch (type) {
      case "getAll": {
        const result = getAll(book)
        return createJson(result)
      }
      case "getByPage": {
        const result = getByPage(book, page)
        return createJson(result)
      }
      default:
        return createText("not supported type")
    }
  } catch (error) {
    return createText(`An error occurred: ${error.toString()}`)
  }
}

function doPost(e: GoogleAppsScript.Events.DoPost) {
  try {
    const { book, type } = e.parameter
    switch (type) {
      case "updateAll": {
        const pages = JSON.parse(e.postData.contents)
        updateAll(book, pages)
        return createText("updated")
      }
      case "updateByPage": {
        const page = JSON.parse(e.postData.contents)
        updateByPage(book, page)
        return createText("updated")
      }
      default:
        return createText("not supported type")
    }
  } catch (error) {
    return createText(`An error occurred: ${error.toString()}`)
  }
}

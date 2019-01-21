import { ParsedArgs } from 'minimist'

import * as path from 'path'
import * as assert from 'assert'

import * as fileUtils from './lib/file-utils'
import * as asyncUtils from './lib/async-utils'
import * as ccdUtils from './lib/ccd-spreadsheet-utils'
import { Substitutor } from './lib/substitutor'

const sourceXlsx = './data/ccd-template.xlsx'

const validateArgs = (args: ParsedArgs): void => {
  assert(!!args.sheetsDir, 'sheets directory argument (-D) is required')
  assert(!!args.destinationXlsx, 'spreadsheet file argument (-o) is required')

  assert(fileUtils.exists(args.sheetsDir), `sheets directory ${args.sheetsDir} not found`)
}

export const run = async (args: ParsedArgs): Promise<void> => {
  validateArgs(args)

  console.log(`Import...\n loading workbook: ${sourceXlsx}`)
  const builder = new ccdUtils.SpreadsheetBuilder(sourceXlsx)
  await builder.loadAsync()

  const sheets = args._.length > 0 ? args._ : fileUtils
    .listJsonFilesInFolder(args.sheetsDir)
    .map((filename) => filename.slice(0, -5))

  await asyncUtils.forEach(sheets, async (sheet) => {
    const jsonPath = path.join(args.sheetsDir, `${sheet}.json`)
    console.log(`  importing sheet data: ${jsonPath}`)
    const json = await fileUtils.readJson(jsonPath, Substitutor.injectEnvironmentVariables)
    ccdUtils.JsonHelper.convertPropertyValueStringToDate('LiveFrom', json)
    ccdUtils.JsonHelper.convertPropertyValueStringToDate('LiveTo', json)
    builder.updateSheetDataJson(sheet, json)
  })

  console.log(` saving workbook: ${args.destinationXlsx}`)
  await builder.saveAsAsync(args.destinationXlsx)

  console.log('done.')
}
import * as fs from 'fs'
import * as path from 'path'

export const readJson = (filename: string, processFn: (data: string) => string): Promise<void> => {
  return new Promise((resolveFn: (value?: any) => void) => {
    fs.readFile(filename, 'utf8', (err: Error, data: string): void => {
      if (err) throw err
      if (processFn) {
        data = processFn(data)
      }
      resolveFn(JSON.parse(data))
    })
  })
}

export const writeJson = (filename: string, json: object): Promise<void> => {
  return new Promise((resolveFn: (value?: any) => void) => {
    fs.writeFile(filename, json, (err) => {
      if (err) throw err
      resolveFn()
    })
  })
}

export const exists = (path: string): boolean => {
  return fs.existsSync(path)
}

export const listJsonFilesInFolder = (dir: string): string[] => {
  const files: string[] = fs.readdirSync(dir)
  return files.filter((file: string): boolean => {
    return path.extname(file) === '.json'
  })
}
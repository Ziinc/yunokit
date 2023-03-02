import {vi} from "vitest"
export const copyFile = vi.fn().mockImplementation((path, data, cb) => {
    cb()
})
export const existsSync = vi.fn()
export const mkdirSync = vi.fn()
export const readdirSync = vi.fn()


export default {
    existsSync,
    mkdirSync,
    copyFile,
    readdirSync
}
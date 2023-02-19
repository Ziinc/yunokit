export const copyFile = jest.fn().mockImplementation((path, data, cb) => {
    cb()
})
export const existsSync = jest.fn()
export const mkdirSync = jest.fn()
export const readdirSync = jest.fn()


export default {
    existsSync,
    mkdirSync,
    copyFile,
    readdirSync
}
module.exports = (mimeType) => {
    let position = mimeType.indexOf('\/')
    fileType = mimeType.slice(0, position);
    return fileType
}
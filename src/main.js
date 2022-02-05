const { app, BrowserWindow } = require('electron');
const path = require("path");

function createWindow() {
    const window = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, '\\preload.js')
        }
    })

    //window.setAspectRatio(1),
    window.loadFile('.\\src\\index.html'),
    window.setMenuBarVisibility(false)
    window.webContents.openDevTools()
}

app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

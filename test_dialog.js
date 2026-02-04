// Test dialog response structure
const { app, dialog } = require('electron');

app.whenReady().then(() => {
    const result = dialog.showMessageBoxSync({
        type: 'question',
        buttons: ['Button 0', 'Button 1'],
        message: 'Test',
        checkboxLabel: "Test checkbox",
        checkboxChecked: false
    });

    console.log('Result type:', typeof result);
    console.log('Result value:', result);
    console.log('Result JSON:', JSON.stringify(result));

    app.quit();
});

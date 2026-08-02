Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
Set desktopPath = WshShell.SpecialFolders("Desktop")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
batPath = scriptDir & "\start-webui.bat"

Set shortcut = WshShell.CreateShortcut(desktopPath & "\Bedrock Server Web UI.lnk")
shortcut.TargetPath = batPath
shortcut.WorkingDirectory = scriptDir
shortcut.Description = "Start Bedrock Server Web UI"
shortcut.Save

WScript.Echo "Desktop shortcut created successfully!"
WScript.Echo "Double-click 'Bedrock Server Web UI' on your desktop to start."

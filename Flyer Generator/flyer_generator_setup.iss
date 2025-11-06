; Inno Setup Script for Computer Store Kansas - Sales Flyer Generator
; This creates a professional Windows installer

#define MyAppName "Computer Store Kansas - Flyer Generator"
#define MyAppVersion "1.0"
#define MyAppPublisher "Computer Store Kansas"
#define MyAppExeName "FlyerGenerator.exe"

[Setup]
; Basic application information
AppId={{8F9A2C1D-4B6E-4A3F-9D2C-1E5F7A8B9C0D}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\ComputerStoreKS\FlyerGenerator
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
OutputDir=installer_output
OutputBaseFilename=FlyerGenerator_Setup
SetupIconFile=
Compression=lzma
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
; Main executable (you'll need to build this first with PyInstaller)
Source: "dist\FlyerGenerator.exe"; DestDir: "{app}"; Flags: ignoreversion

; Template files - REQUIRED
Source: "Desktop_sales-flyer.html"; DestDir: "{app}"; Flags: ignoreversion
Source: "Laptop_sales-flyer.html"; DestDir: "{app}"; Flags: ignoreversion
Source: "sales-flyer.css"; DestDir: "{app}"; Flags: ignoreversion

; Image files - REQUIRED
Source: "title.png"; DestDir: "{app}"; Flags: ignoreversion
Source: "graphics-icon.png"; DestDir: "{app}"; Flags: ignoreversion

; Documentation
Source: "README.md"; DestDir: "{app}"; Flags: ignoreversion
Source: "QUICKSTART.txt"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\Quick Start Guide"; Filename: "{app}\QUICKSTART.txt"
Name: "{group}\Uninstall {#MyAppName}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[Code]
var
  PythonPage: TInputOptionWizardPage;

procedure InitializeWizard;
begin
  // Create a custom page to inform about Python requirement
  PythonPage := CreateInputOptionPage(wpWelcome,
    'Python Requirement', 'The application requires Python 3.8 or higher',
    'This installer will check for Python and install required dependencies.' + #13#10 +
    'If Python is not installed, you will need to install it from python.org first.',
    False, False);
end;

function CheckPython: Boolean;
var
  ResultCode: Integer;
begin
  Result := Exec('python', '--version', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
  if not Result then
    Result := Exec('py', '--version', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
end;

function InitializeSetup: Boolean;
begin
  Result := True;
  
  if not CheckPython then
  begin
    if MsgBox('Python 3.8 or higher is required but was not detected.' + #13#10 + #13#10 +
              'Would you like to continue anyway? (You will need to install Python manually)',
              mbConfirmation, MB_YESNO) = IDNO then
      Result := False;
  end;
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  ResultCode: Integer;
begin
  if CurStep = ssPostInstall then
  begin
    // Try to install Python dependencies
    if CheckPython then
    begin
      Exec('cmd.exe', '/c pip install weasyprint pillow',
           ExpandConstant('{app}'), SW_HIDE, ewWaitUntilTerminated, ResultCode);
    end;
  end;
end;

@echo off


:: INIT PROCESS

goto :BOOT

    :CHECK
    IF ERRORLEVEL 1 (
        %MSG% %ERR% red
        echo.
        exit 1
    )
    goto :eof

:BOOT

set MSG=".\bin\printMSG.exe"

::set "OUTLOG=.\output\build.log 2>&1"

set "OUTLOG=.\tmp_build.log 2>&1"

:: START PROCESS

echo "BUILD PROCESS START" >%OUTLOG%


%MSG% "Pledges Folder Structure [Step]" blue & echo.


IF NOT EXIST ".\output" (
    mkdir ".\output" >>%OUTLOG%
    set ERR="Not able to make folder : .\output" & call :CHECK
    %MSG% "Make Dir : .\output" & echo.
)

IF NOT EXIST ".\output\core" (
    mkdir ".\output\core" >>%OUTLOG%
    set ERR="Not able to make folder : .\output\core" & call :CHECK
    %MSG% "Make Dir : .\output\core" & echo.
)

IF NOT EXIST ".\output\user" (
    mkdir ".\output\user" >>%OUTLOG%
    set ERR="Not able to make folder : .\output\user" & call :CHECK
    %MSG% "Make Dir : .\output\user" & echo.
)


%MSG% "Copies Core Files [Step]" blue & echo.


copy .\src\_main.html .\output\main.html >>%OUTLOG%
set ERR="Not able to copy file : .\src\_main.html -> .\output\main.html" & call :CHECK

copy .\src\header\_default.css .\output\core\default.css >>%OUTLOG%
set ERR="Not able to copy file : .\src\header\_default.css -> .\output\core\default.css" & call :CHECK

copy .\src\patch-lib\types\PatchContext.js .\output\core\PatchContext-jsdocs.js >>%OUTLOG%
set ERR="Not able to copy file : .\src\patch-lib\types\PatchContext.js -> .\output\core\PatchContext-jsdocs.js" & call :CHECK


%MSG% "Copies User Files [Step]" blue & echo.


IF NOT EXIST ".\output\user\custom.css" (
    copy .\src\header\_user_custom.css .\output\user\custom.css >>%OUTLOG%
    set ERR="Not able to copy file : .\src\header\_user_custom.css -> .\output\user\custom.css" & call :CHECK
)

IF NOT EXIST ".\output\user\config.js" (
    copy .\src\header\_user_config.js .\output\user\config.js >>%OUTLOG%
    set ERR="Not able to copy file : .\src\header\_user_config.js -> .\output\user\config.js" & call :CHECK

    call .\bin\custom-SBSP-build\set-userContext-jsdocsHeader.bat
    set ERR="Error while running script : .\bin\custom-SBSP-build\set-userContext-jsdocsHeader.bat" & call :CHECK
)


%MSG% "Concats Source Files [Step]" blue & echo.


.\bin\concatTEXT.exe .\output\core\SBSP.js ^
    .\src\header\SBSP_config.js ^
    .\src\patch-lib\functions\utils-lib.js ^
    .\src\patch-lib\functions\patch-core-lib.js ^
    .\src\html-lib\stdElem.js ^
    .\src\html-lib\dragAndDrop.js ^
    .\src\gui\types\DIVxLogPack.js ^
    .\src\gui\types\DIVxPatchOptionPack.js ^
    .\src\gui\types\DIVxPatchPanelPack.js ^
    .\src\gui\functions\gui-patchPanel-lib.js ^
    .\src\gui\functions\gui-settingsPanel-lib.js ^
    .\src\gui\functions\gui-mainInterface-lib.js >>%OUTLOG%
set ERR="Error while building : .\output\core\SBSP.js" & call :CHECK


call .\bin\custom-SBSP-build\set-appLib-jsdocsHeaders.bat
set ERR="Error while running script : .\bin\custom-SBSP-build\set-appLib-jsdocsHeaders.bat" & call :CHECK


:: END


%MSG% "-- BUILD DONE --" green & echo.


echo "BUILD PROCESS END" >>%OUTLOG%

move /Y .\tmp_build.log .\output\build.log >nul


exit /b 0
@echo off


IF NOT EXIST ".\output\user\config.js" (
    %MSG% "Missing file : .\output\user\config.js" red
    echo.
    exit /b 1
)


goto :skipSub
    :setChk
    set "SUBCHECK=IF ERRORLEVEL 1 (%MSG% %ERR% yellow & echo. & exit /b 1)"
    goto :eof
:skipSub


:: - remove jsdocs : dev src <ref path (PatchContext type)>
.\bin\replace1BYLINE.exe .\output\user\_config.js .\output\user\config.js ^
    "^\/\/\/ <reference path=""\.\.\/patch-lib\/types\/PatchContext.js"" \/>.*" "" >>%OUTLOG%
set ERR="Fail to remove dev jsdocs ref, in .\output\user\config.js" & call :setChk
%SUBCHECK%

:: - add jsdocs : build local <ref path (PatchContext type)>
.\bin\replace1BYLINE.exe .\output\user\config.js .\output\user\_config.js ^
    "^\/\* --BUILD_INJECTIONS : add <reference patchContext_type> \*\/" ^
    "/// <reference path=""../core/PatchContext-jsdocs.js"" />" >>%OUTLOG%
set ERR="Fail to add user jsdocs ref, in .\output\user\config.js" & call :setChk
%SUBCHECK%


del ".\output\user\_config.js" >>%OUTLOG%
set ERR="Fail to clean temp file : .\output\user\_config.js" & call :setChk
%SUBCHECK%


exit /b 0
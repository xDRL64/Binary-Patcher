@echo off


IF NOT EXIST ".\output\core\SBSP.js" (
    %MSG% "Missing file : .\output\core\SBSP.js" red
    echo.
    exit /b 1
)


goto :skipSub
    :setChk
    set "SUBCHECK=IF ERRORLEVEL 1 (%MSG% %ERR% yellow & echo. & exit /b 1)"
    goto :eof
:skipSub


:: - remove jsdocs : individual <ref path>
.\bin\replace1BYLINE.exe .\output\core\_SBSP.js .\output\core\SBSP.js ^
    "^\/{3,4} <reference path="".*"" \/>.*" "" >>%OUTLOG%
set ERR="Fail to remove dev jsdocs ref, in .\output\core\SBSP.js" & call :setChk
%SUBCHECK%

:: - remove jsdocs : individual @ts-check
.\bin\replace1BYLINE.exe .\output\core\SBSP.js .\output\core\_SBSP.js ^
    "^\/\/ @ts-check.*" "" >>%OUTLOG%
set ERR="Fail to remove dev ts check, in .\output\core\SBSP.js" & call :setChk
%SUBCHECK%


:: - add jsdocs : main @ts-check
.\bin\replace1BYLINE.exe .\output\core\_SBSP.js .\output\core\SBSP.js ^
    "^\/\* --BUILD_INJECTIONS : add @ts-check \*\/" "// @ts-check" >>%OUTLOG%
set ERR="Fail to add dev jsdocs check, in .\output\core\SBSP.js" & call :setChk
%SUBCHECK%

:: - add jsdocs : main <ref path (PatchContext type)>
.\bin\replace1BYLINE.exe .\output\core\SBSP.js .\output\core\_SBSP.js ^
    "^\/\* --BUILD_INJECTIONS : add <reference patchContext_type> \*\/" ^
    "/// <reference path=""./PatchContext-jsdocs.js"" />" >>%OUTLOG%
set ERR="Fail to add dev jsdocs ref (pctx type), in .\output\core\SBSP.js" & call :setChk
%SUBCHECK%

:: - add jsdocs : main <ref path (user config)>
.\bin\replace1BYLINE.exe .\output\core\_SBSP.js .\output\core\SBSP.js ^
    "^\/\* --BUILD_INJECTIONS : add <reference user_conf> \*\/" ^
    "/// <reference path=""../user/config.js"" />" >>%OUTLOG%
set ERR="Fail to add dev jsdocs ref (usr conf), in .\output\core\SBSP.js" & call :setChk
%SUBCHECK%



::del ".\output\core\_SBSP.js" >>%OUTLOG%
move /Y ".\output\core\_SBSP.js" ".\output\core\SBSP.js" >>%OUTLOG%
set ERR="Fail to clean temp file : .\output\core\_SBSP.js" & call :setChk
%SUBCHECK%


exit /b 0
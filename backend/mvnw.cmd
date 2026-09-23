@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script
@REM ----------------------------------------------------------------------------
@IF "%__MVNW_ARG0_NAME__%"=="" (SET __MVNW_ARG0_NAME__=%~nx0)
@SET %%i=
@ECHO OFF
SETLOCAL
SET MAVEN_PROJECTBASEDIR=%~dp0
SET MVNW_REPOURL=https://repo.maven.apache.org/maven2
IF NOT "%MVNW_REPOURL%"=="" (
  SET MVNW_REPOURL=%MVNW_REPOURL%
)
SET WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar"
SET WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain
SET DOWNLOAD_URL="https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar"
FOR /F "usebackq tokens=1,2 delims==" %%A IN ("%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties") DO (
    IF "%%A"=="wrapperUrl" SET DOWNLOAD_URL=%%B
)
@IF EXIST %WRAPPER_JAR% (
    SET MVNW_VERBOSE=false
    IF NOT "%MVNW_VERBOSE%"=="false" (
        ECHO "Found %WRAPPER_JAR%"
    )
) ELSE (
    SET MVNW_VERBOSE=false
    IF NOT "%MVNW_VERBOSE%"=="false" (
        ECHO "Couldn't find %WRAPPER_JAR%, downloading it ..."
        ECHO "Downloading from: %DOWNLOAD_URL%"
    )
    powershell -Command "&{"^
		"$webclient = new-object System.Net.WebClient;"^
		"if (-not ([string]::IsNullOrEmpty('%MVNW_USERNAME%') -and [string]::IsNullOrEmpty('%MVNW_PASSWORD%'))) {"^
		"$webclient.Credentials = new-object System.Net.NetworkCredential('%MVNW_USERNAME%', '%MVNW_PASSWORD%');"^
		"}"^
		"[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $webclient.DownloadFile('%DOWNLOAD_URL%', '%WRAPPER_JAR%')"^
		"}"
    IF "%MVNW_VERBOSE%"=="true" (
        ECHO "Finished downloading %WRAPPER_JAR%"
    )
)
@IF "%JAVA_HOME%"=="" (
  SET JAVA_HOME=C:\Program Files\Java\jdk-21.0.11
)
@SET JAVA_EXE=%JAVA_HOME%/bin/java.exe
%JAVA_EXE% -classpath %WRAPPER_JAR% "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" %WRAPPER_LAUNCHER% %MAVEN_CONFIG% %*
IF ERRORLEVEL 1 GOTO error
GOTO end
:error
SET ERROR_CODE=1
:end
@ENDLOCAL & SET ERROR_CODE=%ERROR_CODE%
EXIT /B %ERROR_CODE%

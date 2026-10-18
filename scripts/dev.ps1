param([ValidateSet('frontend','backend')][string]$Target='frontend')
$projectRoot = Split-Path -Parent $PSScriptRoot
$localNode = Join-Path $projectRoot '.tools/node-v22.23.3-win-x64'
if (Test-Path $localNode) { $env:PATH = "$localNode;$env:PATH" }
if ($Target -eq 'frontend') {
    Set-Location (Join-Path $projectRoot 'frontend')
    if (!(Test-Path node_modules)) { npm.cmd ci }
    npm.cmd run dev
} else {
    $env:DEBUG = 'false'
    $env:TRACE = 'false'
    $localJava = Join-Path $projectRoot '.tools/jdk21.0.12_12'
    if (Test-Path $localJava) { $env:JAVA_HOME = $localJava; $env:PATH = "$localJava/bin;$env:PATH" }
    Set-Location (Join-Path $projectRoot 'backend')
    $localMaven = Join-Path $projectRoot '.tools/apache-maven-3.9.11/bin/mvn.cmd'
    if (Test-Path $localMaven) { & $localMaven spring-boot:run } else { mvn spring-boot:run }
}

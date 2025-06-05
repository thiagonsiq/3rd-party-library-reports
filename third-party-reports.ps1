# Documentation: https://github.com/thiagonsiq/3rd-party-library-reports

# CONFIGURATION - Update these values based on your needs. See doc for examples
$outputFolderName     = 'ThirdPartyReports'           
$dotnetSolutionName   = '[SolutionName].sln'          
$dotnetFolderRelPath  = '../../../[FolderName]'       
$npmFolderRelPath     = '../../../[FolderName]/[SubFolderName]'
$jsonToCsvRelPath     = 'json-to-csv-helper.js'

# Verify required utilities are available
function Test-OrInstallUtility {
    param(
        [string]$Name,
        [string]$InstallCommand
    )
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        Write-Host "Installing ${Name}..."
        try { Invoke-Expression $InstallCommand }
        catch {
            Write-Error "Failed to install ${Name}: $_"
            exit 1
        }
    }
}

Test-OrInstallUtility -Name 'dotnet'           -InstallCommand 'Write-Error "Please install the .NET SDK (dotnet CLI) and ensure its on your PATH."'
Test-OrInstallUtility -Name 'npm'              -InstallCommand 'Write-Error "Please install Node.js (npm) and ensure its on your PATH."'
Test-OrInstallUtility -Name 'license-checker'  -InstallCommand 'npm install -g license-checker'
Test-OrInstallUtility -Name 'nuget-license'    -InstallCommand 'dotnet tool install --global nuget-license'

# Configure paths needed to run the reports
$outputFolderPath = Join-Path $PSScriptRoot $outputFolderName
$jsonToCsvPath    = Join-Path $PSScriptRoot $jsonToCsvRelPath

# Create directory if it doesn't exist
if (-not (Test-Path $outputFolderPath)) { 
    New-Item -ItemType Directory -Path $outputFolderPath | Out-Null
}
# Fail early if these don't exist
if (-not (Test-Path $jsonToCsvPath -PathType Leaf)) {
    Write-Error "Required helper 'json-to-csv-helper.js' not found in $PSScriptRoot."
    exit 1
}
foreach ($p in @($dotnetFolderRelPath, $npmFolderRelPath)) {
    if (-not (Test-Path $p)) {
        Write-Error "Required path not found: $p"
        exit 1
    }
}

$reports = @(
    [PSCustomObject]@{
        BaseName  = 'npm_audit'
        Command   = "npm audit --json | node `"$jsonToCsvPath`" npm-audit"
        RelPath   = $npmFolderRelPath
        Extension = '.csv'
    }
    [PSCustomObject]@{
        BaseName = 'npm_outdated'
        Command   = "npm outdated --json | node `"$jsonToCsvPath`" npm-outdated"
        RelPath  = $npmFolderRelPath
        Extension = '.csv'
    }
    [PSCustomObject]@{
        BaseName = 'npm_licenses'
        Command  = "license-checker --csv"
        RelPath  = $npmFolderRelPath
        Extension = '.csv'
    }
    [PSCustomObject]@{
        BaseName = 'nuget_outdated'
        Command = "dotnet list $($dotnetSolutionName) package --outdated --include-transitive --format json | node `"$jsonToCsvPath`" nuget-outdated"
        RelPath  = $dotnetFolderRelPath
        Extension = '.csv'
    }
    [PSCustomObject]@{
        BaseName = 'nuget_vulnerable'
        Command  = "dotnet list $($dotnetSolutionName) package --vulnerable --include-transitive --format json | node `"$jsonToCsvPath`" nuget-vulnerable"
        RelPath  = $dotnetFolderRelPath
        Extension = '.csv'
    }
    [PSCustomObject]@{
        BaseName = 'nuget_licenses'
        Command  = "nuget-license -i $($dotnetSolutionName) -o jsonPretty | node `"$jsonToCsvPath`" nuget-licenses"
        RelPath  = $dotnetFolderRelPath
        Extension = '.csv'
    }
)

foreach ($r in $reports) {
    $timestamp   = Get-Date -Format 'yyyyMMdd_HHmmss'
    $ext         = if ($r.Extension) { $r.Extension } else { '.json' }
    $outputFile  = "$($r.BaseName)_$timestamp$ext"
    $outFullPath = Join-Path $outputFolderPath $outputFile
    $resolvedDir = Join-Path $PSScriptRoot $r.RelPath
    
    try {
        Push-Location $resolvedDir
        Write-Host "Running report: $($r.BaseName)..."
        
        $result = Invoke-Expression $r.Command
        $result | Out-File -FilePath $outFullPath -Encoding utf8

        Write-Host "   ✔ Saved report to: $outFullPath"
    }
    catch {
        Write-Warning "   ✘ Failed to generate '$($r.BaseName)': $_"
    }
    finally {
        Pop-Location
    }
}

Write-Host "All reports completed at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')." -ForegroundColor Green

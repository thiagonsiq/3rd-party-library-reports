# 3rd Party Library Reports

## Description
Managing third-party dependencies across large projects can get messy. Tools like npm, dotnet, and license-checker give you great diagnostics, but their JSON outputs aren't exactly easy to share with a compliance team, non-technical stakeholders, or Excel-centric processes. 

Recently, I needed to figure out libraries in our application that were outdated, that had known vulnerabilities, and their licenses information (if any). There wasn't a single tool that could do that, much less across npm and NuGet packages. And the tools that are available have different outputs, which made for messy reports.

I put together this script, which does a few things:
- Runs multiple CLI tools across JavaScript and .NET projects
- Captures outdated packages, vulnerabilities and license information
- Converts all the output into clean, timestamped CSV files (that was my need, but can also just output JSON instead if needed - or both)
- For ease of use, I also automated the process via PowerShell a bit, so that all reports run together from start to finish
- There are a few checks in place for existence of the tools we need to use, if not present, some are installed and others need to be installed by the user

## Usage
This tool needs two files to work properly:
- `third-party-reports.ps1` - This is the orchestrator. It can be changed, but currently runs:
  - npm audit
  - npm outdated
  - license-checker
  - dotnet list --outdated and --vulnerable
  - nuget-license
- `json-to-csv.js` - This is the JSON to CSV parser, as the name implies. It handles converting JSON to CSV for the above report outputs (outdated, vulnerabilities, license).

Place the `third-party-reports.ps1` and `json-to-csv.js` files in a directory, preferably in (or near) the place where your solution files are located.

Open the `third-party-reports.ps1` and update the configuration variables:
- outputFolderName: Name of folder where reports will be saved
- dotnetSolutionName: Name of specific dotnet solution file to report on (for NuGet commands)
- dotnetFolderRelPath: Relative path of where dotnet solution is located (eg: `../App`)
- npmFolderRelPath: Relative path of where npm libraries are located (eg: `../App/FrontEnd`)
- jsonToCsvRelPath: Relative path of where json to csv helper is located (If kept alongside the PowerShell script, no change is needed here. Otherwise, provide relative path like the others)

Run the powershell script: `./third-party-reports.ps1`

The script will run through each report and save the output in the folder name provided.

There are some improvements that can be made to this, like running the reports in parallel for instance, or accepting some of the inputs via input questions. For now, this will do the trick!

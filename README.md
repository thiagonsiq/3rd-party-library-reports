# 3rd Party Library Reports

## Description
Maintaining third-party dependencies across large projects can be hard. Tools like npm, dotnet, and others give you pretty good diagnostics, but their JSON outputs aren't exactly easy to share with a compliance team, non-technical stakeholders, or Excel-centric processes. 

Recently, I needed to know libraries in our application that were outdated, that had known vulnerabilities, and information about their licenses. There wasn't a single tool that could do that, much less across npm and NuGet packages. The tools that are available have different outputs, which made for messy reports.

As a result, I put together this script, which does a few things:
- Runs multiple CLI tools across JavaScript and .NET projects
- Captures outdated packages, vulnerabilities and license information
- Converts all the output into clean, timestamped CSV files (that was my need, but it can also just output JSON if needed - or both)
- For ease of use, I also automated the process via PowerShell a bit, so that all reports run together from start to finish
- Lastly, I added a few checks to verify required tools and directories are present

## Configuration
The tool needs two files:
- `third-party-reports.ps1` - This is the orchestrator. It can be changed, but currently runs:
  - npm audit
  - npm outdated
  - license-checker
  - dotnet list --outdated and --vulnerable
  - nuget-license
- `json-to-csv-helper.js` - This is the JSON to CSV parser, as the name implies. It handles converting JSON to CSV for the above report outputs (outdated, vulnerabilities, license).

Place the `third-party-reports.ps1` and `json-to-csv-helper.js` files in a directory, preferably in (or near) the place where your solution files are located.

Open `third-party-reports.ps1` and update the configuration variables:
- outputFolderName: Name of folder where reports will be saved
- dotnetSolutionName: Name of specific dotnet solution file to report on (for NuGet commands)
- dotnetFolderRelPath: Relative path of where dotnet solution is located (eg: `../App`)
- npmFolderRelPath: Relative path of where npm libraries are located (eg: `../App/FrontEnd`)
- jsonToCsvRelPath: Relative path of where json to csv helper is located (If kept alongside the PowerShell script, no change is needed here. Otherwise, provide relative path like the others)

## Usage
Run the PowerShell script: `./third-party-reports.ps1`

The script will run through each report and save the output in the folder name provided.

There are some improvements that can be made to this, like running the reports in parallel, maybe providing an option to choose which reports to run, and probably others. However, for now, this is the amount of time I was willing to put into this! Feel free to use it if you have similar needs.

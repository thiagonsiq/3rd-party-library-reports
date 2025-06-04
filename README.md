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

## Installation
This tool needs two files to work properly:
- `third-party-inventory.ps1` - This is the orchestrator. It can be changed, but currently runs:
  - npm audit
  - npm outdated
  - license-checker
  - dotnet list --outdated and --vulnerable
  - nuget-license
- `json-to-csv.js` - This is the JSON to CSV parser, as the name implies. It handles converting JSON to CSV for the above report outputs (outdated, vulnerabilities, license).

The PowerShell script is configured to run from anywhere using absolute paths. You decide what reports you want to run, and provide the path where those libraries can be found and where the output should be saved.




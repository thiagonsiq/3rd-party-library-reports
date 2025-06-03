# 3rd Party Library Reports

## Description
Managing third-party dependencies across large projects can get messy. Tools like npm, dotnet, and license-checker give you great diagnostics, but their JSON outputs aren't exactly easy to share with a compliance team, non-technical stakeholders, or Excel-centric processes. 

Recently, I needed to:

- Run multiple CLI tools across JavaScript and .NET projects
- Capture things like outdated packages, licenses, and vulnerabilities
- Convert all the output into clean, timestamped CSV files
- For ease of use, automate the process via PowerShell

## Installation


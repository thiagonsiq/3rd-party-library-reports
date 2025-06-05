/**
 * json-to-csv-helper.js
 *
 * This module provides utility functions for converting JSON data to CSV format.
 *
 * Usage:
 *   cat input.json | json-to-csv-helper.js <mode> [output.csv]
 *
 */

const fs = require('fs');

function toCsv(rows, headers) {
  const esc = v => `"${String(v != null ? v : '').replace(/"/g, '""')}"`;
  const lines = [ headers.map(esc).join(','), ...rows.map(r => headers.map(h => esc(r[h])).join(',')) ];
  return lines.join('\n');
}

// Each function takes the raw JSON data and returns an array of objects with the desired structure
function flattenNpmOutdated(data) {
  return Object.entries(data || {}).map(([pkg, info]) => ({
    Package: pkg,
    Current: info.current,
    Wanted: info.wanted,
    Latest: info.latest,
    Location: info.location || ''
  }));
}

function flattenNpmAudit(data) {
  const vulns = data.vulnerabilities || data.advisories || {};
  return Object.entries(vulns).map(([pkg, info]) => {
    const via     = Array.isArray(info.via)    ? info.via.join('|')    : info.via || '';
    const effects = Array.isArray(info.effects)? info.effects.join('|'): '';
    const nodes   = Array.isArray(info.nodes)  ? info.nodes.join('|')  : '';
    const fix     = info.fixAvailable || {};
    return {
      PackageName:       pkg,
      Severity:          info.severity || '',
      IsDirect:          info.isDirect || false,
      Range:             info.range || '',
      Via:               via,
      Effects:           effects,
      Nodes:             nodes,
      FixName:           fix.name || '',
      FixVersion:        fix.version || '',
      FixIsSemVerMajor:  fix.isSemVerMajor || false
    };
  });
}

function flattenNugetLicenses(data) {
  if (!Array.isArray(data)) return [];
  return data.map(pkg => ({
    PackageId:                pkg.PackageId,
    PackageVersion:           pkg.PackageVersion,
    PackageProjectUrl:        pkg.PackageProjectUrl || '',
    Authors:                  pkg.Authors,
    License:                  pkg.License,
    LicenseUrl:               pkg.LicenseUrl || '',
    LicenseInformationOrigin: pkg.LicenseInformationOrigin || ''
  }));
}

function flattenNugetOutdated(data) {
  const rows = [];
  (data.projects || []).forEach(proj => {
    const projPath = proj.path;
    (proj.frameworks || []).forEach(fw => {
      const framework = fw.framework;
      (fw.topLevelPackages || []).forEach(pkg => rows.push({
        ProjectPath:       projPath,
        Framework:         framework,
        PackageId:         pkg.id,
        RequestedVersion:  pkg.requestedVersion,
        ResolvedVersion:   pkg.resolvedVersion,
        LatestVersion:     pkg.latestVersion,
        PackageType:       'TopLevel'
      }));
      (fw.transitivePackages || []).forEach(pkg => rows.push({
        ProjectPath:       projPath,
        Framework:         framework,
        PackageId:         pkg.id,
        RequestedVersion:  '',
        ResolvedVersion:   pkg.resolvedVersion,
        LatestVersion:     pkg.latestVersion,
        PackageType:       'Transitive'
      }));
    });
  });
  return rows;
}

function flattenNugetVulnerable(data) {
  const rows = [];
  (data.projects || []).forEach(proj => {
    const projPath = proj.path;
    (proj.frameworks || []).forEach(fw => {
      const framework = fw.framework;
      (fw.transitivePackages || []).forEach(pkg => {
        const ver = pkg.resolvedVersion;
        (pkg.vulnerabilities || []).forEach(v => rows.push({
          ProjectPath:     projPath,
          Framework:       framework,
          PackageId:       pkg.id,
          ResolvedVersion: ver,
          Severity:        v.severity,
          AdvisoryUrl:     v.advisoryurl
        }));
      });
    });
  });
  return rows;
}

// Individual report configurations
const configs = {
  'npm-outdated': {
    headers: ['Package','Current','Wanted','Latest','Location'],
    flatten: flattenNpmOutdated
  },
  'npm-audit': {
    headers: ['PackageName','Severity','IsDirect','Range','Via','Effects','Nodes','FixName','FixVersion','FixIsSemVerMajor'],
    flatten: flattenNpmAudit
  },
  'nuget-licenses': {
    headers: ['PackageId','PackageVersion','PackageProjectUrl','Authors','License','LicenseUrl','LicenseInformationOrigin'],
    flatten: flattenNugetLicenses
  },
  'nuget-outdated': {
    headers: ['ProjectPath','Framework','PackageId','RequestedVersion','ResolvedVersion','LatestVersion','PackageType'],
    flatten: flattenNugetOutdated
  },
  'nuget-vulnerable': {
    headers: ['ProjectPath','Framework','PackageId','ResolvedVersion','Severity','AdvisoryUrl'],
    flatten: flattenNugetVulnerable
  }
};

// CLI
const [,, mode, outFile] = process.argv;
if (!mode || !configs[mode]) {
  console.error('Usage: json-to-csv-helper.js <mode> [output.csv]\n');
  console.error('Modes:', Object.keys(configs).join(', '));
  process.exit(1);
}

// Read stdin
let buf = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', d => buf += d);
process.stdin.on('end', () => {
  let data;
  try { data = JSON.parse(buf); }
  catch (e) { console.error('Invalid JSON:', e.message); process.exit(1); }

  const { headers, flatten } = configs[mode];
  const rows = flatten(data);
  const csv  = toCsv(rows, headers);

  if (outFile) {
    try { fs.writeFileSync(outFile, csv, 'utf8'); console.error(`✅ Wrote ${rows.length} rows to ${outFile}`); }
    catch(e) { console.error('Write error:', e.message); process.exit(1); }
  } else {
    process.stdout.write(csv);
  }
});

import { Project, Package, structUtils } from "@yarnpkg/core";
import { parseSyml } from "@yarnpkg/parsers";
import { readFileSync } from "fs";
import { npath, ppath, Filename } from "@yarnpkg/fslib";

export const getPackageManifest = (project: Project, pkg: Package) => {
  makeYarnState(project);

  const locator = structUtils.convertPackageToLocator(pkg);
  const entry = yarnState[structUtils.stringifyLocator(locator)];
  if (!entry) return null;

  const location = entry.locations[0];
  const portablePath = location
    ? ppath.join(location, Filename.manifest)
    : Filename.manifest;
  const nativePath = npath.fromPortablePath(portablePath);
  const packageJson = readFileSync(nativePath).toString();

  return JSON.parse(packageJson);
};

export const getLicense = (project: Project, pkg: Package) => {
  makeYarnState(project);

  const locator = structUtils.convertPackageToLocator(pkg);
  const entry = yarnState[structUtils.stringifyLocator(locator)];
  if (!entry) return null;

  const location = entry.locations[0];
  const portablePath = location
      ? ppath.join(location, "LICENSE" as any)
      : "LICENSE" as any;
  const nativePath = npath.fromPortablePath(portablePath);
  const license = readFileSync(nativePath).toString();
  return license;
};

let yarnState;
const makeYarnState = (project: Project) => {
  if (!yarnState) {
    const portablePath = ppath.join(
      project.configuration.projectCwd,
      Filename.nodeModules,
      ".yarn-state.yml" as Filename
    );
    const nativePath = npath.fromPortablePath(portablePath);
    yarnState = parseSyml(readFileSync(nativePath).toString());
  }
};

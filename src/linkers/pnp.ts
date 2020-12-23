import {Package, Project, structUtils} from "@yarnpkg/core";
import {Filename, PortablePath, ppath, VirtualFS, ZipOpenFS,} from "@yarnpkg/fslib";
import {getLibzipSync} from "@yarnpkg/libzip";
import {getPnpPath} from "@yarnpkg/plugin-pnp";

export const getPackageManifest = (project: Project, pkg: Package) => {
  makePnPApi(project);

  const locator = structUtils.convertPackageToLocator(pkg);
  const pnpLocator = {
    name: structUtils.stringifyIdent(locator),
    reference: locator.reference,
  };

  const packageInformation = pnpApi.getPackageInformation(pnpLocator);
  if (!packageInformation) return;

  const { packageLocation } = packageInformation;
  const portablePath: PortablePath = ppath.join(
      ("/" + packageLocation.slice(0, -1).replace(/\\/g, '/')) as any,
    Filename.manifest
  );
  const packageJson = fs.readFileSync(portablePath).toString();

  return JSON.parse(packageJson);
};

export const getLicense = (project: Project, pkg: Package) => {
  makePnPApi(project);

  const locator = structUtils.convertPackageToLocator(pkg);
  const pnpLocator = {
    name: structUtils.stringifyIdent(locator),
    reference: locator.reference,
  };

  const packageInformation = pnpApi.getPackageInformation(pnpLocator);
  if (!packageInformation) return;

  const { packageLocation } = packageInformation;
  const portablePath: PortablePath = ppath.join(
      ("/" + packageLocation.slice(0, -1).replace(/\\/g, '/')) as any,
      "LICENSE" as any
  );
  const license = fs.readFileSync(portablePath).toString();
  return license;
};

let pnpApi;
const makePnPApi = (project: Project) => {
  if (!pnpApi) {
    // use `eval` so webpack leaves this alone
    // tslint:disable-next-line:no-eval
    pnpApi = eval("module.require")(getPnpPath(project).main.substr(1));
  }
};

const fs = new VirtualFS({
  baseFs: new ZipOpenFS({
    libzip: getLibzipSync(),
    readOnlyArchives: true,
  }),
});

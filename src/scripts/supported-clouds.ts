import { dropbox } from "./clouds/dropbox.ts";
import { googleDrive } from "./clouds/google-drive.ts";
import { webdav } from "./clouds/webdav.ts";
import type { Clouds } from "./types.ts";

export const supportedClouds: Clouds = {
  googleDrive,
  dropbox,
  webdav,
};

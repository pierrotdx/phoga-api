import { IReplaceTagParser } from "tag-context/core/models";

import { AddTagParser } from "./add-tag/add-tag.parser";

export class ReplaceTagParser
  extends AddTagParser
  implements IReplaceTagParser {}

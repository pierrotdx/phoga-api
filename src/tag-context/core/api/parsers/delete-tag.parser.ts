import { IDeleteTagParser } from "tag-context/core/models";
import { GetTagParser } from "./get-tag/get-tag.parser";

export class DeleteTagParser extends GetTagParser implements IDeleteTagParser{}
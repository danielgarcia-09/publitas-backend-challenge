import { validationOptions, X2jOptions, XMLParser } from "fast-xml-parser";

export class XmlParserService {
  private parser: XMLParser;

  constructor(options?: X2jOptions) {
    this.parser = new XMLParser(options);
  }

  parse(xml: string | Uint8Array<ArrayBufferLike>, options?: validationOptions | boolean) {
    return this.parser.parse(xml, options);
  }
}

import { readFileSync } from "node:fs";
import { FEED_XML_PATH } from "./constants.ts";
import { bytesToSize, createBatches } from "./helpers.ts";
import { XmlParserService } from "./services/xml-parser.service.ts";
import ExternalService from "./services/external.service.ts";

const checkFeedXML = () => {
  const externalService = ExternalService();
  const _xmlParserService = new XmlParserService({
    ignoreDeclaration: true,
    ignoreAttributes: [/^g:/],
    parseAttributeValue: true,
    isArray: (tagName) => {
      if (tagName === "item") {
        return true;
      }
      return false;
    },
    transformTagName: (tagName) => {
      if (tagName.includes("g:")) {
        return tagName.replace("g:", "");
      }
      return tagName;
    },
  });

  const xmlData = readFileSync(FEED_XML_PATH, "utf8");
  const parsedData = _xmlParserService.parse(xmlData);

  const items: {
    [key: string]: string;
  }[] = parsedData.rss.channel.item;

  const formattedItems = items.map((item) => ({
    "[id]": item.id,
    "[title]": item.title,
    "[description]": item.description,
  }));

  console.log("❗ ~ checkFeedXML ~ items:", formattedItems.length);

  const size = Buffer.byteLength(JSON.stringify(formattedItems));
  console.log("❗ ~ checkFeedXML ~ size:", bytesToSize(size));

  const batches = createBatches(formattedItems, (batch: unknown) => {
    externalService.call(JSON.stringify(batch));
  });

  console.log(
    "❗ ~ checkFeedXML ~ batches:",
    batches.map((batch) => {
      const firstItem = batch[0];
      const size = Buffer.byteLength(JSON.stringify(batch));
      return {
        firstItem,
        length: batch.length,
        size: bytesToSize(size),
      };
    }),
  );
};

checkFeedXML();

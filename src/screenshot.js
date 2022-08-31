import fs from "fs-extra";
import Meta from "html-metadata-parser";
import ora from "ora";
import Pageres from "pageres";
import path from "path";
import sharp from "sharp";
const spinner = ora("Loading");

const config = {
  hiresImagesFolder: path.join(process.cwd(), "/screenshots/hires"),
  thumbnailImagesFolder: path.join(process.cwd(), "/screenshots/thumbnail"),
  screenshotHeight: "1600",
  screenshotWidth: "1200",
  thumbnailHeight: "1200",
  thumbnailWidth: "900",
};

const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const slug = async (url) => {
  const data = await Meta.parser(url);
  return slugify(data.meta.title);
};

const captureScreenshot = async (demo, overwrite) => {
  let themeKey = new URL(demo);
  themeKey = `${await slug(themeKey.href)}`;
  const themeImage = `${themeKey}.png`;

  if (
    !overwrite &&
    fs.existsSync(path.join(config.hiresImagesFolder, themeImage))
  ) {
    return false;
  }

  const screenshotSize = [
    config.screenshotHeight + "x" + config.screenshotWidth,
  ];

  try {
    const page = await new Pageres({
      delay: 2,
      filename: themeKey,
    })
      .source(demo, screenshotSize, {
        crop: true,
      })
      .destination(config.hiresImagesFolder)
      .run();
    spinner.text = `${demo} => capturing`;
    return page;
  } catch {
    spinner.text = `${demo} => failed capturing`;
    return false;
  }
};

const generateScreenshots = async (demos, overwrite) => {
  spinner.start("Capturing Screenshots");
  for (const demo of demos) {
    await captureScreenshot(demo, overwrite);
  }
  spinner.succeed("Success - Capturing Screenshots");
};

const generateThumbnail = async (demo, overwrite) => {
  let themeKey = new URL(demo);
  themeKey = `${await slug(themeKey.href)}`;
  const hiresImage = path.join(config.hiresImagesFolder, `${themeKey}.png`);
  const imageName = path.parse(hiresImage).name;
  const outputImage = path.join(
    config.thumbnailImagesFolder,
    `${imageName}.png`
  );

  if (!hiresImage) {
    return false;
  }
  if (!overwrite && fs.existsSync(outputImage)) {
    return false;
  }
  fs.ensureDirSync(config.thumbnailImagesFolder);

  try {
    spinner.text = `${imageName} => processing thumbnail`;
    await sharp(hiresImage)
      .resize({
        width: config.thumbnailWidth,
        height: config.thumbnailHeight,
        fit: "cover",
        position: "bottom",
      })
      .jpeg({
        quality: 85,
      })
      .toFile(outputImage);
  } catch {
    spinner.text = `${imageName} => processing failed`;
    return false;
  }
};

const generateThumbnails = async (demos, overwrite) => {
  spinner.start("Generating Thumbnails");
  for (const demo of demos) {
    await generateThumbnail(demo, overwrite);
  }
  spinner.succeed("Success - Generating Thumbnails");
};

async function build(demos, overwrite) {
  await generateScreenshots(demos, overwrite);
  await generateThumbnails(demos, overwrite);
}

export default build;

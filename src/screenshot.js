import fs from "fs-extra";
import ora from "ora";
import Pageres from "pageres";
import path from "path";
import sharp from "sharp";
const spinner = ora("Loading");

const config = {
  hiresImagesFolder: path.join(process.cwd(), "/screenshots/hires"),
  thumbnailImagesFolder: path.join(process.cwd(), "/screenshots/thumbnail"),
};

const slug = (str) => {
  return str
    .toLowerCase()
    .replace(/\./g, "-")
    .replace(/\s/g, "-")
    .replace(/\//g, "-")
    .replace(/[0-9]/g, "")
    .replace(/-$/g, "")
    .replace("http:--", "")
    .replace("https:--", "");
};

const captureScreenshot = async (demo, overwrite) => {
  let themeKey = new URL(demo);
  themeKey = `${slug(themeKey.href)}`;
  const themeImage = `${themeKey}.png`;

  if (
    !overwrite &&
    fs.existsSync(path.join(config.hiresImagesFolder, themeImage))
  ) {
    return false;
  }

  let size = ["1600x1200"];
  if (themeKey.includes("preview-themeforest")) {
    size = ["1800x1255"];
  }

  try {
    const page = await new Pageres({
      delay: 2,
      filename: themeKey,
    })
      .source(demo, size, {
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
  themeKey = `${slug(themeKey.href)}`;
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
        width: 1200,
        height: 900,
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

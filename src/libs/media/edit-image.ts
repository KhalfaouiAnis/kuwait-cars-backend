import ffmpegStatic from "ffmpeg-static";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

export async function editImage(image?: Express.Multer.File): Promise<void> {
  if (!image) throw new Error("Image is required");
  const outputPath = path.join("temp", `${Date.now()}.jpg`);
  const logoPath = path.join(process.cwd(), "public/assets/watermark.png");
  const imagePath = image.path;

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const args: string[] = ["-y", "-i", imagePath];

  if (fs.existsSync(logoPath)) {
    args.push(
      "-i",
      logoPath,
      "-filter_complex",
      [
        "[1:v]scale=iw*0.5:-1[scaled_logo];",
        "[0:v][scaled_logo]overlay=x=10:y=(H-h)-10:shortest=1[watermarked]",
      ].join(""),
      "-map",
      "[watermarked]"
    );
  } else {
    console.warn("Logo not found—skipping watermark");
  }

  args.push("-frames:v", "1", "-c:v", "mjpeg", "-q:v", "2", outputPath);

  const ffmpegExe = ffmpegStatic!;

  return new Promise<void>((resolve, reject) => {
    const ffmpegProcess = spawn(ffmpegExe, args, {
      stdio: ["inherit", "inherit", "pipe"],
    });

    let stderrData = "";
    ffmpegProcess.stderr.on("data", (data) => {
      stderrData += data.toString();
    });

    ffmpegProcess.on("close", (code) => {
      if (code !== 0) {
        console.error("FFmpeg STDERR:", stderrData); // Log the errors
        return reject(new Error(`FFmpeg failed with code ${code}`));
      }
      console.log(`FFmpeg succeeded. Output written to ${outputPath}`);
      resolve();
    });

    ffmpegProcess.on("error", (err) => {
      console.error("Spawn error:", err);
      reject(err);
    });
  }).catch((err) => {
    console.log({ globalerror: err });
  });
}

export async function frextendImage(
  image?: Express.Multer.File
): Promise<void> {
  if (!image) throw new Error("Image is required");
  const outputPath = path.join("temp", `${Date.now()}_extended.jpg`);
  const logoPath = path.join(process.cwd(), "public/assets/watermark.png");
  const imagePath = image.path;
  const targetWidth = 1080; // Example: Target output width
  const targetHeight = 1920; // Example: Target output height

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const args: string[] = ["-y", "-i", imagePath, "-i", logoPath];

  if (fs.existsSync(logoPath)) {
    args.push(
      "-filter_complex",
      [
        `[0:v]frextend=left='(ow-iw)/2':right='(ow-iw+1)/2':top='(oh-ih)/2':bottom='(oh-ih+1)/2':mode=edge[padded_edges];`,
        // `[0:v]pad=iw*2:ih*2:(ow-iw)/2:(oh-ih)/2:color=black[padded_intermediate];`,
        `[padded_intermediate]scale=${targetWidth}:${targetHeight}[main_canvas];`,
        `[1:v]scale=(W*0.5):-1[scaled_logo];`,
        `[main_canvas][scaled_logo]overlay=x=10:y=(H-h)-10[final_output]`,
        // "[1:v]scale=iw*0.5:-1[scaled_logo];",
        // "[0:v][scaled_logo]overlay=x=10:y=(H-h)-10:shortest=1[watermarked]",
      ].join(""),
      "-map",
      "[final_output]"
    );
  } else {
    args.push(
      "-filter_complex",
      [
        `[0:v]pad=iw*2:ih*2:(ow-iw)/2:(oh-ih)/2:color=black[padded_intermediate];`,
        `[padded_intermediate]scale=${targetWidth}:${targetHeight}[final_output]`,
      ].join(""),
      "-map",
      "[final_output]"
    );
  }

  args.push("-frames:v", "1", "-c:v", "mjpeg", "-q:v", "2", outputPath);

  const ffmpegExe = ffmpegStatic!;

  return new Promise<void>((resolve, reject) => {
    const ffmpegProcess = spawn(ffmpegExe, args, {
      stdio: ["inherit", "inherit", "pipe"],
    });

    let stderrData = "";
    ffmpegProcess.stderr.on("data", (data) => {
      stderrData += data.toString();
    });

    ffmpegProcess.on("close", (code) => {
      if (code !== 0) {
        console.error("FFmpeg STDERR:", stderrData); // Log the errors
        return reject(new Error(`FFmpeg failed with code ${code}`));
      }
      console.log(`FFmpeg succeeded. Output written to ${outputPath}`);
      resolve();
    });

    ffmpegProcess.on("error", (err) => {
      console.error("Spawn error:", err);
      reject(err);
    });
  }).catch((err) => {
    console.log({ globalerror: err });
  });
}

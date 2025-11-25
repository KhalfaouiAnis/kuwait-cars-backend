import ffmpegStatic from "ffmpeg-static";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import cloudinary from "config/cloudinary";
import { UploadApiResponse } from "cloudinary";
import { unlinkFile } from "@utils/upload";

export async function editVideo(
  video: Express.Multer.File,
  audio?: Express.Multer.File,
  mute?: boolean
) {
  const outputPath = path.join("temp", `${Date.now()}.mp4`);
  const logoPath = path.join(process.cwd(), "public/assets/watermark.png");
  const audioPath = audio?.path;

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const args: string[] = ["-y", "-i", video.path, "-i", logoPath];

  let audioInputIndex: number | null = null;

  if (audioPath) {
    args.push("-i", audioPath);
    audioInputIndex = 2;
  }

  args.push(
    "-filter_complex",
    [
      "[1:v]scale=(iw*4):-1[scaled_logo];",
      "[0:v][scaled_logo]overlay=x=10:y=(H-h)-10[watermarked_video]",
    ].join("")
  );

  args.push("-map", "[watermarked_video]");

  //   let mapAudio = true;
  //   if (audio?.path && fs.existsSync(audio?.path)) {
  //     args.push("-i", audio?.path);
  //     mapAudio = false;
  //   } else if (mute) {
  //     args.push("-an");
  //     mapAudio = false;
  //   }

  //   if (audio?.path && fs.existsSync(audio?.path)) {
  //     args.push("-map", "2:a:0");
  //     args.push("-c:a", "aac", "-b:a", "128k");
  //   } else if (mapAudio) {
  //     args.push("-map", "0:a?", "-c:a", "copy");
  //   }

  if (audioInputIndex !== null) {
    args.push("-map", `${audioInputIndex}:a:0`);
    args.push("-c:a", "aac", "-b:a", "128k");
  } else if (mute) {
    args.push("-an");
  } else {
    args.push("-map", "0:a?", "-c:a", "copy");
  }

  args.push(
    "-c:v",
    "libx264",
    "-crf",
    "23",
    "-preset",
    "veryfast",
    "-movflags",
    "faststart",
    "-shortest",
    outputPath
  );

  const ffmpegExe = ffmpegStatic!;

  return new Promise<string | null>((resolve, reject) => {
    const ffmpegProcess = spawn(ffmpegExe, args, {
      stdio: ["inherit", "inherit", "pipe"],
    });

    let stderrData = "";
    ffmpegProcess.stderr.on("data", (data) => {
      stderrData += data.toString();
    });

    ffmpegProcess.on("close", (code) => {
      if (code !== 0) {
        console.error("FFmpeg STDERR:", stderrData);
        return reject(new Error(`FFmpeg failed with code ${code}`));
      }
      console.log(`FFmpeg succeeded. Output written to ${outputPath}`);
      resolve(outputPath);
    });

    ffmpegProcess.on("error", (err) => {
      console.error("Spawn error:", err);
      reject(err.message);
    });
  }).catch((err) => {
    console.log(err);
  });
}

//   const outputPath = path.join(process.cwd(), "temp_videos", `${Date.now()}.mp4`);
//   const videoPath = videoFile.path;
//   const logoPath = path.join(process.cwd(), "public/assets/watermark.png");
//   const audioPath = audioFile?.path;

//   fs.mkdirSync(path.dirname(outputPath), { recursive: true });

//   const args: string[] = [
//     "-y",
//     "-i", videoPath, // Input 0: Main video file
//     "-i", logoPath,  // Input 1: Watermark PNG
//   ];

//   let mapAudio = true;
//   let audioInputIndex: number | null = null;
//   let complexFilter: string;

//   if (audioPath && fs.existsSync(audioPath)) {
//     args.push(
//         "-stream_loop", "-1", // Loop the audio indefinitely
//         "-i", audioPath        // Input 2: New audio file
//     );
//     audioInputIndex = 2;
//     mapAudio = false; // We'll manage audio via filter complex

//     complexFilter = [
//         // Video processing (overlay watermark)
//         "[1:v]scale=(iw*0.5):-1[scaled_logo];",
//         "[0:v][scaled_logo]overlay=x=10:y=(H-h)-10[watermarked_video];",

//         // Audio processing: Use the 'shortest' filter on the audio stream
//         // This ensures the looped audio stream stops when the video stream ends
//         "[2:a]apad[audio_with_padding];", // apad ensures stream exists for shortest filter
//         "[audio_with_padding]ashortest=shortest=1[final_audio_out]"
//     ].join('');

//   } else {
//     // Standard filter complex without audio handling for mute/copy original audio
//     complexFilter = [
//         "[1:v]scale=(iw*0.5):-1[scaled_logo];",
//         "[0:v][scaled_logo]overlay=x=10:y=(H-h)-10[watermarked_video]"
//     ].join('');
//   }

//   args.push("-filter_complex", complexFilter);

//   args.push("-map", "[watermarked_video]"); // Map the processed video

//   if (audioInputIndex !== null) {
//     // Map the *filtered* audio output stream
//     args.push("-map", "[final_audio_out]");
//     args.push("-c:a", "aac", "-b:a", "128k");
//   } else if (mapAudio) {
//      // Map original audio if no replacement audio provided
//     args.push("-map", "0:a?", "-c:a", "copy");
//   }

//   args.push(
//     "-c:v", "libx264",
//     "-crf", "23",
//     "-preset", "medium",
//     "-movflags", "faststart",
//     // REMOVE the global -shortest flag

//     outputPath
//   );

export async function prepareAndUploadVideo(
  video?: Express.Multer.File,
  audio?: Express.Multer.File,
  mute?: boolean
) {
  if (!video) throw new Error("Video is required");

  const path = await editVideo(video, audio, mute);

  if (typeof path !== "string") throw new Error("Unvalid video");

  return new Promise<UploadApiResponse | undefined>((resolve, reject) => {
    cloudinary.uploader.upload(
      path,
      {
        resource_type: "video",
        folder: "x_cars/videos",
        eager: true,
      },
      (error, result) => {
        unlinkFile(path);
        if (error) reject(error);
        resolve(result);
      }
    );
  });
}

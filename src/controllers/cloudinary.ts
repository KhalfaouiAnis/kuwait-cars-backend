import { signCloudinaryRequest } from "@libs/cloudinary.js";
import { Request, Response } from "express";

const signCloudinaryUploadRequest = (req: Request, res: Response) => {
  const data = signCloudinaryRequest(req.body);

  res.json(data);
};

export default signCloudinaryUploadRequest;

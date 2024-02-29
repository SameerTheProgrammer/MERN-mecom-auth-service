import { UploadApiOptions, v2 as cloudinary } from "cloudinary";
import { Config } from "../config/config";
import { Logger } from "winston";

cloudinary.config({
    cloud_name: Config.CLOUDINARY_CLOUD_NAME,
    api_key: Config.CLOUDINARY_API_KEY,
    api_secret: Config.CLOUDINAR_API_SECRET,
});

const options: UploadApiOptions = {
    access_mode: "public",
    use_filename: true,
    unique_filename: true,
    overwrite: true,
    resource_type: "auto",
    allowed_formats: ["jpg", "png", "mp4", "mkv"],
};

export const uploadToCloudinary = async (
    path: string,
    folder: string,
    logger: Logger,
) => {
    try {
        const info = await cloudinary.uploader.upload(path, {
            ...options,
            folder,
        });
        return info;
    } catch (error) {
        logger.error("Error while saving image", error);
    }
};

import Multer, { Field } from "multer";
import fs from "fs";
import { Logger } from "winston";
import { MuterDeleteRequest } from "../types/index.types";

export const multerUpload = (uploadFields: Field[]) => {
    const storage = Multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, "./src/uploads");
        },
        filename: function (req, file, cb) {
            const uniqueSuffix =
                Date.now() + "-" + Math.round(Math.random() * 1e9);
            cb(null, uniqueSuffix + "-" + file.originalname);
        },
    });

    const upload = Multer({ storage, limits: { fileSize: 1572864 } });
    const cpUpload = upload.fields(uploadFields);
    return cpUpload;
};

export const deleteMulterImage = (req: MuterDeleteRequest, logger: Logger) => {
    const files = req.files;

    for (const [fileType, fileArray] of Object.entries(files)) {
        if (fileArray) {
            for (const file of fileArray) {
                fs.unlink(file.path, (err) => {
                    if (err) {
                        // Handle error if unable to delete file
                        logger.error(
                            `Error deleting ${fileType} file with path : ${file.path}`,
                            err,
                        );
                    } else {
                        logger.info(
                            `Successfully deleted ${fileType} file with path : ${file.path}`,
                        );
                    }
                });
            }
        }
    }
};

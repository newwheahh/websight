const express = require("express");

const multer = require("multer");

const path = require("path");

const fs = require("fs");

const Post = require("../models/Post");

const auth = require("../middleware/auth");

const router = express.Router();


/* =========================================
   DIRECTORIES
========================================= */

const documentDirectory =
    path.join(
        __dirname,
        "../uploads/documents"
    );


const videoDirectory =
    path.join(
        __dirname,
        "../uploads/videos"
    );


fs.mkdirSync(
    documentDirectory,
    {
        recursive: true
    }
);


fs.mkdirSync(
    videoDirectory,
    {
        recursive: true
    }
);


/* =========================================
   FILE STORAGE
========================================= */

const storage =
    multer.diskStorage({

        destination:
            function(req, file, cb) {

                if (
                    file.fieldname ===
                    "document"
                ) {

                    cb(
                        null,
                        documentDirectory
                    );

                } else {

                    cb(
                        null,
                        videoDirectory
                    );

                }

            },


        filename:
            function(req, file, cb) {

                const extension =
                    path.extname(
                        file.originalname
                    );


                const uniqueName =
                    Date.now() +
                    "-" +
                    Math.round(
                        Math.random() *
                        1000000000
                    ) +
                    extension;


                cb(
                    null,
                    uniqueName
                );

            }

    });


/* =========================================
   FILE FILTER
========================================= */

function fileFilter(
    req,
    file,
    cb
) {

    if (
        file.fieldname ===
        "document"
    ) {

        const allowed = [

            "application/pdf",

            "application/msword",

            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

            "application/vnd.ms-powerpoint",

            "application/vnd.openxmlformats-officedocument.presentationml.presentation",

            "application/vnd.ms-excel",

            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

            "text/plain",

            "application/zip"

        ];


        if (
            allowed.includes(
                file.mimetype
            )
        ) {

            return cb(
                null,
                true
            );

        }


        return cb(
            new Error(
                "Unsupported document type"
            )
        );

    }


    if (
        file.fieldname ===
        "video"
    ) {

        if (
            file.mimetype.startsWith(
                "video/"
            )
        ) {

            return cb(
                null,
                true
            );

        }


        return cb(
            new Error(
                "Only video files are allowed"
            )
        );

    }


    cb(
        new Error(
            "Invalid upload field"
        )
    );

}


/* =========================================
   UPLOAD CONFIG
========================================= */

const upload =
    multer({

        storage,

        fileFilter,

        limits: {

            fileSize:
                2 * 1024 * 1024 * 1024

        }

    });


/* =========================================
   DOCUMENT UPLOAD
========================================= */

router.post(
    "/document",
    auth,

    upload.single("document"),

    async (req, res) => {

        try {

            if (!req.file) {

                return res.status(400).json({

                    success: false,

                    message:
                        "No document uploaded"

                });

            }


            const {
                title,
                description,
                category
            } = req.body;


            if (!title) {

                fs.unlinkSync(
                    req.file.path
                );


                return res.status(400).json({

                    success: false,

                    message:
                        "Title is required"

                });

            }


            const post =
                await Post.create({

                    type:
                        "document",

                    title,

                    description,

                    category,

                    fileName:
                        req.file.filename,

                    originalName:
                        req.file.originalname,

                    mimeType:
                        req.file.mimetype,

                    fileSize:
                        req.file.size,

                    uploadedBy:
                        req.user._id

                });


            res.status(201).json({

                success: true,

                message:
                    "Document uploaded",

                post

            });


        } catch (error) {

            console.error(error);

            if (
                req.file &&
                fs.existsSync(
                    req.file.path
                )
            ) {

                fs.unlinkSync(
                    req.file.path
                );

            }


            res.status(500).json({

                success: false,

                message:
                    "Document upload failed"

            });

        }

    }
);


/* =========================================
   VIDEO UPLOAD
========================================= */

router.post(
    "/video",
    auth,

    upload.single("video"),

    async (req, res) => {

        try {

            if (!req.file) {

                return res.status(400).json({

                    success: false,

                    message:
                        "No video uploaded"

                });

            }


            const {
                title,
                description,
                category
            } = req.body;


            if (!title) {

                fs.unlinkSync(
                    req.file.path
                );


                return res.status(400).json({

                    success: false,

                    message:
                        "Title is required"

                });

            }


            const post =
                await Post.create({

                    type:
                        "video",

                    title,

                    description,

                    category,

                    fileName:
                        req.file.filename,

                    originalName:
                        req.file.originalname,

                    mimeType:
                        req.file.mimetype,

                    fileSize:
                        req.file.size,

                    uploadedBy:
                        req.user._id

                });


            res.status(201).json({

                success: true,

                message:
                    "Video uploaded",

                post

            });


        } catch (error) {

            console.error(error);

            if (
                req.file &&
                fs.existsSync(
                    req.file.path
                )
            ) {

                fs.unlinkSync(
                    req.file.path
                );

            }


            res.status(500).json({

                success: false,

                message:
                    "Video upload failed"

            });

        }

    }
);


/* =========================================
   DOCUMENT DOWNLOAD
========================================= */

router.get(
    "/document/:id",
    async (req, res) => {

        try {

            const post =
                await Post.findById(
                    req.params.id
                );


            if (
                !post ||
                post.type !==
                    "document"
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Document not found"

                });

            }


            const filePath =
                path.join(
                    documentDirectory,
                    post.fileName
                );


            if (
                !fs.existsSync(
                    filePath
                )
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "File not found"

                });

            }


            post.downloads += 1;

            await post.save();


            res.download(
                filePath,
                post.originalName
            );


        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Download failed"

            });

        }

    }
);


/* =========================================
   VIDEO STREAMING
========================================= */

router.get(
    "/video/:id",
    async (req, res) => {

        try {

            const post =
                await Post.findById(
                    req.params.id
                );


            if (
                !post ||
                post.type !==
                    "video"
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Video not found"

                });

            }


            const videoPath =
                path.join(
                    videoDirectory,
                    post.fileName
                );


            if (
                !fs.existsSync(
                    videoPath
                )
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Video file not found"

                });

            }


            const stat =
                fs.statSync(
                    videoPath
                );


            const fileSize =
                stat.size;


            const range =
                req.headers.range;


            /*
                Browser asks for a range
                when streaming video.
            */

            if (!range) {

                res.writeHead(
                    200,
                    {
                        "Content-Length":
                            fileSize,

                        "Content-Type":
                            post.mimeType ||
                            "video/mp4"
                    }
                );


                fs.createReadStream(
                    videoPath
                ).pipe(res);


                return;

            }


            const parts =
                range
                    .replace(
                        /bytes=/,
                        ""
                    )
                    .split("-");


            const start =
                parseInt(
                    parts[0],
                    10
                );


            const end =
                parts[1]
                    ? parseInt(
                        parts[1],
                        10
                    )
                    : fileSize - 1;


            if (
                start >= fileSize ||
                end >= fileSize
            ) {

                res.status(416);

                res.setHeader(
                    "Content-Range",
                    `bytes */${fileSize}`
                );

                return res.end();

            }


            const chunkSize =
                end -
                start +
                1;


            const stream =
                fs.createReadStream(
                    videoPath,
                    {
                        start,
                        end
                    }
                );


            res.writeHead(
                206,
                {

                    "Content-Range":
                        `bytes ${start}-${end}/${fileSize}`,

                    "Accept-Ranges":
                        "bytes",

                    "Content-Length":
                        chunkSize,

                    "Content-Type":
                        post.mimeType ||
                        "video/mp4"

                }
            );


            stream.pipe(res);


        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Video streaming failed"

            });

        }

    }
);


module.exports = router;
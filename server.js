require("dotenv").config();

const express = require("express");

const mongoose = require("mongoose");

const cors = require("cors");

const path = require("path");


const authRoutes =
    require("./routes/auth");


const postRoutes =
    require("./routes/posts");


const fileRoutes =
    require("./routes/files");


const app =
    express();


/* =========================================
   MIDDLEWARE
========================================= */

app.use(

    cors({

        origin:
            process.env.FRONTEND_URL ||
            "*",

        credentials: true

    })

);


app.use(
    express.json({
        limit: "10mb"
    })
);


app.use(
    express.urlencoded({
        extended: true,
        limit: "10mb"
    })
);


/* =========================================
   STATIC FILES
========================================= */

app.use(
    "/uploads",
    express.static(
        path.join(
            __dirname,
            "uploads"
        )
    )
);


/* =========================================
   API ROUTES
========================================= */

app.use(
    "/api/auth",
    authRoutes
);


app.use(
    "/api/posts",
    postRoutes
);


app.use(
    "/api/files",
    fileRoutes
);


/* =========================================
   HEALTH CHECK
========================================= */

app.get(
    "/api/health",
    (req, res) => {

        res.json({

            success: true,

            message:
                "ShareVault API is running",

            time:
                new Date().toISOString()

        });

    }
);


/* =========================================
   ROOT
========================================= */

app.get(
    "/",
    (req, res) => {

        res.json({

            name:
                "ShareVault API",

            version:
                "1.0.0",

            status:
                "online"

        });

    }
);


/* =========================================
   404
========================================= */

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "API endpoint not found"

        });

    }
);


/* =========================================
   ERROR HANDLER
========================================= */

app.use(
    (error, req, res, next) => {

        console.error(error);


        if (
            error.code ===
            "LIMIT_FILE_SIZE"
        ) {

            return res.status(413).json({

                success: false,

                message:
                    "File is too large"

            });

        }


        res.status(500).json({

            success: false,

            message:
                error.message ||
                "Internal server error"

        });

    }
);


/* =========================================
   DATABASE
========================================= */

async function startServer() {

    try {

        await mongoose.connect(
            process.env.MONGODB_URI
        );


        console.log(
            "MongoDB connected"
        );


        const PORT =
            process.env.PORT ||
            5000;


        app.listen(
            PORT,
            () => {

                console.log(
                    `ShareVault API running on port ${PORT}`
                );

            }
        );


    } catch (error) {

        console.error(
            "MongoDB connection failed:",
            error.message
        );

        process.exit(1);

    }

}


startServer();
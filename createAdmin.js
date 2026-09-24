require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");

async function createAdmin() {

    try {

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        const email = "admin@sharevault.com";
        const password = "Admin@123456";

        const existingAdmin = await User.findOne({
            email
        });

        if (existingAdmin) {

            console.log("Admin already exists");

            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(
            password,
            12
        );

        const admin = await User.create({

            name: "ShareVault Admin",

            email,

            password: hashedPassword,

            role: "admin"
        });

        console.log("================================");
        console.log("ADMIN CREATED");
        console.log("================================");

        console.log("Email:", admin.email);
        console.log("Password:", password);
        console.log("Role:", admin.role);

        console.log("================================");

        process.exit(0);

    } catch (error) {

        console.error(
            "Failed to create admin:",
            error
        );

        process.exit(1);
    }
}

createAdmin();
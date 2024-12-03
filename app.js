const express = require("express");
const bodyParser = require("body-parser");
const compiler = require("compilex");
const path = require("path");

// Initialize the Express app
const app = express();

// Initialize the compiler with options for Vercel
const options = {
    stats: true,
    tempDir: "/tmp", // Use Vercel's writable directory
};
compiler.init(options);

// Use the body-parser middleware to parse JSON data
app.use(bodyParser.json());

// Define a route for the root URL
app.get("/", (req, res) => {
    res.send("Code Compiler API is running");
});

// Define a route for code compilation
app.post("/compile", (req, res) => {
    const { code, input, lang } = req.body;

    try {
        // Handle different languages
        if (lang === "Cpp" || lang === "C") {
            const envData = { OS: "linux", cmd: "g++", options: { timeout: 10000 } };

            if (!input) {
                compiler.compileCPP(envData, code, (data) => res.send(data.output ? data : { output: "error" }));
            } else {
                compiler.compileCPPWithInput(envData, code, input, (data) => res.send(data.output ? data : { output: "error" }));
            }
        } else if (lang === "Java") {
            const envData = {
                OS: "linux",
                options: { timeout: 10000 },
                path: "/tmp", // Ensure temp files are stored in a writable directory
            };

            if (!input) {
                compiler.compileJava(envData, code, (data) => {
                    res.send(data.error ? { output: "error", error: data.error } : data);
                });
            } else {
                compiler.compileJavaWithInput(envData, code, input, (data) => {
                    res.send(data.error ? { output: "error", error: data.error } : data);
                });
            }
        } else if (lang === "Python") {
            const envData = { OS: "linux" };

            if (!input) {
                compiler.compilePython(envData, code, (data) => res.send(data.output ? data : { output: "error" }));
            } else {
                compiler.compilePythonWithInput(envData, code, input, (data) => res.send(data.output ? data : { output: "error" }));
            }
        } else {
            res.status(400).send({ error: "Unsupported language" });
        }
    } catch (error) {
        console.error("Compilation Error:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

// Start the server (Vercel sets the port automatically)
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

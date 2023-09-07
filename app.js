const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const compiler = require("compilex");
const fs = require("fs");

// Initialize the compiler with options
const options = { stats: true };
compiler.init(options);

// Use the body-parser middleware to parse JSON data
app.use(bodyParser.json());

// Define a function to clean up temporary files
function cleanTemporaryFiles() {
    // Replace the path with the actual directory containing temporary files
    const tempDirectory = __dirname + "/temp";

    // Read the files in the temporary directory
    fs.readdir(tempDirectory, (err, files) => {
        if (err) {
            console.error("Error reading temporary directory:", err);
            return;
        }

        // Loop through files in the temporary directory and delete them
        files.forEach((file) => {
            const filePath = `${tempDirectory}/${file}`;

            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Error deleting file ${filePath}:`, err);
                } else {
                    console.log(`Deleted file: ${filePath}`);
                }
            });
        });
    });
}

// Define a route for the root URL
app.get("/", function (req, res) {
    // Clean up temporary files on startup
    cleanTemporaryFiles();

    // Send the HTML file as the response
    res.sendFile(__dirname + "/index.html");
});

// Define a route for code compilation
app.post("/compile", function (req, res) {
    // Extract code, input, and language from the request
    const code = req.body.code;
    const input = req.body.input;
    const lang = req.body.lang;

    try {
        // Compile code based on the selected language
        if (lang === "Cpp") {
            const envData = { OS: "windows", cmd: "g++" , options: { timeout: 10000 } };

            if (!input) {
                compiler.compileCPP(envData, code, function (data) {
                    if (data.output) {
                        res.send(data);
                    } else {
                        res.send({ output: "error" });
                    }
                });
            } else {
                compiler.compileCPPWithInput(envData, code, input, function (data) {
                    if (data.output) {
                        res.send(data);
                    } else {
                        res.send({ output: "error" });
                    }
                });
            }
        } else if (lang === "Java") {
            const envData = { OS: "windows" };

            if (!input) {
                compiler.compileJava(envData, code, function (data) {
                    if (data.output) {
                        res.send(data);
                    } else {
                        res.send({ output: "error" });
                    }
                });
            } else {
                compiler.compileJavaWithInput(envData, code, input, function (data) {
                    if (data.output) {
                        res.send(data);
                    } else {
                        res.send({ output: "error" });
                    }
                });
            }
        } else if (lang === "Python") {
            const envData = { OS: "windows" };

            if (!input) {
                compiler.compilePython(envData, code, function (data) {
                    if (data.output) {
                        res.send(data);
                    } else {
                        res.send({ output: "error" });
                    }
                });
            } else {
                compiler.compilePythonWithInput(envData, code, input, function (data) {
                    if (data.output) {
                        res.send(data);
                    } else {
                        res.send({ output: "error" });
                    }
                });
            }
        }
    } catch (e) {
        console.error("Error:", e);
    } finally {
        // Clean up temporary files after compilation
        cleanTemporaryFiles();
    }
});

// Start the server on port 8000
app.listen(process.env.PORT||8000, function () {
    console.log("Server is running on port 8000");
});

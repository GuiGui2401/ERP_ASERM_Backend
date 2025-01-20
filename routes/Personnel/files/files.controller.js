//createImages function
const createFiles = async (req, res) => {
  try {
    if (!req.files[0]) {
      const error = new Error("No file uploaded!");
      error.status = 400;
      return res
        .status(400)
        .json({ message: error.message, status: error.status });
    }

    // Log the successful file upload
    await prisma.auditLog.create({
      data: {
        userId: Number(req.auth.sub), // Assuming Number(req.auth.sub) || null or null if not logged in
        action: 'FILE_UPLOAD_SUCCESS',
        details: `File uploaded successfully: ${req.files[0].filename}`,
      },
    });

    // If the file is uploaded, send a success response
    return res.status(200).json({
      message: "File uploaded successfully!",
      file: req.files[0].filename,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: error.message });
  }
};

module.exports = { createFiles };

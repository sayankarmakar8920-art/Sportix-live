import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";

// Supported file types
const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",    // .mov
  "video/x-msvideo",    // .avi
  "video/x-matroska",   // .mkv
];

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const ALLOWED_TYPES = [...ALLOWED_VIDEO_TYPES, ...ALLOWED_IMAGE_TYPES];

const ALLOWED_EXTENSIONS = [
  "mp4", "webm", "mov", "avi", "mkv", // video
  "jpg", "jpeg", "png", "webp", "gif", // image
];

// 5GB max file size
const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024;

function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

function generateUniqueFilename(originalName: string): string {
  const ext = getFileExtension(originalName);
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 10);
  return ext ? `${timestamp}-${randomStr}.${ext}` : `${timestamp}-${randomStr}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    // Check if file exists
    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided. Use 'file' as the form field name." },
        { status: 400 }
      );
    }

    // Validate file name
    if (!file.name || file.name.trim() === "") {
      return NextResponse.json(
        { success: false, error: "File name is missing." },
        { status: 400 }
      );
    }

    // Validate file type (MIME)
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `File type '${file.type}' is not supported. Allowed: video (mp4, webm, mov, avi, mkv) and image (jpg, png, webp, gif).`,
        },
        { status: 400 }
      );
    }

    // Validate file extension
    const ext = getFileExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        {
          success: false,
          error: `File extension '.${ext}' is not supported. Allowed: mp4, webm, mov, avi, mkv, jpg, jpeg, png, webp, gif.`,
        },
        { status: 400 }
      );
    }

    // Validate file size (5GB limit)
    if (file.size > MAX_FILE_SIZE) {
      const maxGB = (MAX_FILE_SIZE / (1024 * 1024 * 1024)).toFixed(0);
      const fileGB = (file.size / (1024 * 1024 * 1024)).toFixed(2);
      return NextResponse.json(
        {
          success: false,
          error: `File size (${fileGB} GB) exceeds the maximum allowed size of ${maxGB} GB.`,
        },
        { status: 400 }
      );
    }

    // Validate file size is not zero
    if (file.size === 0) {
      return NextResponse.json(
        { success: false, error: "File is empty (0 bytes)." },
        { status: 400 }
      );
    }

    // Read file bytes
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename to avoid collisions
    const uniqueFilename = generateUniqueFilename(file.name);

    // Save to public/uploads/
    const uploadDir = join(process.cwd(), "public", "uploads");
    const filepath = join(uploadDir, uniqueFilename);

    await writeFile(filepath, buffer);

    // Determine file category
    const category = ALLOWED_VIDEO_TYPES.includes(file.type) ? "video" : "image";

    // Build public URL
    const publicUrl = `/uploads/${uniqueFilename}`;

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully.",
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
        category,
        extension: ext,
        url: publicUrl,
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Upload error:", error);

    // Handle specific Next.js body size limit error
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred during file upload.";

    if (errorMessage.includes("body size") || errorMessage.includes("payload")) {
      return NextResponse.json(
        {
          success: false,
          error: "File too large. Maximum supported size is 5 GB.",
        },
        { status: 413 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred during file upload.",
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: "Method not allowed. Use POST to upload files.",
      allowedMethods: ["POST"],
      supportedFileTypes: {
        video: ["mp4", "webm", "mov", "avi", "mkv"],
        image: ["jpg", "jpeg", "png", "webp", "gif"],
      },
      maxFileSize: "5GB",
    },
    { status: 405 }
  );
}

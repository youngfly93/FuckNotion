import { put } from "@vercel/blob";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    // Get the filename from headers
    const filename = req.headers.get("x-vercel-filename") || "image.png";
    
    // Read the file data directly from the request body
    const fileBuffer = await req.arrayBuffer();
    const file = new File([fileBuffer], filename, {
      type: req.headers.get("content-type") || "application/octet-stream",
    });

    // Check if blob storage is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      // If no blob storage, convert to base64 data URL for display
      const base64 = Buffer.from(fileBuffer).toString('base64');
      const dataUrl = `data:${file.type};base64,${base64}`;
      
      return new Response(
        JSON.stringify({
          url: dataUrl,
          message: "Blob storage not configured. Using data URL.",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const blob = await put(filename, file, {
      access: "public",
    });

    return new Response(
      JSON.stringify({ url: blob.url }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Upload error:", error);
    return new Response(
      JSON.stringify({
        error: error?.message || "Failed to upload file",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
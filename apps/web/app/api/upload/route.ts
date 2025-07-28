import { put } from "@vercel/blob";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    // Check if blob storage is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      // If no blob storage, return a placeholder response
      return new Response(
        JSON.stringify({
          url: "/placeholder-image.jpg",
          message: "Blob storage not configured. Using placeholder.",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const form = await req.formData();
    const file = form.get("image") as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const blob = await put(file.name, file, {
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
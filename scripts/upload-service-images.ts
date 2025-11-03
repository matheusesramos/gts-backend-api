// scripts/upload-service-images.ts
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

async function uploadServiceImages() {
  const imagesDir = path.join(__dirname, "../public/images/services");
  const files = fs.readdirSync(imagesDir);

  console.log(`📤 Uploading ${files.length} service images to Supabase...`);

  for (const file of files) {
    const filePath = path.join(imagesDir, file);
    const fileBuffer = fs.readFileSync(filePath);

    const { data, error } = await supabase.storage
      .from("service-images")
      .upload(file, fileBuffer, {
        contentType: `image/${path.extname(file).slice(1)}`,
        upsert: true,
      });

    if (error) {
      console.error(`❌ Error uploading ${file}:`, error);
    } else {
      console.log(`✅ Uploaded: ${file}`);
    }
  }

  console.log("🎉 All images uploaded!");
}

uploadServiceImages();
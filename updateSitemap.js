import fs from "fs";
import path from "path";

const sitemapPath = path.resolve("./public/sitemap.xml");
const today = new Date().toISOString().split("T")[0];

try {
  let sitemap = fs.readFileSync(sitemapPath, "utf8");

  // Reemplaza la fecha dentro de <lastmod>...</lastmod>
  sitemap = sitemap.replace(
    /<lastmod>(.*?)<\/lastmod>/,
    `<lastmod>${today}</lastmod>`
  );

  fs.writeFileSync(sitemapPath, sitemap, "utf8");
  console.log(`✅ sitemap.xml actualizado con la fecha ${today}`);
} catch (err) {
  console.error("❌ Error al actualizar sitemap.xml:", err);
}

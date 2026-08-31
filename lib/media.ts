import fs from "node:fs";
import path from "node:path";

/**
 * Vérifie, côté serveur au build/à la requête, si un fichier média
 * placé dans /public existe réellement. Permet d'afficher un
 * placeholder élégant tant que le fichier définitif n'a pas été
 * déposé par l'utilisateur, sans jamais laisser de lecteur cassé.
 *
 * @param publicPath chemin relatif à /public, ex: "/videos/hero.mp4"
 */
export function mediaExists(publicPath: string): boolean {
  try {
    const filePath = path.join(process.cwd(), "public", publicPath);
    const stat = fs.statSync(filePath);
    return stat.isFile() && stat.size > 0;
  } catch {
    return false;
  }
}

import hero from "@/assets/hero.jpg";
import ladakh from "@/assets/pkg-ladakh.jpg";
import maldives from "@/assets/pkg-maldives.jpg";
import kerala from "@/assets/pkg-kerala.jpg";
import rajasthan from "@/assets/pkg-rajasthan.jpg";
import santorini from "@/assets/pkg-santorini.jpg";
import bali from "@/assets/pkg-bali.jpg";

const seedImages = {
    "pkg-ladakh.jpg": ladakh,
    "pkg-maldives.jpg": maldives,
    "pkg-kerala.jpg": kerala,
    "pkg-rajasthan.jpg": rajasthan,
    "pkg-santorini.jpg": santorini,
    "pkg-bali.jpg": bali,
    "hero.jpg": hero,
};

/** 
 * Resolve a cover_image reference. Seeded packages use bare filenames; 
 * user uploads store a full URL (from storage). Falls back to hero. 
 */
export function resolveImage(ref) {
    if (!ref) return hero;
    if (ref.startsWith("http://") || ref.startsWith("https://")) return ref;
    return seedImages[ref] ?? hero;
}

export const heroImage = hero;
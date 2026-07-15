export async function onRequest() {
    const destinationURL = "https://nepal-trip-backend.onrender.com/api/sitemap/sitemap.xml";
    return fetch(destinationURL);
}
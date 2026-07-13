/**
 * Automatically converts standard Google Drive sharing links (view, edit, open, etc.)
 * into a direct-rendering thumbnail or raw preview link that works inside standard <img> tags.
 */
export function resolveImageUrl(url: string | undefined | null): string {
  if (!url) return '';
  const cleanUrl = url.trim();

  // 1. Google Domains (Drive, Docs, Sheets, Usercontent)
  const isGoogle = cleanUrl.includes('google.com') || cleanUrl.includes('googleusercontent.com');
  if (isGoogle) {
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9_-]+)/,
      /\/d\/([a-zA-Z0-9_-]+)/,
      /id=([a-zA-Z0-9_-]+)/,
      /\/open\?id=([a-zA-Z0-9_-]+)/,
      /\/uc\?id=([a-zA-Z0-9_-]+)/,
      /\/thumbnail\?id=([a-zA-Z0-9_-]+)/,
      /googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/
    ];

    for (const pattern of patterns) {
      const match = cleanUrl.match(pattern);
      if (match && match[1]) {
        // Use higher quality size resolution (sz=w1000) for sharp render in portfolio grids
        return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
      }
    }
  }

  // 2. YouTube Links
  if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
    let videoId = '';
    if (cleanUrl.includes('youtu.be/')) {
      videoId = cleanUrl.split('youtu.be/')[1]?.split('?')[0];
    } else if (cleanUrl.includes('v=')) {
      videoId = cleanUrl.split('v=')[1]?.split('&')[0];
    } else if (cleanUrl.includes('embed/')) {
      videoId = cleanUrl.split('embed/')[1]?.split('?')[0];
    } else if (cleanUrl.includes('youtube.com/watch')) {
      videoId = cleanUrl.split('v=')[1]?.split('&')[0];
    }
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
  }

  // 3. Instagram / Vimeo fallbacks (cannot render direct images, use beautiful placeholder)
  if (cleanUrl.includes('instagram.com') || cleanUrl.includes('vimeo.com')) {
    return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=compress&cs=tinysrgb&w=800';
  }

  return cleanUrl;
}

/**
 * Automatically converts standard Google Drive sharing links (view, edit, open, etc.)
 * into a direct-rendering thumbnail or raw preview link that works inside standard <img> tags.
 */
export function resolveImageUrl(url: string | undefined | null): string {
  if (!url) return '';
  const cleanUrl = url.trim();

  // 1. Google Drive Links
  if (cleanUrl.includes('drive.google.com')) {
    let fileId = '';
    
    // Pattern 1: /file/d/FILE_ID/view?usp=sharing
    if (cleanUrl.includes('/file/d/')) {
      const parts = cleanUrl.split('/file/d/');
      fileId = parts[1]?.split('/')[0]?.split('?')[0]?.split('&')[0];
    }
    // Pattern 2: ?id=FILE_ID or &id=FILE_ID
    else if (cleanUrl.includes('id=')) {
      const parts = cleanUrl.split('id=');
      fileId = parts[1]?.split('&')[0];
    }
    
    if (fileId) {
      // Use higher quality size resolution (sz=w1000) for sharp render in portfolio grids
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
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

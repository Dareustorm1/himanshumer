/**
 * Automatically converts standard Google Drive sharing links (view, edit, open, etc.)
 * into a direct-rendering thumbnail or raw preview link that works inside standard <img> tags.
 */
export function resolveImageUrl(url: string | undefined | null): string {
  if (!url) return '';
  const cleanUrl = url.trim();

  // Handle Google Drive Links
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

  return cleanUrl;
}


export const normalizeBlog = (blog) => {
  if (!blog) return null;
  

  const authors = Array.isArray(blog.authors) ? blog.authors.map(author => ({
    username: author.username || author.user?.username || 'Unknown',
    avatar_url: author.avatar_url || author.user?.avatar_url || ''
  })) : [];

  return {
    id: blog._id?.toString() || blog.id?.toString() || '',
    title: blog.title || 'Untitled Blog',
    content: blog.content || '',
    thumbnail_url: blog.thumbnail_url || '',
    created_at: blog.created_at || new Date().toISOString(),
    updated_at: blog.updated_at || blog.created_at || new Date().toISOString(),
    deleted_at: blog.deleted_at || null,
    authors,
    upvotes: Array.isArray(blog.upvotes) ? blog.upvotes : [],
    downvotes: Array.isArray(blog.downvotes) ? blog.downvotes : [],
    versions: Array.isArray(blog.versions) ? blog.versions : [],
    is_draft: Boolean(blog.is_draft),
    is_published: Boolean(blog.is_published),
    is_deleted: Boolean(blog.is_deleted)
  };
};

const isValidUrl = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const getThumbnailUrl = (blog) => {
  const normalized = normalizeBlog(blog);
  

  if (normalized.thumbnail_url && isValidUrl(normalized.thumbnail_url)) {
    return normalized.thumbnail_url;
  }
  

  if (normalized.versions?.length > 0) {
    for (let i = normalized.versions.length - 1; i >= 0; i--) {
      const version = normalized.versions[i];
      if (version.thumbnail_url && isValidUrl(version.thumbnail_url)) {
        return version.thumbnail_url;
      }
    }
  }
  

  return '../assets/placeholder.png';
};

export const getContentPreview = (content) => {
  if (!content) return 'No content available';
  
  try {

    const temp = document.createElement('div');
    temp.innerHTML = content;
    
    let plainText = temp.textContent || temp.innerText || '';
    plainText = plainText.replace(/\s+/g, ' ').trim();
    
    return plainText.length > 100 ? `${plainText.substring(0, 100)}...` : plainText;
  } catch (e) {
    console.error('Error parsing content:', e);
    return 'Content preview unavailable';
  }
};

export const calculateReadTime = (content) => {
  if (!content) return '0 min read';
  
  try {
    const temp = document.createElement('div');
    temp.innerHTML = content;
    

    const text = temp.textContent || temp.innerText || '';
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    const minutes = Math.max(1, Math.ceil(wordCount / 200));
    
    return `${minutes} min read`;
  } catch (e) {
    console.error('Error calculating read time:', e);
    return '0 min read';
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return 'Unknown date';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    console.error('Error formatting date:', e);
    return 'Invalid date';
  }
};

export const getBadge = (points) => {
  if (!points) return 'Newbie';
  if (points < 100) return 'Beginner';
  if (points < 500) return 'Contributor';
  if (points < 1000) return 'Expert';
  return 'Master';
};
export const normalizeBlog = (blog) => {
  if (!blog) return null;
  
  // Handle both array and single author cases
  const authors = Array.isArray(blog.authors) 
      ? blog.authors.map(author => ({
          username: author.username || 'Unknown',
          avatar_url: author.avatar || ''
      }))
      : [{
          username: blog.authors?.username || 'Unknown',
          avatar_url: blog.authors?.avatar || ''
      }];

  return {
      id: blog.id?.toString() || blog._id?.toString() || '',
      title: blog.title || 'Untitled Blog',
      content: blog.content || blog.excerpt || '',
      thumbnail_url: blog.thumbnail_url || '',
      created_at: blog.created_at || new Date().toISOString(),
      updated_at: blog.updated_at || blog.created_at || new Date().toISOString(),
      deleted_at: blog.deleted_at || null,
      published_at: blog.published_at || null,
      authors,
      upvotes: Array.isArray(blog.upvotes) 
          ? blog.upvotes 
          : (blog.stats?.upvotes ? Array(blog.stats.upvotes).fill({}) : []),
      downvotes: Array.isArray(blog.downvotes) 
          ? blog.downvotes 
          : (blog.stats?.downvotes ? Array(blog.stats.downvotes).fill({}) : []),
      versions: Array.isArray(blog.versions) ? blog.versions : [],
      is_draft: blog.is_draft || blog.status === 'draft',
      is_published: blog.is_published || blog.status === 'published',
      is_deleted: blog.is_deleted || false,
      is_reviewed: blog.is_reviewed || false,
      reviewed_by: blog.reviewed_by || null
  };
};

// Add this new function to handle comment normalization
export const normalizeComment = (comment) => {
  if (!comment) return null;
  
  return {
      id: comment.id?.toString() || comment._id?.toString() || '',
      content: comment.content || '',
      created_at: comment.created_at || new Date().toISOString(),
      updated_at: comment.updated_at || comment.created_at || new Date().toISOString(),
      is_deleted: comment.is_deleted || false,
      is_reviewed: comment.is_reviewed || false,
      reviewed_by: comment.reviewed_by || null,
      author: {
          username: comment.author?.username || 'Deleted User',
          avatar_url: comment.author?.avatar_url || '',
          id: comment.author?.id?.toString() || comment.author?._id?.toString() || ''
      },
      blog: {
          id: comment.blog?.id?.toString() || comment.blog?._id?.toString() || '',
          title: comment.blog?.title || 'Deleted Blog',
          exists: !!comment.blog?.title // Flag to check if blog exists
      }
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

export const getContentPreview = (content, path = '') => {
  if (!content) return 'No content available';
  
  try {
    const temp = document.createElement('div');
    temp.innerHTML = content;
    
    let plainText = temp.textContent || temp.innerText || '';
    plainText = plainText.replace(/\s+/g, ' ').trim();
    
    // Split into words and limit based on path
    const words = plainText.split(' ');
    const maxWords = path.toLowerCase() === '/home' ? 100 : 10;
    
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(' ') + '...';
    }
    return plainText;
  } catch (e) {
    console.error('Error parsing content:', e);
    return 'Content preview unavailable';
  }
};

export const getContentPreviewhome = (content) => {
  if (!content) return '<div>No content available</div>';

  try {
    const temp = document.createElement('div');
    temp.innerHTML = content;

    // Count words in plain text
    const text = temp.textContent || '';
    const words = text.trim().split(/\s+/);
    
    // If content is <= 500 words, return original HTML
    if (words.length <= 500) {
      return content;
    }

    // If >500 words, truncate while keeping HTML structure
    let wordCount = 0;
    const truncate = (node) => {
      if (wordCount >= 500) {
        node.remove();
        return;
      }

      if (node.nodeType === Node.TEXT_NODE) {
        const nodeWords = node.textContent.trim().split(/\s+/);
        const remainingWords = 500 - wordCount;
        
        if (nodeWords.length > remainingWords) {
          node.textContent = nodeWords.slice(0, remainingWords).join(' ') + '...';
          wordCount = 500;
        } else {
          wordCount += nodeWords.length;
        }
      } 
      else if (node.nodeType === Node.ELEMENT_NODE) {
        Array.from(node.childNodes).forEach(truncate);
      }
    };

    const clone = temp.cloneNode(true);
    truncate(clone);
    return clone.innerHTML;
  } catch (e) {
    console.error("Error generating preview:", e);
    return '<div>Could not load content</div>';
  }
};


export const getTitlePreview = (title, path = '') => {
  if (!title) return 'No content available';
  
  try {
    const temp = document.createElement('div');
    temp.innerHTML = title;
    
    let plainText = temp.textContent || temp.innerText || '';
    plainText = plainText.replace(/\s+/g, ' ').trim();
    
    // Split into words and limit based on path
    const words = plainText.split(' ');
    const maxWords = path.toLowerCase() === '/home' ? 100 : 5;
    
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(' ') + '...';
    }
    return plainText;
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
    return '1 min read';
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
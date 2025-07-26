import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useTheme } from '../context/ThemeContext.jsx';
import { getThumbnailUrl, formatDate, calculateReadTime } from '../utils/blogUtils.js';

const Download = ({ blog }) => {
  const { primaryColor } = useTheme();

  const handleDownload = async () => {
    try {
      // Create a temporary container for PDF rendering
      const pdfContainer = document.createElement('div');
      pdfContainer.style.width = '800px';
      pdfContainer.style.padding = '20px';
      pdfContainer.style.backgroundColor = '#ffffff';
      pdfContainer.style.fontFamily = 'Arial, sans-serif';
      document.body.appendChild(pdfContainer);

      // Style the PDF content
      pdfContainer.innerHTML = `
        <div style="margin-bottom: 20px;">
          <img src="${getThumbnailUrl(blog)}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;" />
        </div>
        <h1 style="font-size: 24px; color: #333; margin-bottom: 10px;">${blog.title}</h1>
        <div style="font-size: 14px; color: #666; margin-bottom: 10px;">
          By: ${blog.authors?.map(author => author.username).join(', ')} | 
          Published: ${formatDate(blog.published_at)} | 
          ${calculateReadTime(blog.content)}
        </div>
        <div style="margin-bottom: 15px;">
          ${blog.categories?.map(category => `
            <span style="display: inline-block; padding: 5px 10px; margin-right: 5px; 
                        background-color: ${primaryColor}20; color: ${primaryColor}; 
                        border-radius: 12px; font-size: 12px;">
              ${category}
            </span>
          `).join('')}
        </div>
        <div style="font-size: 16px; line-height: 1.6; color: #333;">
          ${blog.content}
        </div>
      `;

      // Convert to canvas
      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      // Create PDF
      const pdf = new jsPDF('p', 'pt', 'a4');
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      
      // Clean up
      document.body.removeChild(pdfContainer);

      // Download PDF
      pdf.save(`${blog.title.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="px-4 py-2 text-white rounded-md hover:opacity-90 transition-colors duration-200 flex items-center gap-2"
      style={{ backgroundColor: primaryColor }}
    >
      <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Download PDF
    </button>
  );
};

export default Download;
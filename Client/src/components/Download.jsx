import jsPDF from 'jspdf';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-toastify';
import { getThumbnailUrl, formatDate, calculateReadTime } from '../utils/blogUtils.js';
import 'react-toastify/dist/ReactToastify.css';

const Download = ({ blog, onDownload }) => {
  const { primaryColor, darkMode } = useTheme();
  const { user } = useAuth();

  const showLoginToast = () => {
    toast.error('Please login to perform this action', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: darkMode ? 'dark' : 'light'
    });
  };

  const handleDownload = async () => {
    if (!user) {
      showLoginToast();
      onDownload?.();
      return;
    }

    try {
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 40;
      const contentWidth = pageWidth - 2 * margin;
      let currentY = margin;

      // Helper function to add new page
      const addNewPage = () => {
        pdf.addPage();
        currentY = margin;
        addHeader();
        addFooter();
      };

      // Helper function to check if new page is needed
      const addNewPageIfNeeded = (requiredSpace) => {
        if (currentY + requiredSpace > pageHeight - margin - 20) {
          addNewPage();
        }
      };

      // Add header (primary color line, centered)
      const addHeader = () => {
        pdf.setDrawColor(primaryColor);
        pdf.setLineWidth(1);
        pdf.line(margin, margin - 10, pageWidth - margin, margin - 10);
      };

      // Add footer (page number and blog title, aligned)
      const addFooter = () => {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(102, 102, 102); // #666
        const pageNum = pdf.internal.getCurrentPageInfo().pageNumber;
        pdf.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - margin + 10, { align: 'right' });
        pdf.text(blog.title.substring(0, 50), margin, pageHeight - margin + 10, { align: 'left' });
      };

      // Cover Page
      pdf.setFillColor(primaryColor);
      pdf.rect(0, 0, pageWidth, 120, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(28);
      pdf.setTextColor(255, 255, 255); // White
      const titleLines = pdf.splitTextToSize(blog.title, contentWidth);
      const titleHeight = titleLines.length * 32;
      const titleY = 40 + (100 - titleHeight) / 2; // Center vertically in title bar
      pdf.text(titleLines, pageWidth / 2, titleY, { align: 'center', maxWidth: contentWidth });

      // Thumbnail, centered
      const imgUrl = getThumbnailUrl(blog);
      try {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = imgUrl;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const imgProps = pdf.getImageProperties(img);
        const maxImgHeight = 200; // Limit thumbnail height
        let imgWidth = contentWidth;
        let imgHeight = (imgProps.height * contentWidth) / imgProps.width;
        if (imgHeight > maxImgHeight) {
          imgHeight = maxImgHeight;
          imgWidth = (imgProps.width * maxImgHeight) / imgProps.height;
        }
        currentY = 150;
        pdf.addImage(img, 'JPEG', (pageWidth - imgWidth) / 2, currentY, imgWidth, imgHeight, undefined, 'FAST');
        currentY += imgHeight + 20;
      } catch (err) {
        console.warn('Failed to load thumbnail:', err);
        currentY = 150;
      }

      // Metadata, centered
      pdf.setFont('times', 'normal');
      pdf.setFontSize(12);
      pdf.setTextColor(51, 51, 51); // #333
      const metadata = `By: ${blog.authors?.map(author => author.username).join(', ')} | Published: ${formatDate(blog.published_at)} | ${calculateReadTime(blog.content)}`;
      const metadataLines = pdf.splitTextToSize(metadata, contentWidth);
      pdf.text(metadataLines, pageWidth / 2, currentY, { align: 'center', maxWidth: contentWidth });
      currentY += metadataLines.length * 16 + 15;

      // Categories, centered with wrapping
      const categories = blog.categories || [];
      if (categories.length > 0) {
        let categoryX = margin;
        let categoryRow = [];
        let rowWidth = 0;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);

        categories.forEach(category => {
          const categoryText = ` ${category} `;
          const textWidth = pdf.getTextWidth(categoryText);
          if (rowWidth + textWidth > contentWidth) {
            // Render current row centered
            const rowStartX = (pageWidth - rowWidth) / 2;
            categoryRow.forEach(({ text, width, x }) => {
              pdf.setFillColor(primaryColor);
              pdf.setDrawColor(primaryColor);
              pdf.setTextColor(255, 255, 255); // White
              pdf.roundedRect(rowStartX + x, currentY - 12, width, 16, 8, 8, 'FD');
              pdf.text(text, rowStartX + x, currentY - 2);
            });
            currentY += 20;
            categoryRow = [];
            rowWidth = 0;
            categoryX = 0;
          }
          categoryRow.push({ text: categoryText, width: textWidth, x: categoryX });
          rowWidth += textWidth + 5;
          categoryX += textWidth + 5;
        });

        // Render last row
        if (categoryRow.length > 0) {
          const rowStartX = (pageWidth - rowWidth) / 2;
          categoryRow.forEach(({ text, width, x }) => {
            pdf.setFillColor(primaryColor);
            pdf.setDrawColor(primaryColor);
            pdf.setTextColor(255, 255, 255); // White
            pdf.roundedRect(rowStartX + x, currentY - 12, width, 16, 8, 8, 'FD');
            pdf.text(text, rowStartX + x, currentY - 2);
          });
          currentY += 20;
        }
      }
      currentY += 10;

      // Blog Content (starts on cover page)
      pdf.setFont('times', 'normal');
      pdf.setFontSize(12);
      pdf.setTextColor(51, 51, 51); // #333

      // Parse HTML content
      const parser = new DOMParser();
      const doc = parser.parseFromString(blog.content, 'text/html');

      // Process content nodes
      const processNode = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent.trim();
          if (text) {
            pdf.setFont('times', 'normal');
            pdf.setFontSize(12);
            pdf.setTextColor(51, 51, 51); // #333
            const lines = pdf.splitTextToSize(text, contentWidth);
            lines.forEach(line => {
              addNewPageIfNeeded(16);
              pdf.text(line, margin, currentY);
              currentY += 16;
            });
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          let fontStyle = 'normal';
          let fontSize = 12;
          let indent = margin;
          if (node.tagName === 'B' || node.tagName === 'STRONG') {
            fontStyle = 'bold';
          } else if (node.tagName === 'I' || node.tagName === 'EM') {
            fontStyle = 'italic';
          } else if (node.tagName === 'H1' || node.tagName === 'H2') {
            fontSize = 16;
            fontStyle = 'bold';
            currentY += 10;
            addNewPageIfNeeded(20);
          } else if (node.tagName === 'P') {
            currentY += 8;
            addNewPageIfNeeded(16);
          } else if (node.tagName === 'LI') {
            indent = margin + 10;
            pdf.text('•', margin, currentY);
          }

          pdf.setFont('times', fontStyle);
          pdf.setFontSize(fontSize);

          node.childNodes.forEach(child => processNode(child));

          if (node.tagName === 'P' || node.tagName === 'LI') {
            currentY += 8;
          } else if (node.tagName === 'H1' || node.tagName === 'H2') {
            currentY += 10;
          }
        }
      };

      doc.body.childNodes.forEach(node => processNode(node));

      // Add footer to cover page (after content is added)
      addFooter();

      // Save PDF
      pdf.save(`${blog.title.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: darkMode ? 'dark' : 'light'
      });
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center space-x-2 px-4 py-2 rounded-full transition-colors"
      style={{ backgroundColor: primaryColor, color: 'white' }}
    >
      <i className="fas fa-download"></i>
      <span>Download</span>
    </button>
  );
};

export default Download;
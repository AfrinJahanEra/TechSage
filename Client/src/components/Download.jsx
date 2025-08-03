import jsPDF from 'jspdf';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-toastify';
import { getThumbnailUrl, formatDate, calculateReadTime } from '../utils/blogUtils.js';
import { FaDownload } from 'react-icons/fa';
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

     
      const addNewPage = () => {
        pdf.addPage();
        currentY = margin;
        addHeader();
        addFooter();
      };

      
      const addNewPageIfNeeded = (requiredSpace) => {
        if (currentY + requiredSpace > pageHeight - margin - 20) {
          addNewPage();
        }
      };

      
      const addHeader = () => {
        pdf.setDrawColor(primaryColor);
        pdf.setLineWidth(1);
        pdf.line(margin, margin - 10, pageWidth - margin, margin - 10);
      };

      
      const addFooter = () => {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(102, 102, 102); 
        const pageNum = pdf.internal.getCurrentPageInfo().pageNumber;
        pdf.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - margin + 10, { align: 'right' });
        pdf.text(blog.title.substring(0, 50), margin, pageHeight - margin + 10, { align: 'left' });
      };

      
      pdf.setFillColor(primaryColor);
      pdf.rect(0, 0, pageWidth, 120, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(24);
      pdf.setTextColor(255, 255, 255); 
      const titleLines = pdf.splitTextToSize(blog.title, contentWidth);
      const titleHeight = titleLines.length * 28;
      const titleY = 40 + (100 - titleHeight) / 2;
      pdf.text(titleLines, pageWidth / 2, titleY, { align: 'center', maxWidth: contentWidth });

      
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
        const maxImgHeight = 200;
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

      
      pdf.setFont('times', 'normal');
      pdf.setFontSize(11);
      pdf.setTextColor(51, 51, 51); 
      const metadata = `By: ${blog.authors?.map(author => author.username).join(', ')} | Published: ${formatDate(blog.published_at)} | ${calculateReadTime(blog.content)}`;
      const metadataLines = pdf.splitTextToSize(metadata, contentWidth);
      pdf.text(metadataLines, pageWidth / 2, currentY, { align: 'center', maxWidth: contentWidth });
      currentY += metadataLines.length * 14 + 15;

      
      const categories = blog.categories || [];
      if (categories.length > 0) {
        let categoryX = margin;
        let categoryRow = [];
        let rowWidth = 0;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);

        categories.forEach(category => {
          const categoryText = ` ${category} `;
          const textWidth = pdf.getTextWidth(categoryText);
          if (rowWidth + textWidth > contentWidth) {
   
            const rowStartX = (pageWidth - rowWidth) / 2;
            categoryRow.forEach(({ text, width, x }) => {
              pdf.setFillColor(primaryColor);
              pdf.setDrawColor(primaryColor);
              pdf.setTextColor(255, 255, 255); 
              pdf.roundedRect(rowStartX + x, currentY - 10, width, 14, 7, 7, 'FD');
              pdf.text(text, rowStartX + x, currentY - 2);
            });
            currentY += 18;
            categoryRow = [];
            rowWidth = 0;
            categoryX = 0;
          }
          categoryRow.push({ text: categoryText, width: textWidth, x: categoryX });
          rowWidth += textWidth + 5;
          categoryX += textWidth + 5;
        });


        if (categoryRow.length > 0) {
          const rowStartX = (pageWidth - rowWidth) / 2;
          categoryRow.forEach(({ text, width, x }) => {
            pdf.setFillColor(primaryColor);
            pdf.setDrawColor(primaryColor);
            pdf.setTextColor(255, 255, 255); 
            pdf.roundedRect(rowStartX + x, currentY - 10, width, 14, 7, 7, 'FD');
            pdf.text(text, rowStartX + x, currentY - 2);
          });
          currentY += 18;
        }
      }
      currentY += 10;

    
      pdf.setFont('times', 'normal');
      pdf.setFontSize(11);
      pdf.setTextColor(51, 51, 51); 

   
      const parser = new DOMParser();
      const doc = parser.parseFromString(blog.content, 'text/html');

 
      const processNode = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent.trim();
          if (text) {
            pdf.setFont('times', 'normal');
            pdf.setFontSize(11);
            pdf.setTextColor(51, 51, 51); 
            const lines = pdf.splitTextToSize(text, contentWidth);
            lines.forEach(line => {
              addNewPageIfNeeded(14);
              pdf.text(line, margin, currentY);
              currentY += 14;
            });
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          let fontStyle = 'normal';
          let fontSize = 11;
          let indent = margin;
          if (node.tagName === 'B' || node.tagName === 'STRONG') {
            fontStyle = 'bold';
          } else if (node.tagName === 'I' || node.tagName === 'EM') {
            fontStyle = 'italic';
          } else if (node.tagName === 'H1' || node.tagName === 'H2') {
            fontSize = 14;
            fontStyle = 'bold';
            currentY += 8;
            addNewPageIfNeeded(18);
          } else if (node.tagName === 'P') {
            currentY += 6;
            addNewPageIfNeeded(14);
          } else if (node.tagName === 'LI') {
            indent = margin + 10;
            pdf.text('•', margin, currentY);
          }

          pdf.setFont('times', fontStyle);
          pdf.setFontSize(fontSize);

          node.childNodes.forEach(child => processNode(child));

          if (node.tagName === 'P' || node.tagName === 'LI') {
            currentY += 6;
          } else if (node.tagName === 'H1' || node.tagName === 'H2') {
            currentY += 8;
          }
        }
      };

      doc.body.childNodes.forEach(node => processNode(node));


      addFooter();


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
      className="flex items-center justify-center space-x-2 px-2 sm:px-4 py-1 sm:py-2 rounded-full hover:opacity-90 transition-colors text-sm sm:text-base w-10 sm:w-auto h-10 sm:h-auto"
      style={{ backgroundColor: primaryColor, color: 'white' }}
      title="Download"
    >
      <FaDownload className="text-base sm:text-lg" />
      <span className="hidden sm:inline">Download</span>
    </button>
  );
};

export default Download;
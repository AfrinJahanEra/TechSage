import jsPDF from 'jspdf';
import 'jspdf/dist/polyfills.es.js';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-toastify';
import { getThumbnailUrl, formatDate, calculateReadTime } from '../utils/blogUtils.js';
import { FaDownload } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';

// Font definitions removed due to base64 encoding issues
// Custom fonts should be properly base64 encoded or use default fonts

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

const renderLatexToImage = async (latex) => {
  const svgString = katex.renderToString(latex, { throwOnError: false });
  const svgDataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = svgDataUrl;
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

      // Title
      pdf.setFillColor(primaryColor);
      pdf.rect(0, 0, pageWidth, 120, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(24);
      pdf.setTextColor(255, 255, 255);
      const titleLines = pdf.splitTextToSize(blog.title, contentWidth);
      const titleHeight = titleLines.length * 28;
      const titleY = 40 + (100 - titleHeight) / 2;
      pdf.text(titleLines, pageWidth / 2, titleY, { align: 'center', maxWidth: contentWidth });

      // Thumbnail
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

      // Metadata
      pdf.setFont('times', 'normal');
      pdf.setFontSize(11);
      pdf.setTextColor(51, 51, 51);
      const metadata = `By: ${blog.authors?.map(author => author.username).join(', ')} | Published: ${formatDate(blog.published_at)} | ${calculateReadTime(blog.content)}`;
      const metadataLines = pdf.splitTextToSize(metadata, contentWidth);
      pdf.text(metadataLines, pageWidth / 2, currentY, { align: 'center', maxWidth: contentWidth });
      currentY += metadataLines.length * 14 + 15;

      // Categories
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

      // Parse and process Tiptap content
      const parser = new DOMParser();
      const doc = parser.parseFromString(blog.content, 'text/html');

      const processNode = (node, indent = margin, listLevel = 0, parentFont = { name: 'times', style: 'normal', size: 11, color: [51, 51, 51] }) => {
        if (node.nodeType === Node.TEXT_NODE) {
  const text = node.textContent.trim();
  if (text) {
    const lines = pdf.splitTextToSize(text, contentWidth - (indent - margin));
    pdf.setFont(parentFont.name, parentFont.style);
    pdf.setFontSize(parentFont.size);
    pdf.setTextColor(...parentFont.color);
    lines.forEach(line => {
      addNewPageIfNeeded(parentFont.size + 3);
      pdf.text(line, indent, currentY);
      currentY += parentFont.size + 3;
    });
  }
}
 else if (node.nodeType === Node.ELEMENT_NODE) {
          let fontStyle = 'normal';
          let fontSize = 11;
          let newIndent = indent;
          let skipChildren = false;

          switch (node.tagName.toLowerCase()) {
            case 'p':
              currentY += 6;
              addNewPageIfNeeded(14);
              break;
            case 'h1':
              fontSize = 18;
              fontStyle = 'bold';
              currentY += 10;
              addNewPageIfNeeded(22);
              break;
            case 'h2':
              fontSize = 14;
              fontStyle = 'bold';
              currentY += 8;
              addNewPageIfNeeded(18);
              break;
            case 'strong':
            case 'b':
              fontStyle = 'bold';
              break;
            case 'em':
            case 'i':
              fontStyle = 'italic';
              break;
            case 'a':
              pdf.setTextColor(0, 0, 255);
              const href = node.getAttribute('href') || '';
              const linkText = node.textContent || '[Link]';
              const displayText = href ? `${linkText} (${href})` : linkText;
              const linkLines = pdf.splitTextToSize(displayText, contentWidth - (indent - margin));
              linkLines.forEach(line => {
                addNewPageIfNeeded(14);
                if (href) {
                  pdf.textWithLink(line, indent, currentY, { url: href });
                } else {
                  pdf.text(line, indent, currentY);
                }
                currentY += 14;
              });
              skipChildren = true;
              break;
            case 'img':
              const src = node.getAttribute('src');
              if (src) {
                try {
                  const img = new Image();
                  img.crossOrigin = 'Anonymous';
                  img.src = src;
                  const loadPromise = new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                  });
                  //await loadPromise;
                  const imgProps = pdf.getImageProperties(img);
                  const maxImgHeight = 150;
                  let imgWidth = contentWidth;
                  let imgHeight = (imgProps.height * contentWidth) / imgProps.width;
                  if (imgHeight > maxImgHeight) {
                    imgHeight = maxImgHeight;
                    imgWidth = (imgProps.width * maxImgHeight) / imgProps.height;
                  }
                  addNewPageIfNeeded(imgHeight + 20);
                  pdf.addImage(img, 'JPEG', (pageWidth - imgWidth) / 2, currentY, imgWidth, imgHeight, undefined, 'FAST');
                  currentY += imgHeight + 20;
                } catch (err) {
                  console.warn('Failed to load image:', err);
                  const placeholder = '[Image not loaded]';
                  addNewPageIfNeeded(14);
                  pdf.text(placeholder, indent, currentY);
                  currentY += 14;
                }
              }
              skipChildren = true;
              break;
case 'ul': {
  // Accept both TipTap and plain UL
  if (node.getAttribute('data-type') === 'bulletList' || node.tagName.toLowerCase() === 'ul') {
    node.querySelectorAll(':scope > li').forEach(li => {
      processNode(li, indent + 12, listLevel + 1);
    });
    skipChildren = true;
  }
  break;
}
case 'ol': {
  // Handle ordered list
  const numberStyle = node.style.listStyleType || 'decimal';
  let index = 1;

  node.querySelectorAll(':scope > li').forEach(li => {
    // Compute label
    const label = (() => {
      if (numberStyle === 'lower-alpha') return String.fromCharCode(97 + index - 1) + '.';
      if (numberStyle === 'upper-alpha') return String.fromCharCode(65 + index - 1) + '.';
      if (numberStyle === 'lower-roman') return toRoman(index) + '.';
      if (numberStyle === 'upper-roman') return toRoman(index).toUpperCase() + '.';
      return index + '.';
    })();

    // Get text of LI (direct text or first <p>)
    let liText = Array.from(li.childNodes)
      .filter(n => n.nodeType === Node.TEXT_NODE)
      .map(n => n.textContent.trim())
      .join(' ')
      .trim();
    if (!liText) {
      const p = li.querySelector(':scope > p');
      liText = p ? p.textContent.trim() : '';
    }

    const textIndent = indent + 24; // space after number
    const width = contentWidth - (textIndent - margin);
    const lines = pdf.splitTextToSize(liText, width);

    lines.forEach((line, idx) => {
      addNewPageIfNeeded(14);

      if (idx === 0) {
        // Draw number label
        pdf.setFont('times', 'normal');
        pdf.setFontSize(11);
        pdf.setTextColor(51, 51, 51);
        pdf.text(label, indent + 12, currentY);
      }

      pdf.setFont('times', 'normal');
      pdf.setFontSize(11);
      pdf.setTextColor(51, 51, 51);
      pdf.text(line, textIndent, currentY);
      currentY += 14;
    });

    // Only recurse into nested lists (not the text)
    li.childNodes.forEach(child => {
      if (
        child.nodeType === Node.ELEMENT_NODE &&
        (child.tagName.toLowerCase() === 'ul' || child.tagName.toLowerCase() === 'ol')
      ) {
        processNode(child, indent + 16, listLevel + 1);
      }
    });

    currentY += 6;
    index++;
  });

  skipChildren = true; // prevent duplication
  break;
}

case 'li': {
  // Only handle bullets if <li> is under <ul>
  if (node.parentElement.tagName.toLowerCase() === 'ul') {
    const bulletX = indent + 8;
    const textIndent = indent + 16;

    // Get direct text or first <p>
    let liText = Array.from(node.childNodes)
      .filter(n => n.nodeType === Node.TEXT_NODE)
      .map(n => n.textContent.trim())
      .join(' ')
      .trim();
    if (!liText) {
      const p = node.querySelector(':scope > p');
      liText = p ? p.textContent.trim() : '';
    }

    const width = contentWidth - (textIndent - margin);
    const lines = pdf.splitTextToSize(liText, width);

    lines.forEach((line, idx) => {
      addNewPageIfNeeded(14);

      if (idx === 0) {
        // Draw bullet
        pdf.setFillColor(51, 51, 51);
        pdf.circle(bulletX, currentY - 3, 1.2, 'F');
      }

      pdf.setFont('times', 'normal');
      pdf.setFontSize(11);
      pdf.setTextColor(51, 51, 51);
      pdf.text(line, textIndent, currentY);
      currentY += 14;
    });

    // Recurse only into nested lists
    node.childNodes.forEach(child => {
      if (
        child.nodeType === Node.ELEMENT_NODE &&
        (child.tagName.toLowerCase() === 'ul' || child.tagName.toLowerCase() === 'ol')
      ) {
        processNode(child, indent + 16, listLevel + 1);
      }
    });

    skipChildren = true;
    currentY += 4;
  }
  break;
}
case 'blockquote': {
  const quoteIndent = indent + 20; // indent blockquote
  const startY = currentY;

  // Use a new font object for blockquote
  const quoteFont = { 
    name: 'times', 
    style: 'italic', 
    size: 11, 
    color: [90, 90, 90] 
  };

  // Process all children using blockquote font
  node.childNodes.forEach(child => processNode(child, quoteIndent, listLevel, quoteFont));

  const endY = currentY;

  // Draw vertical line for blockquote
  pdf.setDrawColor(120, 120, 120);
  pdf.setLineWidth(2);
  pdf.line(indent + 7, startY, indent + 7, endY - 2);

  currentY += 6; // spacing after blockquote
  skipChildren = true;
  break;
}

            case 'pre':
              if (node.classList.contains('code-block')) {
                const code = node.textContent.trim();
                const language = node.classList.value.match(/language-(\w+)/)?.[1] || 'plaintext';
                const codeLines = code.split('\n');
                addNewPageIfNeeded(14 * (codeLines.length + 2));
                pdf.setFillColor(darkMode ? 50 : 245, 245, 245);
                pdf.rect(margin, currentY - 10, contentWidth, 14 * (codeLines.length + 1), 'F');
                pdf.setFont('courier', 'normal');
                pdf.setFontSize(10);
                pdf.setTextColor(51, 51, 51);
                pdf.text(`Code (${language}):`, margin, currentY);
                currentY += 14;
                const lines = pdf.splitTextToSize(code, contentWidth - 10);
                lines.forEach(line => {
                  addNewPageIfNeeded(14);
                  pdf.text(line, margin + 5, currentY);
                  currentY += 14;
                });
                currentY += 10;
                skipChildren = true;
              }
              break;

case 'span': {
  if (node.classList.contains('tiptap-mathematics-render')) {
    const latex = node.getAttribute('data-expr') || node.textContent || '[LaTeX]';
    const lines = pdf.splitTextToSize(`[LaTeX: ${latex}]`, contentWidth - (indent - margin));
    pdf.setFont('courier', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(51, 51, 51);
    lines.forEach(line => {
      addNewPageIfNeeded(14);
      pdf.text(line, indent, currentY);
      currentY += 14;
    });
    skipChildren = true;
  }
  break;
}


            case 'table':
              const rows = Array.from(node.querySelectorAll('tr'));
              const colCount = rows[0]?.querySelectorAll('td, th').length || 1;
              const colWidth = contentWidth / colCount;
              rows.forEach(row => {
                const cells = Array.from(row.querySelectorAll('td, th'));
                let maxCellHeight = 14;
                const cellContents = cells.map(cell => {
                  const text = cell.textContent.trim();
                  const lines = pdf.splitTextToSize(text, colWidth - 10);
                  return { text, lines };
                });
                maxCellHeight = Math.max(...cellContents.map(c => c.lines.length * 14), 14);
                addNewPageIfNeeded(maxCellHeight + 2);
                cells.forEach((cell, colIndex) => {
                  const isHeader = cell.tagName.toLowerCase() === 'th';
                  pdf.setFont('times', isHeader ? 'bold' : 'normal');
                  pdf.setFontSize(11);
                  pdf.setTextColor(51, 51, 51);
                  pdf.setDrawColor(150, 150, 150);
                  pdf.setLineWidth(1);
                  pdf.rect(margin + colIndex * colWidth, currentY - 10, colWidth, maxCellHeight);
                  const lines = cellContents[colIndex].lines;
                  let cellY = currentY;
                  lines.forEach(line => {
                    pdf.text(line, margin + colIndex * colWidth + 5, cellY);
                    cellY += 14;
                  });
                });
                currentY += maxCellHeight + 2;
              });
              currentY += 10;
              skipChildren = true;
              break;
            case 'hr':
              addNewPageIfNeeded(10);
              pdf.setDrawColor(150, 150, 150);
              pdf.setLineWidth(1);
              pdf.line(margin, currentY, pageWidth - margin, currentY);
              currentY += 10;
              skipChildren = true;
              break;
            default:
              break;
          }

          pdf.setFont('times', fontStyle);
          pdf.setFontSize(fontSize);
          pdf.setTextColor(51, 51, 51);

          if (!skipChildren) {
            node.childNodes.forEach(child => processNode(child, newIndent, listLevel));
          }

          if (['p', 'li', 'blockquote'].includes(node.tagName.toLowerCase())) {
            currentY += 6;
          } else if (node.tagName.toLowerCase() === 'h1') {
            currentY += 10;
          } else if (node.tagName.toLowerCase() === 'h2') {
            currentY += 8;
          }
        }
      };

      // Utility to convert numbers to Roman numerals
      const toRoman = (num) => {
        const romanValues = [
          { value: 1000, numeral: 'M' },
          { value: 900, numeral: 'CM' },
          { value: 500, numeral: 'D' },
          { value: 400, numeral: 'CD' },
          { value: 100, numeral: 'C' },
          { value: 90, numeral: 'XC' },
          { value: 50, numeral: 'L' },
          { value: 40, numeral: 'XL' },
          { value: 10, numeral: 'X' },
          { value: 9, numeral: 'IX' },
          { value: 5, numeral: 'V' },
          { value: 4, numeral: 'IV' },
          { value: 1, numeral: 'I' },
        ];
        let result = '';
        for (const { value, numeral } of romanValues) {
          while (num >= value) {
            result += numeral;
            num -= value;
          }
        }
        return result || 'I';
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
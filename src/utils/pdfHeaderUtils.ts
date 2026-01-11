import jsPDF from 'jspdf';

interface PDFHeaderOptions {
  doc: jsPDF;
  municipalLogoUrl?: string | null;
  oscLogoUrl?: string | null;
  municipalName: string;
  municipalSubtitle?: string;
  oscName?: string;
  title: string;
  subtitle?: string;
}

interface HeaderResult {
  startY: number; // Y position after header, for content to start
}

/**
 * Loads an image from URL and returns as base64 data URL
 */
const loadImageAsBase64 = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error loading image:', error);
    return null;
  }
};

/**
 * Generates a professional PDF header with municipal and OSC branding
 * Returns the Y position where content should start
 */
export const generatePDFHeader = async ({
  doc,
  municipalLogoUrl,
  oscLogoUrl,
  municipalName,
  municipalSubtitle,
  oscName,
  title,
  subtitle,
}: PDFHeaderOptions): Promise<HeaderResult> => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let currentY = 12;
  
  // Logo dimensions
  const logoSize = 18;
  const logosY = currentY;
  
  // Track if we have logos
  let hasMunicipalLogo = false;
  let hasOscLogo = false;
  
  // Load and add municipal logo (left side)
  if (municipalLogoUrl) {
    try {
      const imgData = await loadImageAsBase64(municipalLogoUrl);
      if (imgData) {
        doc.addImage(imgData, 'PNG', margin, logosY, logoSize, logoSize);
        hasMunicipalLogo = true;
      }
    } catch (e) {
      console.error('Error adding municipal logo:', e);
    }
  }
  
  // Load and add OSC logo (right side)
  if (oscLogoUrl) {
    try {
      const imgData = await loadImageAsBase64(oscLogoUrl);
      if (imgData) {
        doc.addImage(imgData, 'PNG', pageWidth - margin - logoSize, logosY, logoSize, logoSize);
        hasOscLogo = true;
      }
    } catch (e) {
      console.error('Error adding OSC logo:', e);
    }
  }
  
  // Calculate text positioning based on logos
  const textStartX = hasMunicipalLogo ? margin + logoSize + 4 : margin;
  const textEndX = hasOscLogo ? pageWidth - margin - logoSize - 4 : pageWidth - margin;
  const textCenterX = (textStartX + textEndX) / 2;
  
  // Municipal name (centered between logos or in center)
  if (hasMunicipalLogo || hasOscLogo) {
    // If we have logos, position text between them
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(municipalName.toUpperCase(), textCenterX, logosY + 6, { align: 'center' });
    
    if (municipalSubtitle) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(municipalSubtitle, textCenterX, logosY + 11, { align: 'center' });
    }
    
    // If we have OSC name and logo
    if (oscName && hasOscLogo) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(oscName, pageWidth - margin - logoSize / 2, logosY + logoSize + 3, { align: 'center' });
    }
    
    currentY = logosY + logoSize + 6;
  } else {
    // No logos - simple centered header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(municipalName.toUpperCase(), pageWidth / 2, currentY + 6, { align: 'center' });
    
    if (municipalSubtitle) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(municipalSubtitle, pageWidth / 2, currentY + 12, { align: 'center' });
      currentY += 18;
    } else {
      currentY += 12;
    }
  }
  
  // Divider line
  currentY += 2;
  doc.setDrawColor(13, 148, 136); // Teal color
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 6;
  
  // Document title
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(title.toUpperCase(), pageWidth / 2, currentY, { align: 'center' });
  currentY += 6;
  
  // Subtitle if provided
  if (subtitle) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, pageWidth / 2, currentY, { align: 'center' });
    currentY += 6;
  }
  
  currentY += 4;
  
  return { startY: currentY };
};

/**
 * Synchronous version for simple headers without logo loading
 */
export const generateSimplePDFHeader = ({
  doc,
  municipalName,
  municipalSubtitle,
  title,
  subtitle,
}: Omit<PDFHeaderOptions, 'municipalLogoUrl' | 'oscLogoUrl' | 'oscName'>): HeaderResult => {
  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 12;
  
  // Municipal name
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(municipalName.toUpperCase(), pageWidth / 2, currentY + 6, { align: 'center' });
  
  if (municipalSubtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(municipalSubtitle, pageWidth / 2, currentY + 12, { align: 'center' });
    currentY += 18;
  } else {
    currentY += 12;
  }
  
  // Divider line
  currentY += 2;
  doc.setDrawColor(13, 148, 136);
  doc.setLineWidth(0.5);
  doc.line(14, currentY, pageWidth - 14, currentY);
  currentY += 6;
  
  // Document title
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(title.toUpperCase(), pageWidth / 2, currentY, { align: 'center' });
  currentY += 6;
  
  if (subtitle) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, pageWidth / 2, currentY, { align: 'center' });
    currentY += 6;
  }
  
  currentY += 4;
  
  return { startY: currentY };
};

/**
 * Adds standardized footer to all pages
 */
export const addPDFFooter = (doc: jsPDF, systemName: string) => {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(
      `Página ${i} de ${pageCount} • ${systemName}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.setTextColor(0);
  }
};

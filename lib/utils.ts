/**
 * Chuẩn hóa chuỗi để so sánh (bỏ dấu, viết thường, bỏ ký tự đặc biệt)
 */
export const slugify = (str: any) => {
  if (typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]/g, '');
};

/**
 * Cá nhân hóa nội dung (Subject hoặc Body)
 * Xử lý được placeholder có chứa HTML tags bên trong và so sánh header thông minh
 */
export function personalizeContent(text: string, rowData: any[], headers: string[]) {
  if (!text) return '';
  if (!rowData || !headers) return text;
  
  return text.replace(/{{([\s\S]*?)}}/g, (match, p1) => {
    // 1. Làm sạch placeholder (bỏ tags HTML nếu người dùng bôi đậm/nghiêng nhầm placeholder)
    const cleanPlaceholder = p1.replace(/<[^>]*>?/gm, '')
                                .replace(/&nbsp;/g, ' ')
                                .replace(/&amp;/g, '&')
                                .replace(/&lt;/g, '<')
                                .replace(/&gt;/g, '>');
    
    const target = slugify(cleanPlaceholder);
    const colIndex = headers.findIndex(h => slugify(h) === target);
    
    return colIndex !== -1 && rowData[colIndex] !== undefined ? String(rowData[colIndex]) : match;
  });
}

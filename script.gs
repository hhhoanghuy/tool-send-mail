/**
 * ==============================================================================
 * TOOL GỬI MAIL TỰ ĐỘNG - PHIÊN BẢN SECURITY (GOOGLE APPS SCRIPT)
 * ==============================================================================
 * Hướng dẫn:
 * 1. Mở Google Sheet đang nhận dữ liệu từ Form.
 * 2. Tiện ích mở rộng > Apps Script.
 * 3. Dán toàn bộ nội dung file này vào và nhấn Save.
 * 4. Chọn hàm 'setup' và nhấn 'Run' để cấp quyền và khởi chạy trigger.
 * ==============================================================================
 */

const CONFIG = {
  // 1. Tên sheet chứa dữ liệu (Phải khớp chính xác tên ở tab phía dưới Sheet)
  SHEET_NAME: 'Form Responses 1', 

  // 2. Tên cột chứa địa chỉ Email (Phải khớp chính xác tên cột tiêu đề)
  EMAIL_COLUMN_NAME: 'Địa chỉ email',

  // 3. Tên cột trạng thái (Tool sẽ tự tạo nếu chưa có)
  STATUS_COLUMN_NAME: 'Trạng thái gửi mail',

  // 4. Tiêu đề Email (Có thể dùng {{Tên cột}} để cá nhân hóa)
  EMAIL_SUBJECT: 'Chào mừng {{Họ và tên}} đã đăng ký thành công!',

  // 5. Nội dung Email (Dạng HTML chuyên nghiệp)
  EMAIL_TEMPLATE: `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
      <div style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px;">XÁC NHẬN ĐĂNG KÝ</h1>
      </div>
      <div style="padding: 30px; line-height: 1.6; color: #333;">
        <p>Xin chào <strong>{{Họ và tên}}</strong>,</p>
        <p>Cảm ơn bạn đã quan tâm và đăng ký tham gia sự kiện của chúng tôi. Hệ thống đã ghi nhận thông tin của bạn thành công.</p>
        
        <div style="background: #f9fafb; border-left: 4px solid #6366f1; padding: 15px; margin: 20px 0;">
          <strong>Thông tin ghi nhận:</strong><br>
          - Email: {{Địa chỉ email}}<br>
          - Thời gian: {{Timestamp}}
        </div>

        <p>Chúng tôi sẽ sớm gửi thêm thông tin chi tiết qua email này. Vui lòng kiểm tra hộp thư thường xuyên nhé!</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="#" style="background: #6366f1; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Tham gia nhóm Zalo hỗ trợ</a>
        </div>
      </div>
      <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
        &copy; 2026 Your Awesome Event. Đây là email tự động, vui lòng không phản hồi.
      </div>
    </div>
  `
};

/**
 * Hàm khởi tạo: Chạy hàm này ĐẦU TIÊN để cấp quyền và tạo trigger tự động.
 */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  
  if (!sheet) {
    throw new Error(`LỖI: Không tìm thấy sheet có tên "${CONFIG.SHEET_NAME}". Vui lòng kiểm tra lại CONFIG.`);
  }

  // 1. Đảm bảo có cột Trạng thái
  ensureStatusColumn(sheet);

  // 2. Tạo Trigger tự động khi có Form Submit
  createSubmitTrigger();

  // 3. Tạo Trigger chạy 5 phút/lần để tránh sót đơn
  createTimeTrigger();

  SpreadsheetApp.getUi().alert('✅ Đã thiết lập thành công! Tool sẽ tự động gửi mail khi có người đăng ký mới.');
}

/**
 * Logic chính để quét và gửi mail cho những dòng chưa gửi.
 */
function processEmails() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) return;

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const emailColIdx = headers.indexOf(CONFIG.EMAIL_COLUMN_NAME);
  const statusColIdx = headers.indexOf(CONFIG.STATUS_COLUMN_NAME);

  if (emailColIdx === -1) {
    Logger.log('LỖI: Không tìm thấy cột Email.');
    return;
  }

  // Duyệt qua từng dòng dữ liệu (bỏ qua dòng tiêu đề)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const status = row[statusColIdx];
    const recipient = row[emailColIdx];

    // Chỉ gửi nếu dòng đó có email và chưa có trạng thái 'Đã gửi'
    if (recipient && (!status || status === '')) {
      sendSingleEmail(sheet, headers, row, i + 1, statusColIdx);
    }
  }
}

/**
 * Hàm hỗ trợ gửi 1 email cụ thể và cập nhật trạng thái vào Sheet.
 */
function sendSingleEmail(sheet, headers, rowData, rowIndex, statusColIdx) {
  try {
    const recipient = rowData[headers.indexOf(CONFIG.EMAIL_COLUMN_NAME)];
    
    // Map dữ liệu của dòng vào object để thay thế placeholder
    const dataMap = {};
    headers.forEach((header, index) => {
      dataMap[header] = rowData[index];
    });

    // Thay thế placeholder trong Tiêu đề và Nội dung
    let subject = replacePlaceholders(CONFIG.EMAIL_SUBJECT, dataMap);
    let body = replacePlaceholders(CONFIG.EMAIL_TEMPLATE, dataMap);

    // Gửi mail bằng GmailApp (Sử dụng quyền của bạn)
    GmailApp.sendEmail(recipient, subject, '', {
      htmlBody: body
    });

    // Ghi nhận trạng thái vào Sheet (Cột trạng thái bắt đầu từ 1 nên +1)
    sheet.getRange(rowIndex, statusColIdx + 1).setValue('✅ Đã gửi: ' + new Date().toLocaleString());
    Logger.log('Đã gửi mail thành công cho: ' + recipient);

  } catch (e) {
    Logger.log('LỖI tại dòng ' + rowIndex + ': ' + e.toString());
    sheet.getRange(rowIndex, statusColIdx + 1).setValue('❌ Lỗi: ' + e.message);
  }
}

/**
 * Tiện ích thay thế {{Tên cột}} bằng dữ liệu thực tế.
 */
function replacePlaceholders(text, data) {
  return text.replace(/{{(.*?)}}/g, (match, p1) => {
    const key = p1.trim();
    return data[key] !== undefined ? data[key] : match;
  });
}

/**
 * Đảm bảo cột Trạng thái luôn tồn tại.
 */
function ensureStatusColumn(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  if (headers.indexOf(CONFIG.STATUS_COLUMN_NAME) === -1) {
    sheet.getRange(1, sheet.getLastColumn() + 1).setValue(CONFIG.STATUS_COLUMN_NAME);
  }
}

/**
 * Thiết lập Trigger khi Submit Form.
 */
function createSubmitTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  const exists = triggers.some(t => t.getHandlerFunction() === 'processEmails' && t.getEventType() === ScriptApp.EventType.ON_FORM_SUBMIT);
  
  if (!exists) {
    ScriptApp.newTrigger('processEmails')
      .forSpreadsheet(SpreadsheetApp.getActive())
      .onFormSubmit()
      .create();
  }
}

/**
 * Thiết lập Trigger chạy định kỳ 5 phút.
 */
function createTimeTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  const exists = triggers.some(t => t.getHandlerFunction() === 'processEmails' && t.getEventType() === ScriptApp.EventType.CLOCK);
  
  if (!exists) {
    ScriptApp.newTrigger('processEmails')
      .timeBased()
      .everyMinutes(5)
      .create();
  }
}

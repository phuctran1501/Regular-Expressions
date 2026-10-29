// ==========================================================================
// JavaScript thuần xử lý biểu mẫu, kiểm tra định dạng và lưu trữ LocalStorage
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("staff-form");
  const statusBanner = document.getElementById("status-banner");
  const statusIcon = document.getElementById("status-icon");
  const statusTitle = document.getElementById("status-title");
  const statusDesc = document.getElementById("status-desc");
  const logTableBody = document.getElementById("log-table-body");
  const logIndicator = document.getElementById("log-indicator");

  const photoInput = document.getElementById("Photo");
  const avatarImg = document.getElementById("avatar-img");
  const avatarFallback = document.querySelector(".avatar-fallback");

  const btnFillValid = document.getElementById("btn-fill-valid");
  const btnFillInvalid = document.getElementById("btn-fill-invalid");
  const btnReset = document.getElementById("btn-reset");

  const btnClearStaffList = document.getElementById("btn-clear-staff-list");
  const savedStaffTableBody = document.getElementById("saved-staff-table-body");
  const staffCountBadge = document.getElementById("staff-count-badge");

  const editingIndicator = document.getElementById("editing-indicator");
  const editingStaffName = document.getElementById("editing-staff-name");
  const btnCancelEdit = document.getElementById("btn-cancel-edit");

  // Các phần tử của Modal Phân tích cấu trúc Regex
  const regexModal = document.getElementById("regex-modal");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalCloseFooterBtn = document.getElementById("modal-close-footer-btn");
  const modalFieldTitle = document.getElementById("modal-field-title");
  const modalAttrBadge = document.getElementById("modal-attr-badge");
  const modalFullRegex = document.getElementById("modal-full-regex");
  const modalTokenBody = document.getElementById("modal-token-body");
  const modalTestInput = document.getElementById("modal-test-input");
  const modalTestBadge = document.getElementById("modal-test-badge");
  const modalTestFeedback = document.getElementById("modal-test-feedback");
  const modalValidExamples = document.getElementById("modal-valid-examples");
  const modalInvalidExamples = document.getElementById("modal-invalid-examples");

  let activeModalRegex = null;

  const STORAGE_KEY = "staff_validation_local_list";

  // Biến lưu ID của nhân viên đang được chỉnh sửa (nếu có). Mặc định null = Thêm mới
  let editingRecordId = null;

  const fields = [
    "StaffID",
    "StaffName",
    "Email",
    "PhoneNumber",
    "StartingDate",
    "Photo",
  ];

  const fieldLabels = {
    StaffID: "Mã nhân viên",
    StaffName: "Họ và tên",
    Email: "Địa chỉ Email",
    PhoneNumber: "Số điện thoại",
    StartingDate: "Ngày bắt đầu làm việc",
    Photo: "Ảnh đại diện",
  };

  // ==========================================================================
  // Dữ liệu bóc tách và giải thích chi tiết cấu trúc Biểu thức chính quy
  // ==========================================================================
  const REGEX_BREAKDOWNS = {
    StaffID: {
      propertyName: "StaffID",
      title: "Mã nhân viên (StaffID)",
      attribute: "[StaffIdCheck]",
      regex: "^[1-9]\\d{0,6}$",
      description: "Số nguyên dương hợp lệ có độ dài từ 1 đến 7 chữ số (từ 1 đến 9.999.999).",
      tokens: [
        { token: "^", desc: "Neo đầu dòng (Anchor)", rule: "Bắt buộc so khớp từ ký tự đầu tiên của chuỗi." },
        { token: "[1-9]", desc: "Chữ số đầu tiên từ 1 đến 9", rule: "Loại trừ số 0 ở đầu (ngăn chặn số 0 hoặc số âm)." },
        { token: "\\d{0,6}", desc: "0 đến 6 chữ số bất kỳ tiếp theo", rule: "Đảm bảo tổng chiều dài từ 1 đến 7 chữ số (phù hợp quy mô doanh nghiệp từ 1 đến hàng triệu nhân sự)." },
        { token: "$", desc: "Neo cuối dòng (Anchor)", rule: "Kết thúc chuỗi, không cho phép ký tự lạ dư thừa ở cuối." },
      ],
      validExamples: [
        { value: "1024", note: "Mã 4 chữ số thông dụng" },
        { value: "1", note: "Mã 1 chữ số nhỏ nhất hợp lệ" },
        { value: "9999999", note: "Mã 7 chữ số tối đa cho phép" },
      ],
      invalidExamples: [
        { value: "0124", reason: "Bắt đầu bằng số 0 (không hợp lệ)" },
        { value: "NV-1024", reason: "Chứa chữ cái và dấu gạch nối" },
        { value: "-10", reason: "Số âm không hợp lệ" },
        { value: "12345678", reason: "Vượt quá độ dài tối đa 7 chữ số" },
      ],
    },
    StaffName: {
      propertyName: "StaffName",
      title: "Họ và tên (StaffName)",
      attribute: "[StaffNameCheck]",
      regex: "^[\\p{L}\\s.']{2,60}$",
      description: "Chỉ gồm chữ cái Unicode tiếng Việt có dấu, khoảng trắng, dấu chấm và nháy đơn, độ dài 2-60 ký tự.",
      tokens: [
        { token: "^", desc: "Neo đầu dòng", rule: "Bắt đầu kiểm tra từ ký tự đầu tiên." },
        { token: "\\p{L}", desc: "Mọi ký tự chữ cái Unicode", rule: "Hỗ trợ 100% tiếng Việt có dấu (ă, â, đ, ê, ô, ơ, ư...) và chữ cái quốc tế." },
        { token: "\\s", desc: "Khoảng trắng", rule: "Phân tách giữa họ, chữ lót và tên." },
        { token: ".", desc: "Dấu chấm", rule: "Hỗ trợ các tên viết tắt hoặc tước hiệu (Dr., Jr.)." },
        { token: "'", desc: "Dấu nháy đơn", rule: "Hỗ trợ các họ quốc tế (O'Connor, D'Angelo)." },
        { token: "{2,60}", desc: "Lượng từ độ dài", rule: "Độ dài chuỗi từ 2 đến tối đa 60 ký tự." },
        { token: "$", desc: "Neo cuối dòng", rule: "Kết thúc kiểm tra, loại bỏ ký tự lạ ở cuối." },
      ],
      validExamples: [
        { value: "Nguyễn Văn An", note: "Tên tiếng Việt chuẩn có dấu" },
        { value: "Trần Trọng Phúc", note: "Họ tên tiếng Việt đầy đủ" },
        { value: "Nguyễn Phước Lộc", note: "Họ tên tiếng Việt đầy đủ" },
        { value: "John O'Connor", note: "Tên có dấu nháy đơn quốc tế" },
      ],
      invalidExamples: [
        { value: "1234 Staff", reason: "Chứa ký tự chữ số" },
        { value: "Nguyen@An", reason: "Chứa ký tự đặc biệt @" },
        { value: "A", reason: "Quá ngắn (ít hơn 2 ký tự)" },
      ],
    },
    Email: {
      propertyName: "Email",
      title: "Địa chỉ Email (Email)",
      attribute: "[EmailCheck]",
      regex: "^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)+$",
      description: "Đúng định dạng hộp thư điện tử tiêu chuẩn quốc tế (LocalPart@Domain.TLD).",
      tokens: [
        { token: "^[a-zA-Z0-9_.+-]+", desc: "Tên người dùng (Local Part)", rule: "Chữ cái, chữ số và các ký tự đặc biệt cho phép: . _ + -" },
        { token: "@", desc: "Ký tự phân cách @", rule: "Bắt buộc có duy nhất 1 ký tự @ phân cách." },
        { token: "[a-zA-Z0-9-]+", desc: "Tên miền cấp 2 (Domain Name)", rule: "Tên miền tổ chức như gmail, ctu, company." },
        { token: "(?:\\.[a-zA-Z0-9-]+)+$", desc: "Phần mở rộng tên miền (TLD)", rule: "Nhóm không thu giữ (Non-capturing group) lặp lại ít nhất 1 lần (.com, .vn, .edu.vn)." },
      ],
      validExamples: [
        { value: "nvan@company.vn", note: "Email công ty đuôi .vn" },
        { value: "loc.b2303828@student.ctu.edu.vn", note: "Email sinh viên đa tầng tên miền" },
        { value: "phuc_tran+work@gmail.com", note: "Email chứa dấu _ và +" },
      ],
      invalidExamples: [
        { value: "email_sai", reason: "Thiếu ký tự @ và tên miền" },
        { value: "user@", reason: "Thiếu phần tên miền sau @" },
        { value: "user@domain", reason: "Thiếu phần mở rộng tên miền (.com/.vn)" },
        { value: "user@domain..com", reason: "Dấu chấm kép không hợp lệ" },
      ],
    },
    PhoneNumber: {
      propertyName: "PhoneNumber",
      title: "Số điện thoại Việt Nam (PhoneNumber)",
      attribute: "[PhoneCheck]",
      regex: "^(?:(?:\\+84|0)(?:(?:3[2-9]|5[25689]|7[06-9]|8[1-9]|9\\d)(?:[-.\\s]?\\d{3})[-.\\s]?\\d{4}|2\\d{1,2}(?:[-.\\s]?\\d{3,4})[-.\\s]?\\d{4})|\\((?:\\+84|0)2\\d{1,2}\\)[-.\\s]?\\d{3,4}[-.\\s]?\\d{4})$",
      description: "Đúng quy chuẩn số điện thoại di động (10 số) và số cố định tại Việt Nam; loại bỏ số ma.",
      tokens: [
        { token: "(?:\\+84|0)", desc: "Mã quốc gia hoặc số 0 nội địa", rule: "Bắt đầu bằng +84 hoặc số 0." },
        { token: "3[2-9]", desc: "Mạng Viettel di động", rule: "Đầu số 032 đến 039." },
        { token: "5[25689]", desc: "Vietnamobile, Wintel, Gmobile", rule: "Đầu số 052, 055, 056, 058, 059." },
        { token: "7[06-9]", desc: "Mạng MobiFone", rule: "Đầu số 070, 076, 077, 078, 079." },
        { token: "8[1-9]", desc: "VinaPhone, Viettel, Itelecom", rule: "Đầu số 081-085, 086, 087, 088, 089." },
        { token: "9\\d", desc: "Các đầu số 09 truyền thống", rule: "Tất cả các mạng từ 090 đến 099." },
        { token: "(?:[-.\\s]?\\d{3})[-.\\s]?\\d{4}", desc: "7 số thuê bao còn lại", rule: "Tổng cộng 10 số, cho phép dấu cách, gạch ngang hoặc chấm." },
        { token: "2\\d{1,2}... | \\((?:\\+84|0)2...\\)", desc: "Số điện thoại cố định", rule: "Hỗ trợ mã vùng Hà Nội (024), TP.HCM (028), Cần Thơ (0292)..." },
      ],
      validExamples: [
        { value: "0912345678", note: "Di động VinaPhone 10 số liền mạch" },
        { value: "+84 912 345 678", note: "Đầu số quốc tế có dấu cách" },
        { value: "0389-123-456", note: "Di động Viettel có dấu gạch ngang" },
        { value: "(0292) 3832 567", note: "Số cố định Cần Thơ có dấu ngoặc mã vùng" },
      ],
      invalidExamples: [
        { value: "0123456789", reason: "Đầu 012 cũ (11 số đã bị Bộ TTTT thu hồi từ 2018)" },
        { value: "0012345678", reason: "Đầu số ma không tồn tại ở Việt Nam" },
        { value: "09123", reason: "Quá ngắn (không đủ số lượng ký số)" },
      ],
    },
    StartingDate: {
      propertyName: "StartingDate",
      title: "Ngày bắt đầu làm việc (StartingDate)",
      attribute: "[StartingDateCheck]",
      regex: "^\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])$",
      description: "Định dạng niên lịch quốc tế ISO-8601 (YYYY-MM-DD), kiểm soát giới hạn tháng 01-12 và ngày 01-31.",
      tokens: [
        { token: "^\\d{4}", desc: "4 chữ số năm (YYYY)", rule: "Đại diện cho năm dương lịch." },
        { token: "-", desc: "Dấu gạch ngang phân cách", rule: "Ký tự phân cách bắt buộc theo chuẩn ISO." },
        { token: "(?:0[1-9]|1[0-2])", desc: "Tháng từ 01 đến 12 (MM)", rule: "Loại trừ tháng 00 hoặc các tháng lớn hơn 12." },
        { token: "-", desc: "Dấu gạch ngang phân cách", rule: "Ký tự phân cách bắt buộc." },
        { token: "(?:0[1-9]|[12]\\d|3[01])$", desc: "Ngày từ 01 đến 31 (DD)", rule: "0[1-9] (1-9), [12]\\d (10-29), 3[01] (30-31)." },
      ],
      validExamples: [
        { value: "2026-10-01", note: "Đúng chuẩn YYYY-MM-DD" },
        { value: "2025-12-31", note: "Ngày cuối cùng của năm" },
        { value: "2024-02-28", note: "Ngày hợp lệ trong năm" },
      ],
      invalidExamples: [
        { value: "31/12/2026", reason: "Sai định dạng (phải dùng gạch ngang YYYY-MM-DD)" },
        { value: "2026-13-01", reason: "Tháng 13 không tồn tại" },
        { value: "2026-05-32", reason: "Ngày 32 không tồn tại" },
      ],
    },
    Photo: {
      propertyName: "Photo",
      title: "Tệp ảnh đại diện (Photo)",
      attribute: "[PhotoCheck]",
      regex: "^(?:https?:\\/\\/.+\\/|[a-zA-Z0-9_\\-\\\\\\/]+)?[\\w\\-\\.]+\\.(?:jpg|jpeg|png|webp|gif|svg)$",
      description: "Đường dẫn hợp lệ tới tệp hình ảnh với các đuôi định dạng cho phép: .jpg, .jpeg, .png, .webp, .gif, .svg.",
      tokens: [
        { token: "(?:https?:\\/\\/.+\\/...)?", desc: "Đường dẫn tùy chọn (URL/Folder)", rule: "Cho phép tiền tố http://, https:// hoặc thư mục uploads/." },
        { token: "[\\w\\-\\.]+", desc: "Tên tệp hình ảnh", rule: "Chữ cái, chữ số, gạch dưới, gạch ngang và dấu chấm." },
        { token: "\\.", desc: "Dấu chấm phân cách", rule: "Dấu chấm trước phần mở rộng tệp." },
        { token: "(?:jpg|jpeg|png|webp|gif|svg)$", desc: "Phần mở rộng ảnh hợp lệ", rule: "Chỉ chấp nhận các định dạng ảnh web an toàn, chặn file thực thi độc hại." },
      ],
      validExamples: [
        { value: "avatar-nv1024.jpg", note: "Tên file ảnh chuẩn JPG" },
        { value: "profile.png", note: "Tên file ảnh PNG" },
        { value: "https://cdn.site.com/images/avatar.webp", note: "Đường dẫn URL ảnh trực tuyến" },
      ],
      invalidExamples: [
        { value: "tai-lieu.pdf", reason: "Định dạng file PDF (không phải file ảnh)" },
        { value: "virus.exe", reason: "File thực thi nguy hiểm" },
        { value: "avatar", reason: "Thiếu phần mở rộng ảnh" },
      ],
    },
  };

  // Mở Modal phân tích cấu trúc Regex
  function openRegexModal(propertyName) {
    const data = REGEX_BREAKDOWNS[propertyName];
    if (!data) return;

    activeModalRegex = new RegExp(data.regex, "u");

    modalFieldTitle.textContent = `Phân tích Biểu thức chính quy: ${data.title}`;
    modalAttrBadge.textContent = data.attribute;
    modalFullRegex.textContent = data.regex;

    // Tokens
    let tokenHtml = "";
    data.tokens.forEach((t) => {
      tokenHtml += `
        <tr>
          <td><span class="token-pill">${escapeHtml(t.token)}</span></td>
          <td><strong>${escapeHtml(t.desc)}</strong></td>
          <td>${escapeHtml(t.rule)}</td>
        </tr>
      `;
    });
    modalTokenBody.innerHTML = tokenHtml;

    // Live test reset
    modalTestInput.value = "";
    modalTestBadge.style.display = "none";
    modalTestFeedback.textContent = "Gõ một giá trị vào ô trên để kiểm tra so khớp ngay lập tức.";
    modalTestFeedback.className = "live-test-feedback";

    // Valid examples
    let validHtml = "";
    data.validExamples.forEach((ex) => {
      validHtml += `<li><code>${escapeHtml(ex.value)}</code> &mdash; ${escapeHtml(ex.note)}</li>`;
    });
    modalValidExamples.innerHTML = validHtml;

    // Invalid examples
    let invalidHtml = "";
    data.invalidExamples.forEach((ex) => {
      invalidHtml += `<li><code>${escapeHtml(ex.value)}</code> &mdash; <span style="color: #991b1b;">${escapeHtml(ex.reason)}</span></li>`;
    });
    modalInvalidExamples.innerHTML = invalidHtml;

    regexModal.style.display = "flex";
    document.body.style.overflow = "hidden"; // Ngăn cuộn trang phía sau khi mở modal
    modalTestInput.focus();
  }

  // Đóng Modal
  function closeRegexModal() {
    regexModal.style.display = "none";
    document.body.style.overflow = "auto";
    activeModalRegex = null;
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeRegexModal);
  if (modalCloseFooterBtn) modalCloseFooterBtn.addEventListener("click", closeRegexModal);
  if (regexModal) {
    regexModal.addEventListener("click", (e) => {
      if (e.target === regexModal) {
        closeRegexModal();
      }
    });
  }

  // Đóng modal bằng phím Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && regexModal && regexModal.style.display === "flex") {
      closeRegexModal();
    }
  });

  // Thử nghiệm trực tiếp tức thì trong Modal
  if (modalTestInput) {
    modalTestInput.addEventListener("input", (e) => {
      const val = e.target.value;
      if (!val) {
        modalTestBadge.style.display = "none";
        modalTestFeedback.textContent = "Gõ một giá trị vào ô trên để kiểm tra so khớp ngay lập tức.";
        modalTestFeedback.className = "live-test-feedback";
        return;
      }

      if (activeModalRegex) {
        const isMatch = activeModalRegex.test(val);
        modalTestBadge.style.display = "inline-block";
        if (isMatch) {
          modalTestBadge.className = "badge-tag-valid";
          modalTestBadge.textContent = "Khớp (Hợp lệ)";
          modalTestFeedback.textContent = `Chuỗi "${val}" hoàn toàn KHỚP với biểu thức chính quy này.`;
          modalTestFeedback.className = "live-test-feedback is-valid";
        } else {
          modalTestBadge.className = "badge-tag-invalid";
          modalTestBadge.textContent = "Không khớp (Lỗi)";
          modalTestFeedback.textContent = `Chuỗi "${val}" KHÔNG KHỚP với cấu trúc quy định của biểu thức chính quy này.`;
          modalTestFeedback.className = "live-test-feedback is-invalid";
        }
      }
    });
  }

  // Danh sách các mẫu dữ liệu chuẩn hợp lệ để người dùng thử nghiệm nhiều nhân viên khác nhau
  let validSampleIndex = 0;
  const validSamples = [
    {
      StaffID: "1024",
      StaffName: "Nguyễn Văn An",
      Email: "nvan@company.vn",
      PhoneNumber: "+84912345678",
      StartingDate: "2026-10-01",
      Photo: "avatar-nv1024.jpg",
    },
    {
      StaffID: "1025",
      StaffName: "Trần Thị Mai",
      Email: "ttmai@company.vn",
      PhoneNumber: "0987654321",
      StartingDate: "2026-10-15",
      Photo: "avatar-nv1025.png",
    },
    {
      StaffID: "1026",
      StaffName: "Lê Hoàng Nam",
      Email: "lhnam@company.vn",
      PhoneNumber: "+84903123456",
      StartingDate: "2026-10-20",
      Photo: "avatar-nv1026.jpg",
    },
  ];

  // Dữ liệu thử chứa lỗi để kiểm tra định dạng
  const invalidSample = {
    StaffID: "NV-ABC",
    StaffName: "1234@ Staff",
    Email: "email_sai",
    PhoneNumber: "0123456789",
    StartingDate: "31/12/2027",
    Photo: "tai-lieu.pdf",
  };

  // Cập nhật ảnh đại diện xem trước trên biểu mẫu
  function updateAvatarPreview(photoValue) {
    if (!photoValue) {
      avatarImg.style.display = "none";
      avatarFallback.style.display = "block";
      return;
    }

    const isImage = /\.(jpg|jpeg|png|webp|svg)$/i.test(photoValue);
    if (
      isImage &&
      (photoValue.startsWith("http://") ||
        photoValue.startsWith("https://") ||
        photoValue.startsWith("data:"))
    ) {
      avatarImg.src = photoValue;
      avatarImg.style.display = "block";
      avatarFallback.style.display = "none";
      avatarImg.onerror = () => {
        avatarImg.style.display = "none";
        avatarFallback.style.display = "block";
      };
    } else {
      avatarImg.style.display = "none";
      avatarFallback.style.display = "block";
    }
  }

  if (photoInput) {
    photoInput.addEventListener("input", (e) => {
      updateAvatarPreview(e.target.value.trim());
    });
  }

  // ==========================================================================
  // Xử lý Chế độ Chỉnh sửa (Edit Mode) vs Thêm mới (Add Mode)
  // ==========================================================================

  function startEditing(staff) {
    editingRecordId = staff.id || staff.StaffID;
    if (editingIndicator && editingStaffName) {
      const displayName = staff.StaffName || staff.StaffID;
      editingStaffName.textContent = `${displayName} (Mã NV: ${staff.StaffID})`;
      editingIndicator.style.display = "flex";
    }
    const submitBtn = document.getElementById("btn-submit");
    if (submitBtn) {
      submitBtn.textContent = "Cập nhật nhân viên";
    }
  }

  function cancelEditing() {
    editingRecordId = null;
    if (editingIndicator) {
      editingIndicator.style.display = "none";
    }
    const submitBtn = document.getElementById("btn-submit");
    if (submitBtn) {
      submitBtn.textContent = "Lưu thông tin";
    }
  }

  if (btnCancelEdit) {
    btnCancelEdit.addEventListener("click", () => {
      cancelEditing();
      clearValidation();
    });
  }

  // ==========================================================================
  // Xử lý LocalStorage lưu danh sách nhân viên
  // ==========================================================================

  // Đọc danh sách nhân viên từ LocalStorage
  function getSavedStaffList() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Lỗi khi đọc LocalStorage:", e);
      return [];
    }
  }

  // Lưu hoặc cập nhật thông tin nhân viên vào LocalStorage
  function saveStaffToLocal(staff) {
    const list = getSavedStaffList();
    const nowStr =
      new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) +
      " " +
      new Date().toLocaleDateString("vi-VN");

    let savedId = null;

    // NẾU ĐANG Ở CHẾ ĐỘ SỬA: Cập nhật bản ghi cụ thể đó
    if (editingRecordId) {
      const existingIndex = list.findIndex(
        (item) => item.id === editingRecordId || item.StaffID === editingRecordId
      );

      if (existingIndex >= 0) {
        list[existingIndex] = {
          ...staff,
          id: editingRecordId,
          savedAt: nowStr,
          isUpdate: true,
        };
        savedId = editingRecordId;
      }
      cancelEditing(); // Thoát chế độ sửa để lần sau bấm Lưu sẽ là tạo mới
    }

    // MẶC ĐỊNH: Luôn TẠO MỚI nhân viên (không bao giờ ghi đè lên nhân viên cũ)
    if (!savedId) {
      const newId = "emp_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
      list.unshift({
        ...staff,
        id: newId,
        savedAt: nowStr,
        isUpdate: false,
      });
      savedId = newId;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error("Lỗi khi ghi vào LocalStorage:", e);
    }
    return { list, savedId };
  }

  // Xóa nhân viên theo ID bản ghi
  function deleteStaffFromLocal(recordId) {
    let list = getSavedStaffList();
    list = list.filter((item) => item.id !== recordId && item.StaffID !== recordId);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error("Lỗi khi cập nhật LocalStorage:", e);
    }
    if (editingRecordId === recordId) {
      cancelEditing();
    }
    renderSavedStaffList();
  }

  // Xóa toàn bộ danh sách nhân viên đã lưu
  function clearAllSavedStaff() {
    const list = getSavedStaffList();
    if (list.length === 0) {
      alert("Danh sách nhân viên hiện đang trống.");
      return;
    }

    if (confirm("Bạn có chắc chắn muốn xóa tất cả nhân viên đã lưu trong danh sách local không?")) {
      localStorage.removeItem(STORAGE_KEY);
      cancelEditing();
      renderSavedStaffList();
    }
  }

  // Render danh sách nhân viên đã lưu vào bảng bên dưới
  function renderSavedStaffList(highlightId = null) {
    const list = getSavedStaffList();

    if (staffCountBadge) {
      staffCountBadge.textContent = `${list.length} nhân viên`;
    }

    if (!savedStaffTableBody) return;

    if (list.length === 0) {
      savedStaffTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-log">
            Chưa có nhân viên nào được lưu trong bộ nhớ local. Hãy nhập thông tin hợp lệ và nhấn <strong>Lưu thông tin</strong>.
          </td>
        </tr>
      `;
      return;
    }

    let html = "";
    list.forEach((item) => {
      const currentId = item.id || item.StaffID;
      const isHighlighted =
        highlightId && (item.id === highlightId || item.StaffID === highlightId)
          ? "row-highlight"
          : "";

      const isImgUrl =
        item.Photo &&
        (item.Photo.startsWith("http://") ||
          item.Photo.startsWith("https://") ||
          item.Photo.startsWith("data:") ||
          /\.(jpg|jpeg|png|webp|svg)$/i.test(item.Photo));

      const avatarContent =
        isImgUrl && (item.Photo.startsWith("http") || item.Photo.startsWith("data"))
          ? `<img class="staff-avatar-img" src="${escapeHtml(item.Photo)}" alt="${escapeHtml(item.StaffName)}" onerror="this.onerror=null;this.parentElement.textContent='${escapeHtml(item.StaffName ? item.StaffName.charAt(0).toUpperCase() : '?')}';">`
          : `<span>${escapeHtml(item.StaffName ? item.StaffName.charAt(0).toUpperCase() : '?')}</span>`;

      html += `
        <tr class="${isHighlighted}" id="staff-row-${escapeHtml(currentId)}">
          <td>
            <div class="staff-avatar-cell" title="${escapeHtml(item.Photo || 'Chưa có ảnh')}">
              ${avatarContent}
            </div>
          </td>
          <td>
            <span class="staff-id-tag">${escapeHtml(item.StaffID)}</span>
          </td>
          <td>
            <span class="staff-name-text">${escapeHtml(item.StaffName)}</span>
          </td>
          <td class="cell-value" title="${escapeHtml(item.Email)}">${escapeHtml(item.Email)}</td>
          <td>${escapeHtml(item.PhoneNumber)}</td>
          <td>${escapeHtml(item.StartingDate)}</td>
          <td>
            <div class="staff-actions">
              <button type="button" class="btn-row-action btn-row-edit" data-id="${escapeHtml(currentId)}" title="Nạp thông tin lên biểu mẫu để chỉnh sửa">
                Nạp lại
              </button>
              <button type="button" class="btn-row-action btn-row-delete" data-id="${escapeHtml(currentId)}" title="Xóa nhân viên này khỏi danh sách">
                Xóa
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    savedStaffTableBody.innerHTML = html;

    // Gắn sự kiện cho nút "Nạp lại" (chỉnh sửa) và "Xóa"
    savedStaffTableBody.querySelectorAll(".btn-row-edit").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const currentList = getSavedStaffList();
        const staff = currentList.find((s) => (s.id || s.StaffID) === id);
        if (staff) {
          startEditing(staff);
          fillForm(staff, true);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    });

    savedStaffTableBody.querySelectorAll(".btn-row-delete").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        if (confirm(`Bạn có chắc muốn xóa nhân viên này khỏi danh sách không?`)) {
          deleteStaffFromLocal(id);
        }
      });
    });
  }

  // ==========================================================================
  // Xử lý Form và Thẩm định qua C# Backend
  // ==========================================================================

  // Điền dữ liệu vào các ô input
  function fillForm(data, autoValidate = true) {
    fields.forEach((f) => {
      const el = document.getElementById(f);
      if (el) el.value = data[f] || "";
    });
    updateAvatarPreview(data.Photo || "");

    if (autoValidate) {
      executeValidation(false, false); // tự động cập nhật bảng bên phải, không lưu
    } else {
      clearValidation();
    }
  }

  // Xóa các trạng thái cảnh báo
  function clearValidation() {
    fields.forEach((f) => {
      const group = document.getElementById(`field-group-${f}`);
      const err = document.getElementById(`error-${f}`);
      if (group) group.classList.remove("has-error", "is-valid");
      if (err) err.textContent = "";
    });

    statusBanner.style.display = "none";
    statusBanner.className = "status-banner";
    logIndicator.textContent = "Chờ kiểm tra";
    logIndicator.className = "details-status-tag";
  }

  // Gửi yêu cầu thẩm định đến C# Backend và lưu vào LocalStorage nếu là thao tác Lưu
  async function executeValidation(showBanner = true, isSaveAction = false) {
    const payload = {};
    fields.forEach((f) => {
      const el = document.getElementById(f);
      payload[f] = el ? el.value.trim() : "";
    });

    const submitBtn = document.getElementById("btn-submit");
    if (showBanner) {
      submitBtn.disabled = true;
      submitBtn.textContent = editingRecordId ? "Đang cập nhật..." : "Đang lưu...";
    }

    try {
      const res = await fetch("/api/staff/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Mã phản hồi từ máy chủ: ${res.status}`);
      }

      const result = await res.json();

      let savedRecordId = null;
      // Nếu người dùng bấm "Lưu thông tin" và dữ liệu hợp lệ -> Lưu vào LocalStorage
      if (isSaveAction && result.isValid) {
        const saveRes = saveStaffToLocal(payload);
        savedRecordId = saveRes.savedId;
        renderSavedStaffList(savedRecordId);

        // Tự động cuộn mượt xuống bảng danh sách bên dưới
        setTimeout(() => {
          const listSection = document.getElementById("staff-list-section");
          if (listSection) {
            listSection.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 200);
      }

      renderResponse(result, showBanner, isSaveAction, payload);
    } catch (err) {
      if (showBanner) {
        statusBanner.style.display = "flex";
        statusBanner.className = "status-banner is-danger";
        statusIcon.textContent = "✕";
        statusTitle.textContent = "Lỗi kết nối";
        statusDesc.textContent = `Không thể kết nối đến máy chủ: ${err.message}`;
      }
    } finally {
      if (showBanner) {
        submitBtn.disabled = false;
        submitBtn.textContent = editingRecordId ? "Cập nhật nhân viên" : "Lưu thông tin";
      }
    }
  }

  // Xử lý gửi form khi nhấn nút "Lưu thông tin" / "Cập nhật nhân viên"
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    executeValidation(true, true);
  });

  // Render kết quả phản hồi từ C# Backend
  function renderResponse(res, showBanner = true, isSaveAction = false, payload = null) {
    if (showBanner) {
      statusBanner.style.display = "flex";
      if (res.isValid) {
        statusBanner.className = "status-banner is-success";
        statusIcon.textContent = "✓";
        if (isSaveAction) {
          const staffIdentifier = payload?.StaffName
            ? `"${escapeHtml(payload.StaffName)}"`
            : `mã ${escapeHtml(payload?.StaffID || "")}`;
          statusTitle.textContent = "Lưu thông tin thành công!";
          statusDesc.innerHTML = `Nhân viên ${staffIdentifier} đã được kiểm tra hợp lệ và lưu vào danh sách local. <a href="#staff-list-section" style="font-weight: 600; text-decoration: underline; margin-left: 6px; color: inherit; cursor: pointer;">Xem danh sách bên dưới &darr;</a>`;
        } else {
          statusTitle.textContent = "Dữ liệu hợp lệ";
          statusDesc.textContent =
            res.message || "Tất cả dữ liệu nhân viên đã được kiểm tra hợp lệ.";
        }
      } else {
        statusBanner.className = "status-banner is-danger";
        statusIcon.textContent = "✕";
        statusTitle.textContent = isSaveAction ? "Không thể lưu thông tin" : "Thông tin chưa hợp lệ";
        statusDesc.textContent =
          res.message || "Vui lòng kiểm tra lại các trường được đánh dấu đỏ trước khi lưu.";
      }
    }

    // Cập nhật thẻ chỉ báo ở header cột phải
    if (res.isValid) {
      logIndicator.textContent = "Tất cả hợp lệ";
      logIndicator.className = "details-status-tag is-valid";
    } else {
      logIndicator.textContent = "Có lỗi định dạng";
      logIndicator.className = "details-status-tag is-invalid";
    }

    // Đánh dấu từng ô input trên form
    fields.forEach((f) => {
      const group = document.getElementById(`field-group-${f}`);
      const err = document.getElementById(`error-${f}`);
      const errorMsg = res.errors && res.errors[f];

      if (group) {
        if (errorMsg) {
          group.classList.remove("is-valid");
          group.classList.add("has-error");
          if (err) err.textContent = errorMsg;
        } else {
          group.classList.remove("has-error");
          group.classList.add("is-valid");
          if (err) err.textContent = "";
        }
      }
    });

    // Tự động đổ dữ liệu vào bảng chi tiết bên phải kèm nút bóc tách cú pháp Regex
    if (res.reflectionDetails && res.reflectionDetails.length > 0) {
      let html = "";
      res.reflectionDetails.forEach((item) => {
        const label = fieldLabels[item.propertyName] || item.propertyName;
        const statusTag = item.isValid
          ? '<span class="badge-tag-valid">Hợp lệ</span>'
          : `<span class="badge-tag-invalid" title="${escapeHtml(item.errorMessage)}">Không khớp</span>`;

        html += `
          <tr>
            <td><strong>${escapeHtml(label)}</strong></td>
            <td class="cell-value">${escapeHtml(item.rawValue || "(trống)")}</td>
            <td class="cell-status">${statusTag}</td>
            <td class="cell-regex">
              <div class="regex-cell-content">
                <code>${escapeHtml(item.regexPattern)}</code>
                <button type="button" class="btn-explain-regex" data-property="${escapeHtml(item.propertyName)}" title="Xem phân tích bóc tách cú pháp chi tiết">
                   Bóc tách cú pháp
                </button>
              </div>
            </td>
          </tr>
        `;
      });
      logTableBody.innerHTML = html;

      // Gắn sự kiện click mở modal phân tích cú pháp cho từng dòng
      logTableBody.querySelectorAll(".btn-explain-regex").forEach((btn) => {
        btn.addEventListener("click", () => {
          const prop = btn.getAttribute("data-property");
          openRegexModal(prop);
        });
      });
    }
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Sự kiện nút chức năng
  // Bấm "Mẫu hợp lệ": Tự động đổi luân phiên các nhân viên mẫu khác nhau (1024, 1025, 1026) để dễ thử nghiệm
  btnFillValid.addEventListener("click", () => {
    cancelEditing();
    const sample = validSamples[validSampleIndex % validSamples.length];
    validSampleIndex++;
    fillForm(sample, true);
  });

  btnFillInvalid.addEventListener("click", () => {
    cancelEditing();
    fillForm(invalidSample, true);
  });

  if (btnClearStaffList) {
    btnClearStaffList.addEventListener("click", clearAllSavedStaff);
  }

  btnReset.addEventListener("click", () => {
    form.reset();
    clearValidation();
    cancelEditing();
    updateAvatarPreview("");
    logTableBody.innerHTML = `
      <tr>
        <td colspan="4" class="empty-log">Biểu mẫu đã được xóa trắng.</td>
      </tr>
    `;
  });

  // Khởi tạo: Hiển thị danh sách nhân viên đã lưu từ LocalStorage
  renderSavedStaffList();

  // Mặc định nạp dữ liệu mẫu hợp lệ đầu tiên để kiểm tra bảng đối chiếu bên phải
  fillForm(validSamples[0], true);
});

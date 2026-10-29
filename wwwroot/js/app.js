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
    {
      StaffID: "1027",
      StaffName: "Trần Trọng Phúc",
      Email: "ttp@company.vn",
      PhoneNumber: "+84905123256",
      StartingDate: "2026-10-20",
      Photo: "avatar-nv1027.jpg",
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

    // Tự động đổ dữ liệu vào bảng chi tiết bên phải
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
            <td class="cell-regex"><code>${escapeHtml(item.regexPattern)}</code></td>
          </tr>
        `;
      });
      logTableBody.innerHTML = html;
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

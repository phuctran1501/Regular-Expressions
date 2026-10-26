// ==========================================================================
// JavaScript thuần xử lý biểu mẫu và hiển thị bảng đối chiếu tự động bên phải
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

  // Dữ liệu mẫu chuẩn hợp lệ
  const validSample = {
    StaffID: "1024",
    StaffName: "Nguyễn Văn An",
    Email: "nvan@company.vn",
    PhoneNumber: "+84912345678",
    StartingDate: "2026-10-01",
    Photo: "avatar-nv1024.jpg",
  };

  // Dữ liệu thử chứa lỗi để kiểm tra định dạng
  const invalidSample = {
    StaffID: "NV-ABC",
    StaffName: "1234@ Staff",
    Email: "email_sai",
    PhoneNumber: "0123456789",
    StartingDate: "31/12/2027",
    Photo: "tai-lieu.pdf",
  };

  // Cập nhật ảnh đại diện xem trước
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

  // Điền dữ liệu vào các ô input
  function fillForm(data, autoValidate = true) {
    fields.forEach((f) => {
      const el = document.getElementById(f);
      if (el) el.value = data[f] || "";
    });
    updateAvatarPreview(data.Photo || "");

    if (autoValidate) {
      executeValidation(false); // tự động cập nhật bảng bên phải
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

  // Gửi yêu cầu thẩm định đến C# Backend
  async function executeValidation(showBanner = true) {
    const payload = {};
    fields.forEach((f) => {
      const el = document.getElementById(f);
      payload[f] = el ? el.value.trim() : "";
    });

    const submitBtn = document.getElementById("btn-submit");
    if (showBanner) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Đang kiểm tra...";
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
      renderResponse(result, showBanner);
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
        submitBtn.textContent = "Lưu thông tin";
      }
    }
  }

  // Xử lý gửi form
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    executeValidation(true);
  });

  // Render kết quả phản hồi từ C# Backend
  function renderResponse(res, showBanner = true) {
    if (showBanner) {
      statusBanner.style.display = "flex";
      if (res.isValid) {
        statusBanner.className = "status-banner is-success";
        statusIcon.textContent = "✓";
        statusTitle.textContent = "Cập nhật thành công";
        statusDesc.textContent =
          res.message || "Tất cả dữ liệu nhân viên đã được kiểm tra hợp lệ.";
      } else {
        statusBanner.className = "status-banner is-danger";
        statusIcon.textContent = "✕";
        statusTitle.textContent = "Thông tin chưa hợp lệ";
        statusDesc.textContent =
          res.message || "Vui lòng kiểm tra lại các trường được đánh dấu đỏ.";
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
  btnFillValid.addEventListener("click", () => fillForm(validSample, true));
  btnFillInvalid.addEventListener("click", () => fillForm(invalidSample, true));
  btnReset.addEventListener("click", () => {
    form.reset();
    clearValidation();
    updateAvatarPreview("");
    logTableBody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-log">Biểu mẫu đã được xóa trắng.</td>
            </tr>
        `;
  });

  // Mặc định nạp dữ liệu mẫu hợp lệ và TỰ ĐỘNG hiển thị bảng chi tiết bên phải
  fillForm(validSample, true);
});

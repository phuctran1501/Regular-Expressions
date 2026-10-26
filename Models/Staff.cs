using System;
using StaffValidationApp.Attributes;

namespace StaffValidationApp.Models
{
    public class Staff
    {
        [StaffIdCheck(@"^[1-9]\d{0,6}$", "Mã nhân viên phải là số nguyên dương hợp lệ")]
        public string StaffID { get; set; } = string.Empty;

        [StaffNameCheck(@"^[\p{L}\s.']{2,60}$", "Họ và tên không hợp lệ (chỉ gồm chữ cái, từ 2 đến 60 ký tự)")]
        public string StaffName { get; set; } = string.Empty;

        [EmailCheck(@"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$", "Địa chỉ email không đúng định dạng")]
        public string Email { get; set; } = string.Empty;

        [PhoneCheck(@"^(?:\+?\d{1,4}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}$", "Số điện thoại không hợp lệ")]
        public string PhoneNumber { get; set; } = string.Empty;

        [StartingDateCheck(@"^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$", "Ngày bắt đầu làm việc phải đúng định dạng YYYY-MM-DD")]
        public string StartingDate { get; set; } = string.Empty;

        [PhotoCheck(@"^(?:https?:\/\/.+\/|[a-zA-Z0-9_\-\\\/]+)?[\w\-\.]+\.(?:jpg|jpeg|png|webp|gif|svg)$", "Tệp ảnh đại diện phải có đuôi .jpg, .jpeg, .png, .webp hoặc .svg")]
        public string Photo { get; set; } = string.Empty;
    }
}

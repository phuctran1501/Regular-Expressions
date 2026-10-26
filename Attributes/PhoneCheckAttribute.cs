using System;

namespace StaffValidationApp.Attributes
{
    // Căn cứ theo Exercise 2 - Session 5: Kiểm tra số điện thoại ở các dạng quốc tế và nội địa
    [AttributeUsage(AttributeTargets.Field | AttributeTargets.Property, AllowMultiple = true)]
    public class PhoneCheckAttribute : Attribute
    {
        public string RE { get; set; }
        public string ErrorMessage { get; set; }

        public PhoneCheckAttribute(
            string re = @"^(?:\+?\d{1,4}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}$", 
            string errorMessage = "Số điện thoại không hợp lệ (hỗ trợ mã quốc tế +84..., (024)..., 0912...)")
        {
            this.RE = re;
            this.ErrorMessage = errorMessage;
        }
    }
}

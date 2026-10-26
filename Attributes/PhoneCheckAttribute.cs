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
            string re = @"^(?:(?:\+84|0)(?:(?:3[2-9]|5[25689]|7[06-9]|8[1-9]|9\d)(?:[-.\s]?\d{3})[-.\s]?\d{4}|2\d{1,2}(?:[-.\s]?\d{3,4})[-.\s]?\d{4})|\((?:\+84|0)2\d{1,2}\)[-.\s]?\d{3,4}[-.\s]?\d{4})$", 
            string errorMessage = "Số điện thoại không hợp lệ theo chuẩn Việt Nam (hỗ trợ 10 số di động các mạng 03, 05, 07, 08, 09 hoặc +84 thay số 0; loại bỏ số ma)")
        {
            this.RE = re;
            this.ErrorMessage = errorMessage;
        }
    }
}

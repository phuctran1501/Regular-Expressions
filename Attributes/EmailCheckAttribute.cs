using System;

namespace StaffValidationApp.Attributes
{
    // Căn cứ theo Session 5 - slide 1 (Attributes)
    [AttributeUsage(AttributeTargets.Field | AttributeTargets.Property, AllowMultiple = true)]
    public class EmailCheckAttribute : Attribute
    {
        public string RE { get; set; }
        public string ErrorMessage { get; set; }

        public EmailCheckAttribute(string re, string errorMessage = "Địa chỉ email không đúng định dạng chuẩn")
        {
            this.RE = re;
            this.ErrorMessage = errorMessage;
        }
    }
}

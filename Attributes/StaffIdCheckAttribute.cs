using System;

namespace StaffValidationApp.Attributes
{
    [AttributeUsage(AttributeTargets.Field | AttributeTargets.Property, AllowMultiple = true)]
    public class StaffIdCheckAttribute : Attribute
    {
        public string RE { get; set; }
        public string ErrorMessage { get; set; }

        public StaffIdCheckAttribute(
            string re = @"^(?:NV)?[1-9]\d{0,7}$",
            string errorMessage = "Số định danh phải là số nguyên dương hợp lệ hoặc có tiền tố NV")
        {
            this.RE = re;
            this.ErrorMessage = errorMessage;
        }
    }
}

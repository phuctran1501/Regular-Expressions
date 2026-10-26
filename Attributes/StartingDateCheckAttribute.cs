using System;

namespace StaffValidationApp.Attributes
{
    [AttributeUsage(AttributeTargets.Field | AttributeTargets.Property, AllowMultiple = true)]
    public class StartingDateCheckAttribute : Attribute
    {
        public string RE { get; set; }
        public string ErrorMessage { get; set; }

        public StartingDateCheckAttribute(
            string re = @"^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$",
            string errorMessage = "Ngày bắt đầu làm việc phải đúng định dạng chuẩn YYYY-MM-DD")
        {
            this.RE = re;
            this.ErrorMessage = errorMessage;
        }
    }
}

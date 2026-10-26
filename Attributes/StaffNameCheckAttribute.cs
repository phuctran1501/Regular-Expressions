using System;

namespace StaffValidationApp.Attributes
{
    [AttributeUsage(AttributeTargets.Field | AttributeTargets.Property, AllowMultiple = true)]
    public class StaffNameCheckAttribute : Attribute
    {
        public string RE { get; set; }
        public string ErrorMessage { get; set; }

        public StaffNameCheckAttribute(
            string re = @"^[\p{L}\s.']{2,60}$",
            string errorMessage = "Họ và tên chỉ được chứa chữ cái, khoảng trắng và dài từ 2 đến 60 ký tự")
        {
            this.RE = re;
            this.ErrorMessage = errorMessage;
        }
    }
}

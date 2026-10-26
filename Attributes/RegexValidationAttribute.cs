using System;

namespace StaffValidationApp.Attributes
{
    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Field, AllowMultiple = true)]
    public class RegexValidationAttribute : Attribute
    {
        public string RE { get; set; }
        public string ErrorMessage { get; set; }
        public string Description { get; set; }

        public RegexValidationAttribute(string re, string errorMessage = "Dữ liệu không đúng định dạng", string description = "")
        {
            RE = re;
            ErrorMessage = errorMessage;
            Description = description;
        }
    }
}

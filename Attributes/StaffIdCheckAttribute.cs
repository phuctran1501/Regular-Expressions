using System;

namespace StaffValidationApp.Attributes
{
    [AttributeUsage(AttributeTargets.Field | AttributeTargets.Property, AllowMultiple = true)]
    public class StaffIdCheckAttribute : Attribute
    {
        public string RE { get; set; }
        public string ErrorMessage { get; set; }

        public StaffIdCheckAttribute(
            string re,
            string errorMessage)
        {
            this.RE = re;
            this.ErrorMessage = errorMessage;
        }
    }
}

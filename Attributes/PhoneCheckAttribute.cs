using System;

namespace StaffValidationApp.Attributes
{
    [AttributeUsage(AttributeTargets.Field | AttributeTargets.Property, AllowMultiple = true)]
    public class PhoneCheckAttribute : Attribute
    {
        public string RE { get; set; }
        public string ErrorMessage { get; set; }

        public PhoneCheckAttribute(
            string re, 
            string errorMessage)
        {
            this.RE = re;
            this.ErrorMessage = errorMessage;
        }
    }
}

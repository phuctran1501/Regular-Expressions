using System.Collections.Generic;

namespace StaffValidationApp.Models
{
    public class PropertyValidationDetail
    {
        public string PropertyName { get; set; } = string.Empty;
        public string AttributeType { get; set; } = string.Empty;
        public string RegexPattern { get; set; } = string.Empty;
        public string RawValue { get; set; } = string.Empty;
        public bool IsValid { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
    }

    public class ValidationResponse
    {
        public bool IsValid { get; set; }
        public string Message { get; set; } = string.Empty;
        public Dictionary<string, string> Errors { get; set; } = new();
        public List<PropertyValidationDetail> ReflectionDetails { get; set; } = new();
        public Staff? ValidatedData { get; set; }
    }
}

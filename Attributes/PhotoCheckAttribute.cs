using System;

namespace StaffValidationApp.Attributes
{
    [AttributeUsage(AttributeTargets.Field | AttributeTargets.Property, AllowMultiple = true)]
    public class PhotoCheckAttribute : Attribute
    {
        public string RE { get; set; }
        public string ErrorMessage { get; set; }

        public PhotoCheckAttribute(
            string re = @"^(?:https?:\/\/.+\/|[a-zA-Z0-9_\-\\\/]+)?[\w\-\.]+\.(?:jpg|jpeg|png|webp|gif|svg)$",
            string errorMessage = "Tên tệp hình ảnh hoặc URL không hợp lệ (phải có phần mở rộng .jpg, .jpeg, .png, .webp, .svg)")
        {
            this.RE = re;
            this.ErrorMessage = errorMessage;
        }
    }
}

using System;
using System.Collections.Generic;
using System.Reflection;
using System.Text.RegularExpressions;
using StaffValidationApp.Attributes;
using StaffValidationApp.Models;

namespace StaffValidationApp.Services
{
    public class StaffReflectionValidator
    {
        /// <summary>
        /// Phương thức CheckEmail theo đúng nguyên mẫu Session 5 - Slide 2 (Mục II. Reflection)
        /// </summary>
        public bool CheckEmail(Staff staff)
        {
            Type StaffType = staff.GetType();
            PropertyInfo? propertyInfo = StaffType.GetProperty("Email");
            if (propertyInfo != null)
            {
                EmailCheckAttribute? customAttribute =
                    propertyInfo.GetCustomAttribute<EmailCheckAttribute>();
                if (customAttribute != null)
                {
                    object? value = propertyInfo.GetValue(staff);
                    if (value == null) return false;
                    Regex validateEmailRegex = new Regex(customAttribute.RE);
                    return validateEmailRegex.IsMatch(value.ToString() ?? "");
                }
            }
            return true;
        }

        /// <summary>
        /// Phương thức CheckPhone kiểm tra số điện thoại (Exercise 2) sử dụng Reflection
        /// </summary>
        public bool CheckPhone(Staff staff)
        {
            Type StaffType = staff.GetType();
            PropertyInfo? propertyInfo = StaffType.GetProperty("PhoneNumber");
            if (propertyInfo != null)
            {
                PhoneCheckAttribute? customAttribute =
                    propertyInfo.GetCustomAttribute<PhoneCheckAttribute>();
                if (customAttribute != null)
                {
                    object? value = propertyInfo.GetValue(staff);
                    if (value == null) return false;
                    Regex validatePhoneRegex = new Regex(customAttribute.RE);
                    return validatePhoneRegex.IsMatch(value.ToString() ?? "");
                }
            }
            return true;
        }

        /// <summary>
        /// Bộ thẩm định toàn diện bằng Reflection duyệt qua tất cả các thuộc tính của đối tượng Staff
        /// Trích xuất Custom Attributes và dùng Regex kiểm tra tính hợp lệ của dữ liệu.
        /// </summary>
        public ValidationResponse ValidateStaff(Staff staff)
        {
            var response = new ValidationResponse
            {
                ValidatedData = staff,
                IsValid = true
            };

            Type staffType = staff.GetType();
            PropertyInfo[] properties = staffType.GetProperties(BindingFlags.Public | BindingFlags.Instance);

            foreach (var property in properties)
            {
                object? propValue = property.GetValue(staff);
                string stringValue = propValue?.ToString()?.Trim() ?? string.Empty;

                // Kiểm tra EmailCheckAttribute
                var emailAttr = property.GetCustomAttribute<EmailCheckAttribute>();
                if (emailAttr != null)
                {
                    bool match = !string.IsNullOrEmpty(stringValue) && Regex.IsMatch(stringValue, emailAttr.RE);
                    response.ReflectionDetails.Add(new PropertyValidationDetail
                    {
                        PropertyName = property.Name,
                        AttributeType = nameof(EmailCheckAttribute),
                        RegexPattern = emailAttr.RE,
                        RawValue = stringValue,
                        IsValid = match,
                        ErrorMessage = match ? "" : emailAttr.ErrorMessage
                    });

                    if (!match)
                    {
                        response.IsValid = false;
                        response.Errors[property.Name] = emailAttr.ErrorMessage;
                    }
                }

                // Kiểm tra PhoneCheckAttribute
                var phoneAttr = property.GetCustomAttribute<PhoneCheckAttribute>();
                if (phoneAttr != null)
                {
                    bool match = !string.IsNullOrEmpty(stringValue) && Regex.IsMatch(stringValue, phoneAttr.RE);
                    response.ReflectionDetails.Add(new PropertyValidationDetail
                    {
                        PropertyName = property.Name,
                        AttributeType = nameof(PhoneCheckAttribute),
                        RegexPattern = phoneAttr.RE,
                        RawValue = stringValue,
                        IsValid = match,
                        ErrorMessage = match ? "" : phoneAttr.ErrorMessage
                    });

                    if (!match)
                    {
                        response.IsValid = false;
                        response.Errors[property.Name] = phoneAttr.ErrorMessage;
                    }
                }

                // Kiểm tra StaffIdCheckAttribute
                var idAttr = property.GetCustomAttribute<StaffIdCheckAttribute>();
                if (idAttr != null)
                {
                    bool match = !string.IsNullOrEmpty(stringValue) && Regex.IsMatch(stringValue, idAttr.RE);
                    response.ReflectionDetails.Add(new PropertyValidationDetail
                    {
                        PropertyName = property.Name,
                        AttributeType = nameof(StaffIdCheckAttribute),
                        RegexPattern = idAttr.RE,
                        RawValue = stringValue,
                        IsValid = match,
                        ErrorMessage = match ? "" : idAttr.ErrorMessage
                    });

                    if (!match)
                    {
                        response.IsValid = false;
                        response.Errors[property.Name] = idAttr.ErrorMessage;
                    }
                }

                // Kiểm tra StaffNameCheckAttribute
                var nameAttr = property.GetCustomAttribute<StaffNameCheckAttribute>();
                if (nameAttr != null)
                {
                    bool match = !string.IsNullOrEmpty(stringValue) && Regex.IsMatch(stringValue, nameAttr.RE);
                    response.ReflectionDetails.Add(new PropertyValidationDetail
                    {
                        PropertyName = property.Name,
                        AttributeType = nameof(StaffNameCheckAttribute),
                        RegexPattern = nameAttr.RE,
                        RawValue = stringValue,
                        IsValid = match,
                        ErrorMessage = match ? "" : nameAttr.ErrorMessage
                    });

                    if (!match)
                    {
                        response.IsValid = false;
                        response.Errors[property.Name] = nameAttr.ErrorMessage;
                    }
                }

                // Kiểm tra StartingDateCheckAttribute
                var dateAttr = property.GetCustomAttribute<StartingDateCheckAttribute>();
                if (dateAttr != null)
                {
                    bool match = !string.IsNullOrEmpty(stringValue) && Regex.IsMatch(stringValue, dateAttr.RE);
                    response.ReflectionDetails.Add(new PropertyValidationDetail
                    {
                        PropertyName = property.Name,
                        AttributeType = nameof(StartingDateCheckAttribute),
                        RegexPattern = dateAttr.RE,
                        RawValue = stringValue,
                        IsValid = match,
                        ErrorMessage = match ? "" : dateAttr.ErrorMessage
                    });

                    if (!match)
                    {
                        response.IsValid = false;
                        response.Errors[property.Name] = dateAttr.ErrorMessage;
                    }
                }

                // Kiểm tra PhotoCheckAttribute
                var photoAttr = property.GetCustomAttribute<PhotoCheckAttribute>();
                if (photoAttr != null)
                {
                    bool match = !string.IsNullOrEmpty(stringValue) && Regex.IsMatch(stringValue, photoAttr.RE);
                    response.ReflectionDetails.Add(new PropertyValidationDetail
                    {
                        PropertyName = property.Name,
                        AttributeType = nameof(PhotoCheckAttribute),
                        RegexPattern = photoAttr.RE,
                        RawValue = stringValue,
                        IsValid = match,
                        ErrorMessage = match ? "" : photoAttr.ErrorMessage
                    });

                    if (!match)
                    {
                        response.IsValid = false;
                        response.Errors[property.Name] = photoAttr.ErrorMessage;
                    }
                }
            }

            response.Message = response.IsValid
                ? "Thông tin nhân viên đã được kiểm tra và cập nhật thành công!"
                : "Một hoặc nhiều thông tin chưa đúng quy cách, vui lòng kiểm tra lại.";

            return response;
        }
    }
}

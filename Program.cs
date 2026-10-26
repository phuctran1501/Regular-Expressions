using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using StaffValidationApp.Models;
using StaffValidationApp.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<StaffReflectionValidator>();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapPost("/api/staff/validate", (Staff staff, StaffReflectionValidator validator) =>
{
    var result = validator.ValidateStaff(staff);
    return Results.Ok(result);
});

app.MapPost("/api/staff/check-email", (Staff staff, StaffReflectionValidator validator) =>
{
    bool isValid = validator.CheckEmail(staff);
    return Results.Ok(new { IsValid = isValid, Email = staff.Email });
});

app.MapPost("/api/staff/check-phone", (Staff staff, StaffReflectionValidator validator) =>
{
    bool isValid = validator.CheckPhone(staff);
    return Results.Ok(new { IsValid = isValid, PhoneNumber = staff.PhoneNumber });
});

app.Run();

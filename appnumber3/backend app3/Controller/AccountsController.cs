using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend_app3.Data;
using backend_app3.DTOs;
using backend_app3.Templates;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;

namespace backend_app3.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // Resolves to /api/accounts
    public class AccountsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AccountsController(AppDbContext context)
        {
            _context = context;
        }
        [HttpGet("report/Carview")] // Resolves to /api/accounts/report/view
        public async Task<IActionResult> ViewFullAccountsReport()
        {
            try
            {
                QuestPDF.Settings.License = LicenseType.Community;

                var cars = await _context.Cars.ToListAsync();
                var parts = await _context.SpareParts.ToListAsync();

                var reportModel = new FullAccountsReportDto
                {
                    GeneratedDate = DateTime.UtcNow,
                    Summary = new AccountSummaryDto
                    {
                        VehicleSalesRevenue = cars.Where(c => c.IsSold).Sum(c => Convert.ToDecimal(c.Price)),
                        VehicleInventoryValuation = cars.Where(c => !c.IsSold).Sum(c => Convert.ToDecimal(c.Price)),
                        TotalVehiclesSold = cars.Count(c => c.IsSold),

                        PartsSalesRevenue = parts.Sum(p => p.Price * p.SoldQuantity),
                        PartsInventoryValuation = parts.Sum(p => p.Price * p.QuantityInStock),
                        TotalPartsSold = parts.Sum(p => p.SoldQuantity)
                    },
                    RecentTransactions = cars.Where(c => c.IsSold).Take(10).Select(c => new RecentTransactionDto
                    {
                        Date = DateTime.UtcNow,
                        Reference = $"CAR-{c.Id}",
                        Category = "Vehicle Sale",
                        Description = $"{c.Year} {c.Make} {c.Model}",
                        Amount = Convert.ToDecimal(c.Price)
                    }).ToList()
                };

                var document = new FullAccountsReportDocument(reportModel);
                byte[] pdfBytes = document.GeneratePdf();

                Response.Headers.Append("Content-Disposition", "inline; filename=full_accounts_report.pdf");
                return File(pdfBytes, "application/pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating full accounts report.", details = ex.Message });
            }
        }
    }
}
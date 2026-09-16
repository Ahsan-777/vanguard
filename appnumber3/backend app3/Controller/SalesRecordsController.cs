using backend_app3.Data;
using backend_app3.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace backend_app3.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SalesRecordsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SalesRecordsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/salesrecords
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SaleRecord>>> GetSalesRecords()
        {
            return await _context.SalesRecords
                .OrderByDescending(s => s.SaleDate)
                .ToListAsync();
        }

        // GET: api/salesrecords/report/pdf?itemType=Car&productName=Engine&startDate=2026-01-01&endDate=2026-09-30
        [HttpGet("report/pdf")]
        public async Task<IActionResult> DownloadSalesReportPdf(
            [FromQuery] string? productName, 
            [FromQuery] string? itemType,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate)
        {
            var query = _context.SalesRecords.AsQueryable();

            // 1. ItemType Filter (Car / SparePart)
            if (!string.IsNullOrWhiteSpace(itemType) && itemType != "All")
            {
                query = query.Where(s => s.ItemType != null && 
                                         s.ItemType.ToLower() == itemType.Trim().ToLower());
            }

            // 2. ProductName Filter
            if (!string.IsNullOrWhiteSpace(productName))
            {
                query = query.Where(s => s.ProductName != null && 
                                         s.ProductName.ToLower().Contains(productName.Trim().ToLower()));
            }

            // 3. From Date Filter
            if (startDate.HasValue)
            {
                var start = startDate.Value.Date;
                query = query.Where(s => s.SaleDate >= start);
            }

            // 4. To Date Filter
            if (endDate.HasValue)
            {
                var end = endDate.Value.Date.AddDays(1).AddTicks(-1);
                query = query.Where(s => s.SaleDate <= end);
            }

            var sales = await query
                .OrderByDescending(s => s.SaleDate)
                .ToListAsync();

            var totalRevenue = sales.Sum(s => s.TotalAmount);
            var totalOrders = sales.Count;

            // -----------------------------------------------------------------
            // 5-MONTH REVENUE & PROFIT PREDICTION ENGINE (Linear Regression)
            // -----------------------------------------------------------------
            var fiveMonthsAgo = DateTime.Now.AddMonths(-5);
            var monthlyHistory = await _context.SalesRecords
                .Where(s => s.SaleDate >= fiveMonthsAgo)
                .GroupBy(s => new { s.SaleDate.Year, s.SaleDate.Month })
                .Select(g => new
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    MonthlyRevenue = (double)g.Sum(s => s.TotalAmount)
                })
                .OrderBy(g => g.Year)
                .ThenBy(g => g.Month)
                .ToListAsync();

            double predictedNextMonthRevenue = 0;
            double monthlySlope = 0;
            bool isGrowthTrend = true;

            if (monthlyHistory.Count >= 2)
            {
                int n = monthlyHistory.Count;
                double sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

                for (int i = 0; i < n; i++)
                {
                    double x = i + 1; // Month index (1 to N)
                    double y = monthlyHistory[i].MonthlyRevenue;

                    sumX += x;
                    sumY += y;
                    sumXY += x * y;
                    sumXX += x * x;
                }

                // Slope (m) = (N*sumXY - sumX*sumY) / (N*sumXX - sumX^2)
                monthlySlope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
                
                // Intercept (c) = (sumY - m*sumX) / N
                double intercept = (sumY - monthlySlope * sumX) / n;

                // Predict Next Month Revenue: Y = m*(N + 1) + c
                predictedNextMonthRevenue = Math.Max(0, monthlySlope * (n + 1) + intercept);
                isGrowthTrend = monthlySlope >= 0;
            }
            else
            {
                // Fallback to average monthly revenue if historical data points are under 2
                predictedNextMonthRevenue = (double)(totalOrders > 0 ? totalRevenue / totalOrders : 0);
            }

            // Date Range Text for Sub-Header display
            string dateRangeLabel = "All Time";
            if (startDate.HasValue && endDate.HasValue)
            {
                dateRangeLabel = $"{startDate.Value:dd MMM yyyy} - {endDate.Value:dd MMM yyyy}";
            }
            else if (startDate.HasValue)
            {
                dateRangeLabel = $"From {startDate.Value:dd MMM yyyy}";
            }
            else if (endDate.HasValue)
            {
                dateRangeLabel = $"Up to {endDate.Value:dd MMM yyyy}";
            }

            var pdfBytes = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(36);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(9).FontFamily(Fonts.Arial));

                    // Header Banner
                    page.Header().Column(col =>
                    {
                        col.Item().Row(row =>
                        {
                            row.RelativeItem().Column(c =>
                            {
                                c.Item().Text("VANGUARD DRIVE").Bold().FontSize(20).FontColor(Colors.Amber.Darken3);
                                c.Item().Text("Sales History Ledger & Financial Audit").FontSize(10).FontColor(Colors.Grey.Darken2);
                                c.Item().Text($"Filter Range: {dateRangeLabel}").FontSize(8.5f).Bold().FontColor(Colors.Amber.Darken4);
                            });

                            row.ConstantItem(150).AlignRight().Column(c =>
                            {
                                c.Item().Text($"Generated: {DateTime.Now:dd MMM yyyy}").FontSize(9).FontColor(Colors.Grey.Darken1);
                                c.Item().Text($"Time: {DateTime.Now:HH:mm:ss}").FontSize(9).FontColor(Colors.Grey.Darken1);
                            });
                        });

                        col.Item().PaddingTop(8).LineHorizontal(1.5f).LineColor(Colors.Amber.Darken3);
                    });

                    // Main Content Area
                    page.Content().PaddingVertical(20).Column(col =>
                    {
                        // KPI Dashboard: Orders, Total Revenue, and Dynamic Expected Revenue/Loss Card
                        col.Item().PaddingBottom(12).Row(row =>
                        {
                            // Card 1: Total Orders
                            row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten2).Background(Colors.Grey.Lighten4).Padding(8).Column(c =>
                            {
                                c.Item().Text("TOTAL TRANSACTIONS").FontSize(8).Bold().FontColor(Colors.Grey.Darken2);
                                c.Item().Text($"{totalOrders} Orders").FontSize(11).Bold().FontColor(Colors.Grey.Darken4);
                            });

                            row.ConstantItem(8);

                            // Card 2: Total Revenue
                            row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten2).Background(Colors.Grey.Lighten4).Padding(8).Column(c =>
                            {
                                c.Item().Text("TOTAL REVENUE").FontSize(8).Bold().FontColor(Colors.Grey.Darken2);
                                c.Item().Text($"${totalRevenue:N0}").FontSize(11).Bold().FontColor(Colors.Green.Darken2);
                            });

                            row.ConstantItem(8);

                            // Card 3: 5-Month Growth vs Loss Revenue Prediction
                            var trendColor = isGrowthTrend ? Colors.Green.Darken2 : Colors.Red.Darken2;
                            var trendTitle = isGrowthTrend ? "PROJECTED GROWTH (NEXT MO)" : "PROJECTED LOSS / DECLINE";

                            row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten2).Background(Colors.Grey.Lighten4).Padding(8).Column(c =>
                            {
                                c.Item().Text(trendTitle).FontSize(7.5f).Bold().FontColor(trendColor);
                                c.Item().Text($"${predictedNextMonthRevenue:N0}").FontSize(11).Bold().FontColor(trendColor);
                                c.Item().Text($"{(monthlySlope >= 0 ? "+" : "")}${monthlySlope:N0}/mo trajectory").FontSize(7.5f).FontColor(Colors.Grey.Darken2);
                            });
                        });

                        // Main Sales Table
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(30);
                                columns.RelativeColumn(1.2f);
                                columns.RelativeColumn(2.5f);
                                columns.ConstantColumn(35);
                                columns.RelativeColumn(1.8f);
                                columns.RelativeColumn(2.0f);
                                columns.RelativeColumn(2.2f);
                            });

                            table.Header(header =>
                            {
                                header.Cell().Element(HeaderStyle).Text("ID");
                                header.Cell().Element(HeaderStyle).Text("Type");
                                header.Cell().Element(HeaderStyle).Text("Product");
                                header.Cell().Element(HeaderStyle).Text("Qty");
                                header.Cell().Element(HeaderStyle).Text("Amount");
                                header.Cell().Element(HeaderStyle).Text("Customer");
                                header.Cell().Element(HeaderStyle).Text("Sale Date");

                                static IContainer HeaderStyle(IContainer c) =>
                                    c.Background(Colors.Grey.Darken3)
                                     .PaddingVertical(6)
                                     .PaddingHorizontal(4)
                                     .DefaultTextStyle(x => x.Bold().FontColor(Colors.White).FontSize(8.5f));
                            });

                            for (int i = 0; i < sales.Count; i++)
                            {
                                var sale = sales[i];
                                var isEven = i % 2 == 0;

                                table.Cell().Element(c => CellStyle(c, isEven)).Text($"#{sale.Id}");
                                table.Cell().Element(c => CellStyle(c, isEven)).Text(sale.ItemType ?? "N/A");
                                table.Cell().Element(c => CellStyle(c, isEven)).Text(sale.ProductName ?? "N/A").Bold();
                                table.Cell().Element(c => CellStyle(c, isEven)).Text(sale.Quantity.ToString());
                                table.Cell().Element(c => CellStyle(c, isEven)).Text($"${sale.TotalAmount:N0}").Bold().FontColor(Colors.Green.Darken3);
                                table.Cell().Element(c => CellStyle(c, isEven)).Text(sale.CustomerName ?? "N/A");
                                table.Cell().Element(c => CellStyle(c, isEven)).Text(sale.SaleDate.ToString("yyyy-MM-dd HH:mm"));

                                static IContainer CellStyle(IContainer c, bool isEven) =>
                                    c.Background(isEven ? Colors.White : Colors.Grey.Lighten4)
                                     .BorderBottom(0.5f)
                                     .BorderColor(Colors.Grey.Lighten2)
                                     .PaddingVertical(5)
                                     .PaddingHorizontal(4)
                                     .DefaultTextStyle(x => x.FontSize(8.5f));
                            }
                        });
                    });

                    // Footer Section
                    page.Footer().Column(col =>
                    {
                        col.Item().LineHorizontal(0.5f).LineColor(Colors.Grey.Lighten2);
                        col.Item().PaddingTop(4).Row(row =>
                        {
                            row.RelativeItem().Text("Vanguard Drive Management System").FontSize(8).FontColor(Colors.Grey.Darken1);
                            row.RelativeItem().AlignRight().Text(x =>
                            {
                                x.Span("Page ").FontSize(8).FontColor(Colors.Grey.Darken1);
                                x.CurrentPageNumber().FontSize(8).Bold().FontColor(Colors.Grey.Darken2);
                                x.Span(" of ").FontSize(8).FontColor(Colors.Grey.Darken1);
                                x.TotalPages().FontSize(8).Bold().FontColor(Colors.Grey.Darken2);
                            });
                        });
                    });
                });
            }).GeneratePdf();

            Response.Headers.Append("Content-Disposition", "inline; filename=Sales_Report.pdf");
            return File(pdfBytes, "application/pdf");
        }
    }
}
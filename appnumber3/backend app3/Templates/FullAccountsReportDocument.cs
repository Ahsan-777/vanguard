using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using backend_app3.DTOs;

namespace backend_app3.Templates
{
    public class FullAccountsReportDocument : IDocument
    {
        public FullAccountsReportDto Model { get; }

        public FullAccountsReportDocument(FullAccountsReportDto model)
        {
            Model = model;
        }

        public void Compose(IDocumentContainer container)
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(25);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(9).FontFamily("Arial"));

                page.Header().Element(ComposeHeader);
                page.Content().Element(ComposeContent);
                page.Footer().Element(ComposeFooter);
            });
        }

        void ComposeHeader(IContainer container)
        {
            container.Row(row =>
            {
                row.RelativeItem().Column(column =>
                {
                    column.Item().Text("VANGUARD DRIVE").FontSize(22).Bold().FontColor(Colors.Orange.Medium);
                    column.Item().Text("Accountant's General Ledger & Financial Report").FontSize(10).FontColor(Colors.Grey.Medium);
                });

                row.ConstantItem(180).AlignRight().Column(column =>
                {
                    column.Item().Text("CONFIDENTIAL").FontSize(10).Bold().FontColor(Colors.Red.Medium);
                    column.Item().Text($"Date: {Model.GeneratedDate:yyyy-MM-dd HH:mm}").FontSize(9);
                });
            });
        }

        void ComposeContent(IContainer container)
        {
            container.PaddingVertical(15).Column(column =>
            {
                column.Spacing(15);

                // Top Level Financial KPI Cards
                column.Item().Row(row =>
                {
                    row.RelativeItem().Background(Colors.Grey.Lighten4).Padding(10).Column(c =>
                    {
                        c.Item().Text("Total Gross Revenue").FontSize(8).FontColor(Colors.Grey.Darken1);
                        c.Item().Text($"${Model.Summary.TotalGrossRevenue:N2}").FontSize(14).Bold().FontColor(Colors.Green.Darken2);
                    });

                    row.ConstantItem(10);

                    row.RelativeItem().Background(Colors.Grey.Lighten4).Padding(10).Column(c =>
                    {
                        c.Item().Text("Total Asset Valuation").FontSize(8).FontColor(Colors.Grey.Darken1);
                        c.Item().Text($"${Model.Summary.TotalAssetValuation:N2}").FontSize(14).Bold().FontColor(Colors.Blue.Darken2);
                    });

                    row.ConstantItem(10);

                    row.RelativeItem().Background(Colors.Grey.Lighten4).Padding(10).Column(c =>
                    {
                        c.Item().Text("Total Units Sold").FontSize(8).FontColor(Colors.Grey.Darken1);
                        c.Item().Text($"{Model.Summary.TotalVehiclesSold + Model.Summary.TotalPartsSold} Items").FontSize(14).Bold().FontColor(Colors.Orange.Darken2);
                    });
                });

                // Financial Breakdown Table
                column.Item().Text("Financial Breakdown").FontSize(12).Bold();

                column.Item().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(3);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(2);
                    });

                    table.Header(header =>
                    {
                        header.Cell().Background(Colors.Grey.Darken3).Padding(6).Text("Account Category").Bold().FontColor(Colors.White);
                        header.Cell().Background(Colors.Grey.Darken3).Padding(6).AlignRight().Text("Units Sold / In Stock").Bold().FontColor(Colors.White);
                        header.Cell().Background(Colors.Grey.Darken3).Padding(6).AlignRight().Text("Asset Valuation").Bold().FontColor(Colors.White);
                        header.Cell().Background(Colors.Grey.Darken3).Padding(6).AlignRight().Text("Total Revenue").Bold().FontColor(Colors.White);
                    });

                    // Vehicle Row
                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(6).Text("Vehicle Sales & Stock");
                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(6).AlignRight().Text($"{Model.Summary.TotalVehiclesSold} Sold");
                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(6).AlignRight().Text($"${Model.Summary.VehicleInventoryValuation:N2}");
                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(6).AlignRight().Text($"${Model.Summary.VehicleSalesRevenue:N2}");

                    // Spare Parts Row
                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(6).Text("Spare Parts Inventory & Sales");
                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(6).AlignRight().Text($"{Model.Summary.TotalPartsSold} Sold");
                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(6).AlignRight().Text($"${Model.Summary.PartsInventoryValuation:N2}");
                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(6).AlignRight().Text($"${Model.Summary.PartsSalesRevenue:N2}");
                });

                // Recent Transactions Audit Trail
                column.Item().PaddingTop(10).Text("Audit Trail / Recent Ledger Entries").FontSize(12).Bold();

                column.Item().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(2); // Date
                        columns.RelativeColumn(2); // Reference
                        columns.RelativeColumn(2); // Category
                        columns.RelativeColumn(4); // Description
                        columns.RelativeColumn(2); // Amount
                    });

                    table.Header(header =>
                    {
                        header.Cell().Background(Colors.Grey.Darken3).Padding(5).Text("Date").Bold().FontColor(Colors.White);
                        header.Cell().Background(Colors.Grey.Darken3).Padding(5).Text("Ref #").Bold().FontColor(Colors.White);
                        header.Cell().Background(Colors.Grey.Darken3).Padding(5).Text("Category").Bold().FontColor(Colors.White);
                        header.Cell().Background(Colors.Grey.Darken3).Padding(5).Text("Description").Bold().FontColor(Colors.White);
                        header.Cell().Background(Colors.Grey.Darken3).Padding(5).AlignRight().Text("Amount").Bold().FontColor(Colors.White);
                    });

                    foreach (var tx in Model.RecentTransactions)
                    {
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text($"{tx.Date:yyyy-MM-dd}");
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(tx.Reference);
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(tx.Category);
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(tx.Description);
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).AlignRight().Text($"${tx.Amount:N2}");
                    }
                });
            });
        }

        void ComposeFooter(IContainer container)
        {
            container.Row(row =>
            {
                row.RelativeItem().Text("Prepared by System Accountant Module - Vanguard Drive").FontSize(8).Italic().FontColor(Colors.Grey.Medium);
                row.RelativeItem().AlignRight().Text(x =>
                {
                    x.CurrentPageNumber();
                    x.Span(" / ");
                    x.TotalPages();
                });
            });
        }
    }
}
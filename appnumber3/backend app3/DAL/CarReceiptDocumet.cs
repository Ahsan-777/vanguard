using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using backend_app3.DTOs;

namespace backend_app3.Templates
{
   

    public class CarReceiptDocument : IDocument
    {
        public CarReceiptDto Model { get; }

        public CarReceiptDocument(CarReceiptDto model)
        {
            Model = model;
        }

        public void Compose(IDocumentContainer container)
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A5);
                page.Margin(20);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(10).FontFamily("Arial"));

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
            column.Item().Text("VANGUARD DRIVE")
                .FontSize(18)
                .Bold()
                .FontColor(Colors.Orange.Medium);

            column.Item().Text("Official Vehicle Sale Invoice")
                .FontSize(9)
                .FontColor(Colors.Grey.Medium);
        });

        row.ConstantItem(120).Column(column =>
        {
            column.Item().Text($"Receipt #: {Model.ReceiptId}").Bold();
            column.Item().Text($"Date: {Model.SaleDate:yyyy-MM-dd}");
        });
    });
}

        void ComposeContent(IContainer container)
        {
            container.PaddingVertical(10).Column(column =>
            {
                column.Spacing(10);

                // Customer Details Box
                column.Item().Background(Colors.Grey.Lighten4).Padding(10).Column(c =>
                {
                    c.Item().Text("Customer Details").Bold().FontSize(11);
                    c.Item().Text($"Name: {Model.CustomerName}");
                    c.Item().Text($"Phone: {Model.CustomerPhone}");
                });

                // Vehicle Details Table
                column.Item().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(3);
                        columns.RelativeColumn(1);
                        columns.RelativeColumn(2);
                    });

                    table.Header(header =>
                    {
                        header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Vehicle Description").Bold();
                        header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Year").Bold();
                        header.Cell().Background(Colors.Grey.Lighten2).Padding(5).AlignRight().Text("Price").Bold();
                    });

                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(Model.VehicleName);
                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(Model.Year.ToString());
                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).AlignRight().Text($"${Model.Price:N2}");
                });

                // Total Summary
                column.Item().AlignRight().Text($"Total Paid: ${Model.Price:N2}").FontSize(12).Bold().FontColor(Colors.Black);
            });
        }

        void ComposeFooter(IContainer container)
        {
            container.AlignCenter().Text("Thank you for choosing Vanguard Drive! Safe travels.").FontSize(9).Italic();
        }
    }
}
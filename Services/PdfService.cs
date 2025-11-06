using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using iText.Layout.Properties;
using iText.Kernel.Font;
using iText.IO.Font.Constants;
using iText.Kernel.Colors;
using iText.Layout.Borders;
using WhatsAppChatbotSystem.Models;

namespace WhatsAppChatbotSystem.Services;

public class PdfService
{
    private readonly ILogger<PdfService> _logger;
    private readonly string _pdfOutputPath;

    public PdfService(ILogger<PdfService> logger, IWebHostEnvironment environment)
    {
        _logger = logger;
        _pdfOutputPath = Path.Combine(environment.WebRootPath, "pdfs");
        
        if (!Directory.Exists(_pdfOutputPath))
        {
            Directory.CreateDirectory(_pdfOutputPath);
        }
    }

    public async Task<string> GenerarPdfHistoriaClinica(HistoriaClinicaCompleta historia)
    {    return await Task.Run(() =>
    {
        try
        {
                var fileName = $"HistoriaClinica_{historia.NoHistoria}_{DateTime.Now:yyyyMMddHHmmss}.pdf";
                var filePath = Path.Combine(_pdfOutputPath, fileName);

                using (var writer = new PdfWriter(filePath))
                {
                    using (var pdf = new PdfDocument(writer))
                    {
                        var document = new Document(pdf);
                        
                        // Fuentes
                        var normalFont = PdfFontFactory.CreateFont(StandardFonts.HELVETICA);
                        var boldFont = PdfFontFactory.CreateFont(StandardFonts.HELVETICA_BOLD);

                        // ENCABEZADO
                        var header = new Paragraph("HISTORIA CLINICA DE CONSULTA EXTERNA")
                            .SetFont(boldFont)
                            .SetFontSize(16)
                            .SetTextAlignment(TextAlignment.CENTER)
                            .SetMarginBottom(5);
                        document.Add(header);

                        var subheader = new Paragraph("Fundacion Campbell  Nit: 900.002.780 0")
                            .SetFont(normalFont)
                            .SetFontSize(10)
                            .SetTextAlignment(TextAlignment.CENTER)
                            .SetMarginBottom(10);
                        document.Add(subheader);

                        // Caso y Admisión
                        var caseInfo = new Paragraph()
                            .Add(new Text($"Caso: {historia.NoCaso}\n").SetFont(boldFont).SetFontSize(12))
                            .Add(new Text($"NO. ADMISION: {historia.NoAdmision}\n").SetFontSize(10))
                            .SetTextAlignment(TextAlignment.RIGHT)
                            .SetMarginBottom(10);
                        document.Add(caseInfo);

                        // TABLA DE DATOS DEL PACIENTE
                        var tablaPaciente = new Table(new float[] { 2, 1, 1, 2 });
                        tablaPaciente.SetWidth(UnitValue.CreatePercentValue(100));

                        // Fila 1
                        tablaPaciente.AddCell(CreateCell($"No. de Caso:\n{historia.NoCaso}", boldFont));
                        tablaPaciente.AddCell(CreateCell($"Nombre del Paciente:\n{historia.NombrePaciente}", boldFont));
                        tablaPaciente.AddCell(CreateCell($"Edad:\n{historia.Edad} AÑOS", boldFont));
                        tablaPaciente.AddCell(CreateCell($"Sexo:\n{historia.Sexo}", boldFont));

                        // Fila 2
                        tablaPaciente.AddCell(CreateCell($"Identificación:\n{historia.NoIdentificacion}", normalFont));
                        tablaPaciente.AddCell(CreateCell($"Dirección:\n{historia.Direccion}", normalFont));
                        tablaPaciente.AddCell(CreateCell($"Ciudad:\n{historia.Ciudad}", normalFont, 2));

                        // Fila 3
                        tablaPaciente.AddCell(CreateCell($"Teléfono:\n{historia.Telefono}", normalFont));
                        tablaPaciente.AddCell(CreateCell($"Ocupación:\n{historia.Ocupacion}", normalFont));
                        tablaPaciente.AddCell(CreateCell($"Estado Civil:\n{historia.EstadoCivil}", normalFont, 2));

                        // Fila 4
                        tablaPaciente.AddCell(CreateCell($"Fec. Nacim.:\n{historia.FechaNacimiento:dd/MM/yyyy}", normalFont));
                        tablaPaciente.AddCell(CreateCell($"Fecha Ing.:\n{historia.FechaIngreso:dd/MM/yyyy}", normalFont));
                        tablaPaciente.AddCell(CreateCell($"Hora Ing.:\n{historia.HoraIngreso}", normalFont, 2));

                        // Acompañante
                        tablaPaciente.AddCell(CreateCell($"Nombre del Acompañante:\n{historia.NombreAcompanante}", normalFont, 3));
                        tablaPaciente.AddCell(CreateCell($"Parentesco:\n{historia.Parentesco}", normalFont));

                        document.Add(tablaPaciente);
                        document.Add(new Paragraph("\n").SetFontSize(5));

                        // MOTIVO DE CONSULTA
                        document.Add(CreateSection("MOTIVO DE CONSULTA", historia.MotivoConsulta, boldFont, normalFont));

                        // ENFERMEDAD ACTUAL
                        document.Add(CreateSection("ENFERMEDAD ACTUAL", historia.EnfermedadActual, boldFont, normalFont));

                        // ANTECEDENTES
                        if (historia.Antecedentes.Any())
                        {
                            document.Add(CreateSectionHeader("ANTECEDENTES", boldFont));
                            var antecedentesText = string.Join("\n", historia.Antecedentes.Select(a => $"{a.Key}: {a.Value}"));
                            document.Add(CreateSectionContent(antecedentesText, normalFont));
                        }

                        // EXAMEN FÍSICO
                        document.Add(CreateSectionHeader("EXAMEN FISICO", boldFont));
                        var examenTexto = $@"FC: {historia.ExamenFisico.FC}  FR: {historia.ExamenFisico.FR}  T/A: {historia.ExamenFisico.TA}  
                        TEMP: {historia.ExamenFisico.Temperatura}  
                        PESO: {historia.ExamenFisico.Peso} Kg.  
                        TALLA: {historia.ExamenFisico.Talla}
                        GLASGOW: {historia.ExamenFisico.Glasgow}
                        VALOR: {historia.ExamenFisico.Valor}

                        ASPECTO GENERAL DEL PACIENTE: {historia.ExamenFisico.AspectoGeneral}
                        CABEZA, CARA, ORGANOS SENTIDOS: {historia.ExamenFisico.CabezaCara}
                        CUELLO: {historia.ExamenFisico.Cuello}
                        TORAX: {historia.ExamenFisico.Torax}
                        ABDOMEN: {historia.ExamenFisico.Abdomen}
                        GENITOURINARIO: {historia.ExamenFisico.Genitourinario}
                        PELVIS: {historia.ExamenFisico.Pelvis}
                        DORSO Y EXTREMIDADES: {historia.ExamenFisico.DorsoExtremidades}
                        S.N.C.: {historia.ExamenFisico.SNC}";
                        document.Add(CreateSectionContent(examenTexto, normalFont));

                        // DIAGNOSTICOS
                        if (historia.Diagnosticos.Any())
                        {
                            document.Add(CreateSectionHeader("DIAGNOSTICOS", boldFont));
                            var diagnosticosText = string.Join("\n", historia.Diagnosticos.Select((d, i) => $"{i + 1}. {d}"));
                            document.Add(CreateSectionContent(diagnosticosText, normalFont));
                        }

                        // EVOLUCIÓN
                        if (!string.IsNullOrEmpty(historia.Evolucion))
                        {
                            document.Add(CreateSection("EVOLUCIÓN", historia.Evolucion, boldFont, normalFont));
                        }

                        // PLAN/CONDUCTA
                        if (historia.Plan.Any())
                        {
                            document.Add(CreateSectionHeader("CONDUCTA / PLAN", boldFont));
                            var planText = string.Join("\n", historia.Plan.Select((p, i) => $"{i + 1}. {p}"));
                            document.Add(CreateSectionContent(planText, normalFont));
                        }

                        // FIRMA DEL MÉDICO
                        document.Add(new Paragraph("\n\n\n"));
                        var lineaFirma = new Paragraph("_".PadRight(50, '_'))
                            .SetTextAlignment(TextAlignment.CENTER)
                            .SetMarginTop(30);
                        document.Add(lineaFirma);

                        var firmaInfo = new Paragraph()
                            .Add(new Text($"{historia.MedicoNombre}\n").SetFont(boldFont))
                            .Add(new Text($"Reg.M. {historia.MedicoRegistro} Esp. {historia.MedicoEspecialidad}").SetFont(normalFont))
                            .SetTextAlignment(TextAlignment.CENTER)
                            .SetFontSize(10);
                        document.Add(firmaInfo);
                    }
                }

                _logger.LogInformation($"✅ PDF generado: {filePath}");
                return filePath;
            }
            catch (Exception ex)
            {
                _logger.LogError($"❌ Error generando PDF: {ex.Message}");
                throw;
            }
      });
    }

    private Cell CreateCell(string content, PdfFont font, int colspan = 1)
    {
        var cell = new Cell(1, colspan)
            .Add(new Paragraph(content).SetFont(font).SetFontSize(9))
            .SetBorder(new SolidBorder(1))
            .SetPadding(5);
        return cell;
    }

    private Div CreateSection(string title, string content, PdfFont titleFont, PdfFont contentFont)
    {
        var section = new Div();
        section.Add(CreateSectionHeader(title, titleFont));
        section.Add(CreateSectionContent(content, contentFont));
        return section;
    }

    private Paragraph CreateSectionHeader(string title, PdfFont font)
    {
        return new Paragraph(title)
            .SetFont(font)
            .SetFontSize(11)
            .SetBackgroundColor(ColorConstants.LIGHT_GRAY)
            .SetPadding(5)
            .SetMarginTop(10)
            .SetMarginBottom(5);
    }

    private Paragraph CreateSectionContent(string content, PdfFont font)
    {
        return new Paragraph(content)
            .SetFont(font)
            .SetFontSize(10)
            .SetBorder(new SolidBorder(1))
            .SetPadding(5)
            .SetMarginBottom(5);
    }
}

package com.medvault.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.medvault.entity.Medicine;
import com.medvault.entity.Prescription;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;

@Service
public class PdfGeneratorService {

    public ByteArrayInputStream generatePrescriptionPdf(Prescription prescription) {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Font Colors
            Color primaryColor = Color.decode("#2563EB");
            Color secondaryColor = Color.decode("#0F172A");
            Color grayColor = Color.decode("#64748B");
            Color tableBg = Color.decode("#F8FAFC");

            // Fonts
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24, primaryColor);
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 10, grayColor);
            Font sectionHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, secondaryColor);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, secondaryColor);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 11, Color.decode("#334155"));

            // Header Section
            Paragraph mainTitle = new Paragraph("MEDVAULT HEALTHCARE", titleFont);
            mainTitle.setAlignment(Element.ALIGN_CENTER);
            document.add(mainTitle);

            Paragraph subtitle = new Paragraph("Digital Health Record Management\nEmail: support@medvault.com | Web: www.medvault.com", subtitleFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(20);
            document.add(subtitle);

            // Horizontal Line
            Paragraph line = new Paragraph("__________________________________________________________________________________", subtitleFont);
            line.setSpacingAfter(20);
            document.add(line);

            // Info Grid (2 Columns)
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingAfter(20);

            // Doctor Info Cell
            PdfPCell doctorCell = new PdfPCell();
            doctorCell.setBorder(Rectangle.NO_BORDER);
            doctorCell.addElement(new Paragraph("DOCTOR DETAILS", sectionHeaderFont));
            doctorCell.addElement(new Paragraph("Dr. " + prescription.getDoctor().getUser().getName(), boldFont));
            doctorCell.addElement(new Paragraph("Specialization: " + prescription.getDoctor().getSpecialization(), normalFont));
            doctorCell.addElement(new Paragraph("Department: " + prescription.getDoctor().getDepartment(), normalFont));
            doctorCell.addElement(new Paragraph("License No: " + prescription.getDoctor().getLicenseNumber(), normalFont));
            infoTable.addCell(doctorCell);

            // Patient Info Cell
            PdfPCell patientCell = new PdfPCell();
            patientCell.setBorder(Rectangle.NO_BORDER);
            patientCell.addElement(new Paragraph("PATIENT DETAILS", sectionHeaderFont));
            patientCell.addElement(new Paragraph(prescription.getPatient().getUser().getName(), boldFont));
            patientCell.addElement(new Paragraph("DOB: " + (prescription.getPatient().getDateOfBirth() != null ? prescription.getPatient().getDateOfBirth().toString() : "N/A"), normalFont));
            patientCell.addElement(new Paragraph("Gender: " + prescription.getPatient().getGender() + " | Blood: " + prescription.getPatient().getBloodGroup(), normalFont));
            patientCell.addElement(new Paragraph("Date Prescribed: " + prescription.getDatePrescribed().toString(), normalFont));
            infoTable.addCell(patientCell);

            document.add(infoTable);

            // Medicine Header
            Paragraph medHeader = new Paragraph("PRESCRIBED MEDICINES", sectionHeaderFont);
            medHeader.setSpacingAfter(10);
            document.add(medHeader);

            // Medicines Table
            PdfPTable medTable = new PdfPTable(5);
            medTable.setWidthPercentage(100);
            medTable.setWidths(new float[]{2.5f, 1f, 1.5f, 1f, 2f});
            medTable.setSpacingAfter(20);

            // Table Headers
            String[] headers = {"Medicine Name", "Dosage", "Frequency", "Duration", "Instructions"};
            for (String header : headers) {
                PdfPCell hCell = new PdfPCell(new Phrase(header, boldFont));
                hCell.setBackgroundColor(tableBg);
                hCell.setPadding(8);
                medTable.addCell(hCell);
            }

            // Table Data
            for (Medicine med : prescription.getMedicines()) {
                PdfPCell nameCell = new PdfPCell(new Phrase(med.getName(), normalFont));
                nameCell.setPadding(8);
                medTable.addCell(nameCell);

                PdfPCell dosageCell = new PdfPCell(new Phrase(med.getDosage(), normalFont));
                dosageCell.setPadding(8);
                medTable.addCell(dosageCell);

                PdfPCell freqCell = new PdfPCell(new Phrase(med.getFrequency(), normalFont));
                freqCell.setPadding(8);
                medTable.addCell(freqCell);

                PdfPCell durCell = new PdfPCell(new Phrase(med.getDuration(), normalFont));
                durCell.setPadding(8);
                medTable.addCell(durCell);

                PdfPCell instCell = new PdfPCell(new Phrase(med.getInstructions() != null ? med.getInstructions() : "None", normalFont));
                instCell.setPadding(8);
                medTable.addCell(instCell);
            }

            document.add(medTable);

            // Notes Section
            if (prescription.getNotes() != null && !prescription.getNotes().trim().isEmpty()) {
                Paragraph notesHeader = new Paragraph("CLINICAL NOTES / RECOVERY PLAN", sectionHeaderFont);
                notesHeader.setSpacingAfter(5);
                document.add(notesHeader);

                Paragraph notesText = new Paragraph(prescription.getNotes(), normalFont);
                notesText.setSpacingAfter(30);
                document.add(notesText);
            }

            // Footer
            Paragraph footer = new Paragraph("This is an electronically generated medical prescription.\nCreated securely on MedVault Portal.", subtitleFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();

        } catch (DocumentException ex) {
            ex.printStackTrace();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }
}

package edu.washu.tag.hl7.v2.model;

import ca.uhn.hl7v2.model.DataTypeException;
import ca.uhn.hl7v2.model.v281.datatype.CWE;

public class CodedValue {

    private String identifier;
    private String text;
    private String nameOfCodingSystem;
    private String alternateIdentifier;
    private String alternateText;
    private String nameOfAlternateCodingSystem;
    private String codingSystemVersionId;
    private String alternateCodingSystemVersionId;
    private String originalText;
    private String secondAlternateIdentifier;
    private String secondAlternateText;
    private String nameOfSecondAlternateCodingSystem;
    private String secondAlternateCodingSystemVersionId;
    private String codingSystemOid;
    private String valueSetOid;
    private String valueSetVersionId;
    private String alternateCodingSystemOid;
    private String alternateValueSetOid;
    private String alternateValueSetVersionId;
    private String secondAlternateCodingSystemOid;
    private String secondAlternateValueSetOid;
    private String secondAlternateValueSetVersionId;

    public String getIdentifier() {
        return identifier;
    }

    public CodedValue setIdentifier(String identifier) {
        this.identifier = identifier;
        return this;
    }

    public String getText() {
        return text;
    }

    public CodedValue setText(String text) {
        this.text = text;
        return this;
    }

    public String getNameOfCodingSystem() {
        return nameOfCodingSystem;
    }

    public CodedValue setNameOfCodingSystem(String nameOfCodingSystem) {
        this.nameOfCodingSystem = nameOfCodingSystem;
        return this;
    }

    public String getAlternateIdentifier() {
        return alternateIdentifier;
    }

    public CodedValue setAlternateIdentifier(String alternateIdentifier) {
        this.alternateIdentifier = alternateIdentifier;
        return this;
    }

    public String getAlternateText() {
        return alternateText;
    }

    public CodedValue setAlternateText(String alternateText) {
        this.alternateText = alternateText;
        return this;
    }

    public String getNameOfAlternateCodingSystem() {
        return nameOfAlternateCodingSystem;
    }

    public CodedValue setNameOfAlternateCodingSystem(String nameOfAlternateCodingSystem) {
        this.nameOfAlternateCodingSystem = nameOfAlternateCodingSystem;
        return this;
    }

    public String getCodingSystemVersionId() {
        return codingSystemVersionId;
    }

    public CodedValue setCodingSystemVersionId(String codingSystemVersionId) {
        this.codingSystemVersionId = codingSystemVersionId;
        return this;
    }

    public String getAlternateCodingSystemVersionId() {
        return alternateCodingSystemVersionId;
    }

    public CodedValue setAlternateCodingSystemVersionId(String alternateCodingSystemVersionId) {
        this.alternateCodingSystemVersionId = alternateCodingSystemVersionId;
        return this;
    }

    public String getOriginalText() {
        return originalText;
    }

    public CodedValue setOriginalText(String originalText) {
        this.originalText = originalText;
        return this;
    }

    public String getSecondAlternateIdentifier() {
        return secondAlternateIdentifier;
    }

    public CodedValue setSecondAlternateIdentifier(String secondAlternateIdentifier) {
        this.secondAlternateIdentifier = secondAlternateIdentifier;
        return this;
    }

    public String getSecondAlternateText() {
        return secondAlternateText;
    }

    public CodedValue setSecondAlternateText(String secondAlternateText) {
        this.secondAlternateText = secondAlternateText;
        return this;
    }

    public String getNameOfSecondAlternateCodingSystem() {
        return nameOfSecondAlternateCodingSystem;
    }

    public CodedValue setNameOfSecondAlternateCodingSystem(
        String nameOfSecondAlternateCodingSystem) {
        this.nameOfSecondAlternateCodingSystem = nameOfSecondAlternateCodingSystem;
        return this;
    }

    public String getSecondAlternateCodingSystemVersionId() {
        return secondAlternateCodingSystemVersionId;
    }

    public CodedValue setSecondAlternateCodingSystemVersion(
        String secondAlternateCodingSystemVersionId) {
        this.secondAlternateCodingSystemVersionId = secondAlternateCodingSystemVersionId;
        return this;
    }

    public String getCodingSystemOid() {
        return codingSystemOid;
    }

    public CodedValue setCodingSystemOid(String codingSystemOid) {
        this.codingSystemOid = codingSystemOid;
        return this;
    }

    public String getValueSetOid() {
        return valueSetOid;
    }

    public CodedValue setValueSetOid(String valueSetOid) {
        this.valueSetOid = valueSetOid;
        return this;
    }

    public String getValueSetVersionId() {
        return valueSetVersionId;
    }

    public CodedValue setValueSetVersionId(String valueSetVersionId) {
        this.valueSetVersionId = valueSetVersionId;
        return this;
    }

    public String getAlternateCodingSystemOid() {
        return alternateCodingSystemOid;
    }

    public CodedValue setAlternateCodingSystemOid(String alternateCodingSystemOid) {
        this.alternateCodingSystemOid = alternateCodingSystemOid;
        return this;
    }

    public String getAlternateValueSetOid() {
        return alternateValueSetOid;
    }

    public CodedValue setAlternateValueSetOid(String alternateValueSetOid) {
        this.alternateValueSetOid = alternateValueSetOid;
        return this;
    }

    public String getAlternateValueSetVersionId() {
        return alternateValueSetVersionId;
    }

    public CodedValue setAlternateValueSetVersionId(String alternateValueSetVersionId) {
        this.alternateValueSetVersionId = alternateValueSetVersionId;
        return this;
    }

    public String getSecondAlternateCodingSystemOid() {
        return secondAlternateCodingSystemOid;
    }

    public CodedValue setSecondAlternateCodingSystemOid(
        String secondAlternateCodingSystemOid) {
        this.secondAlternateCodingSystemOid = secondAlternateCodingSystemOid;
        return this;
    }

    public String getSecondAlternateValueSetOid() {
        return secondAlternateValueSetOid;
    }

    public CodedValue setSecondAlternateValueSetOid(String secondAlternateValueSetOid) {
        this.secondAlternateValueSetOid = secondAlternateValueSetOid;
        return this;
    }

    public String getSecondAlternateValueSetVersionId() {
        return secondAlternateValueSetVersionId;
    }

    public CodedValue setSecondAlternateValueSetVersionId(
        String secondAlternateValueSetVersionId) {
        this.secondAlternateValueSetVersionId = secondAlternateValueSetVersionId;
        return this;
    }

    public CWE toCwe(CWE emptyDataStore) throws DataTypeException {
        emptyDataStore.getCwe1_Identifier().setValue(identifier);
        emptyDataStore.getCwe2_Text().setValue(text);
        emptyDataStore.getCwe3_NameOfCodingSystem().setValue(nameOfCodingSystem);
        emptyDataStore.getCwe4_AlternateIdentifier().setValue(alternateIdentifier);
        emptyDataStore.getCwe5_AlternateText().setValue(alternateText);
        emptyDataStore.getCwe6_NameOfAlternateCodingSystem().setValue(nameOfAlternateCodingSystem);
        emptyDataStore.getCwe7_CodingSystemVersionID().setValue(codingSystemVersionId);
        emptyDataStore.getCwe8_AlternateCodingSystemVersionID().setValue(alternateCodingSystemVersionId);
        emptyDataStore.getCwe9_OriginalText().setValue(originalText);
        emptyDataStore.getCwe10_SecondAlternateIdentifier().setValue(secondAlternateIdentifier);
        emptyDataStore.getCwe11_SecondAlternateText().setValue(secondAlternateText);
        emptyDataStore.getCwe12_NameOfSecondAlternateCodingSystem().setValue(nameOfSecondAlternateCodingSystem);
        emptyDataStore.getCwe13_SecondAlternateCodingSystemVersionID().setValue(secondAlternateCodingSystemVersionId);
        emptyDataStore.getCwe14_CodingSystemOID().setValue(codingSystemOid);
        emptyDataStore.getCwe15_ValueSetOID().setValue(valueSetOid);
        emptyDataStore.getCwe16_ValueSetVersionID().setValue(valueSetVersionId);
        emptyDataStore.getCwe17_AlternateCodingSystemOID().setValue(alternateCodingSystemOid);
        emptyDataStore.getCwe18_AlternateValueSetOID().setValue(alternateValueSetOid);
        emptyDataStore.getCwe19_AlternateValueSetVersionID().setValue(alternateValueSetVersionId);
        emptyDataStore.getCwe20_SecondAlternateCodingSystemOID().setValue(secondAlternateCodingSystemOid);
        emptyDataStore.getCwe21_SecondAlternateValueSetOID().setValue(secondAlternateValueSetOid);
        emptyDataStore.getCwe22_SecondAlternateValueSetVersionID().setValue(secondAlternateValueSetVersionId);
        return emptyDataStore;
    }

}

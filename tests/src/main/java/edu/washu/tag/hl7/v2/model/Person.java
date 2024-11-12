package edu.washu.tag.hl7.v2.model;

import ca.uhn.hl7v2.model.DataTypeException;
import ca.uhn.hl7v2.model.v281.datatype.XCN;
import ca.uhn.hl7v2.model.v281.datatype.XPN;

public class Person {

    private FamilyName familyName;
    private String givenName;
    private String secondNameEtc;
    private String suffix;
    private String prefix;
    private String degree;
    private String nameTypeCode;
    private String nameRepresentationCode;
    private CodedValue nameContext;
    private String nameValidityRange;
    private String nameAssemblyOrder;
    private String effectiveDate;
    private String expirationDate;
    private String professionalSuffix;
    private String calledBy;
    private String personIdentifier;
    private CodedValue sourceTable;
    private HierarchicDesignator assigningAuthority;
    private String identifierCheckDigit;
    private String checkDigitScheme;
    private String identifierTypeCode;
    private HierarchicDesignator assigningFacility;
    private CodedValue assigningJurisdiction;
    private CodedValue assigningAgencyOrDepartment;
    private String securityCheck;
    private String securityCheckScheme;

    public FamilyName getFamilyName() {
        return familyName;
    }

    public Person setFamilyName(FamilyName familyName) {
        this.familyName = familyName;
        return this;
    }

    public Person setFamilyName(String simpleName) {
        familyName = new FamilyName();
        familyName.setSurname(simpleName);
        return this;
    }

    public String getGivenName() {
        return givenName;
    }

    public Person setGivenName(String givenName) {
        this.givenName = givenName;
        return this;
    }

    public String getSecondNameEtc() {
        return secondNameEtc;
    }

    public Person setSecondNameEtc(String secondNameEtc) {
        this.secondNameEtc = secondNameEtc;
        return this;
    }

    public String getSuffix() {
        return suffix;
    }

    public Person setSuffix(String suffix) {
        this.suffix = suffix;
        return this;
    }

    public String getPrefix() {
        return prefix;
    }

    public Person setPrefix(String prefix) {
        this.prefix = prefix;
        return this;
    }

    public String getDegree() {
        return degree;
    }

    public Person setDegree(String degree) {
        this.degree = degree;
        return this;
    }

    public String getNameTypeCode() {
        return nameTypeCode;
    }

    public Person setNameTypeCode(String nameTypeCode) {
        this.nameTypeCode = nameTypeCode;
        return this;
    }

    public String getNameRepresentationCode() {
        return nameRepresentationCode;
    }

    public Person setNameRepresentationCode(String nameRepresentationCode) {
        this.nameRepresentationCode = nameRepresentationCode;
        return this;
    }

    public CodedValue getNameContext() {
        return nameContext;
    }

    public Person setNameContext(CodedValue nameContext) {
        this.nameContext = nameContext;
        return this;
    }

    public String getNameValidityRange() {
        return nameValidityRange;
    }

    public Person setNameValidityRange(String nameValidityRange) {
        this.nameValidityRange = nameValidityRange;
        return this;
    }

    public String getNameAssemblyOrder() {
        return nameAssemblyOrder;
    }

    public Person setNameAssemblyOrder(String nameAssemblyOrder) {
        this.nameAssemblyOrder = nameAssemblyOrder;
        return this;
    }

    public String getEffectiveDate() {
        return effectiveDate;
    }

    public Person setEffectiveDate(String effectiveDate) {
        this.effectiveDate = effectiveDate;
        return this;
    }

    public String getExpirationDate() {
        return expirationDate;
    }

    public Person setExpirationDate(String expirationDate) {
        this.expirationDate = expirationDate;
        return this;
    }

    public String getProfessionalSuffix() {
        return professionalSuffix;
    }

    public Person setProfessionalSuffix(String professionalSuffix) {
        this.professionalSuffix = professionalSuffix;
        return this;
    }

    public String getCalledBy() {
        return calledBy;
    }

    public Person setCalledBy(String calledBy) {
        this.calledBy = calledBy;
        return this;
    }

    public String getPersonIdentifier() {
        return personIdentifier;
    }

    public Person setPersonIdentifier(String personIdentifier) {
        this.personIdentifier = personIdentifier;
        return this;
    }

    public CodedValue getSourceTable() {
        return sourceTable;
    }

    public Person setSourceTable(CodedValue sourceTable) {
        this.sourceTable = sourceTable;
        return this;
    }

    public HierarchicDesignator getAssigningAuthority() {
        return assigningAuthority;
    }

    public Person setAssigningAuthority(
        HierarchicDesignator assigningAuthority) {
        this.assigningAuthority = assigningAuthority;
        return this;
    }

    public String getIdentifierCheckDigit() {
        return identifierCheckDigit;
    }

    public Person setIdentifierCheckDigit(String identifierCheckDigit) {
        this.identifierCheckDigit = identifierCheckDigit;
        return this;
    }

    public String getCheckDigitScheme() {
        return checkDigitScheme;
    }

    public Person setCheckDigitScheme(String checkDigitScheme) {
        this.checkDigitScheme = checkDigitScheme;
        return this;
    }

    public String getIdentifierTypeCode() {
        return identifierTypeCode;
    }

    public Person setIdentifierTypeCode(String identifierTypeCode) {
        this.identifierTypeCode = identifierTypeCode;
        return this;
    }

    public HierarchicDesignator getAssigningFacility() {
        return assigningFacility;
    }

    public Person setAssigningFacility(
        HierarchicDesignator assigningFacility) {
        this.assigningFacility = assigningFacility;
        return this;
    }

    public CodedValue getAssigningJurisdiction() {
        return assigningJurisdiction;
    }

    public Person setAssigningJurisdiction(
        CodedValue assigningJurisdiction) {
        this.assigningJurisdiction = assigningJurisdiction;
        return this;
    }

    public CodedValue getAssigningAgencyOrDepartment() {
        return assigningAgencyOrDepartment;
    }

    public Person setAssigningAgencyOrDepartment(
        CodedValue assigningAgencyOrDepartment) {
        this.assigningAgencyOrDepartment = assigningAgencyOrDepartment;
        return this;
    }

    public String getSecurityCheck() {
        return securityCheck;
    }

    public Person setSecurityCheck(String securityCheck) {
        this.securityCheck = securityCheck;
        return this;
    }

    public String getSecurityCheckScheme() {
        return securityCheckScheme;
    }

    public Person setSecurityCheckScheme(String securityCheckScheme) {
        this.securityCheckScheme = securityCheckScheme;
        return this;
    }

    public XPN toXpn(XPN emptyDataStore) throws DataTypeException {
        if (familyName != null) {
            familyName.toFn(emptyDataStore.getXpn1_FamilyName());
        }
        emptyDataStore.getXpn2_GivenName().setValue(givenName);
        emptyDataStore.getXpn3_SecondAndFurtherGivenNamesOrInitialsThereof().setValue(secondNameEtc);
        emptyDataStore.getXpn4_SuffixEgJRorIII().setValue(suffix);
        emptyDataStore.getXpn5_PrefixEgDR().setValue(prefix);
        emptyDataStore.getXpn6_DegreeEgMD().setValue(degree);
        emptyDataStore.getXpn7_NameTypeCode().setValue(nameTypeCode);
        emptyDataStore.getXpn8_NameRepresentationCode().setValue(nameRepresentationCode);
        if (nameContext != null) {
            nameContext.toCwe(emptyDataStore.getXpn9_NameContext());
        }
        emptyDataStore.getXpn10_NameValidityRange().setValue(nameValidityRange);
        emptyDataStore.getXpn11_NameAssemblyOrder().setValue(nameAssemblyOrder);
        emptyDataStore.getXpn12_EffectiveDate().setValue(effectiveDate);
        emptyDataStore.getXpn13_ExpirationDate().setValue(expirationDate);
        emptyDataStore.getXpn14_ProfessionalSuffix().setValue(professionalSuffix);
        emptyDataStore.getXpn15_CalledBy().setValue(calledBy);
        return emptyDataStore;
    }

    public XCN toXcn(XCN emptyDataStore) throws DataTypeException {
        emptyDataStore.getXcn1_PersonIdentifier().setValue(personIdentifier);
        if (familyName != null) {
            familyName.toFn(emptyDataStore.getXcn2_FamilyName());
        }
        emptyDataStore.getXcn3_GivenName().setValue(givenName);
        emptyDataStore.getXcn4_SecondAndFurtherGivenNamesOrInitialsThereof().setValue(secondNameEtc);
        emptyDataStore.getXcn5_SuffixEgJRorIII().setValue(suffix);
        emptyDataStore.getXcn6_PrefixEgDR().setValue(prefix);
        emptyDataStore.getXcn7_DegreeEgMD().setValue(degree);
        if (sourceTable != null) {
            sourceTable.toCwe(emptyDataStore.getXcn8_SourceTable());
        }
        if (assigningAuthority != null) {
            assigningAuthority.toHd(emptyDataStore.getXcn9_AssigningAuthority());
        }
        emptyDataStore.getXcn10_NameTypeCode().setValue(nameTypeCode);
        emptyDataStore.getXcn11_IdentifierCheckDigit().setValue(identifierCheckDigit);
        emptyDataStore.getXcn12_CheckDigitScheme().setValue(checkDigitScheme);
        emptyDataStore.getXcn13_IdentifierTypeCode().setValue(identifierTypeCode);
        if (assigningFacility != null) {
            assigningFacility.toHd(emptyDataStore.getXcn14_AssigningFacility());
        }
        emptyDataStore.getXcn15_NameRepresentationCode().setValue(nameRepresentationCode);
        if (nameContext != null) {
            nameContext.toCwe(emptyDataStore.getXcn16_NameContext());
        }
        emptyDataStore.getXcn17_NameValidityRange().setValue(nameValidityRange);
        emptyDataStore.getXcn18_NameAssemblyOrder().setValue(nameAssemblyOrder);
        emptyDataStore.getXcn19_EffectiveDate().setValue(effectiveDate);
        emptyDataStore.getXcn20_ExpirationDate().setValue(expirationDate);
        emptyDataStore.getXcn21_ProfessionalSuffix().setValue(professionalSuffix);
        if (assigningJurisdiction != null) {
            assigningJurisdiction.toCwe(emptyDataStore.getXcn22_AssigningJurisdiction());
        }
        if (assigningAgencyOrDepartment != null) {
            assigningAgencyOrDepartment.toCwe(emptyDataStore.getXcn23_AssigningAgencyOrDepartment());
        }
        emptyDataStore.getXcn24_SecurityCheck().setValue(securityCheck);
        emptyDataStore.getXcn25_SecurityCheckScheme().setValue(securityCheckScheme);
        return emptyDataStore;
    }

}

package edu.washu.tag.hl7.v2;

public class MessageRequirements {

    private int numPatientIds = 1;
    private int numAttendingDoctors = 1;
    private boolean includePatientAlias = false;
    private boolean specifyAddress = true;
    private boolean extendedPid = true;
    private String orcStatus = "Prelim";
    private String reasonForStudy = "Chest pain";
    private boolean malformObrInterpretersAndTech = true;

    public int getNumPatientIds() {
        return numPatientIds;
    }

    public MessageRequirements setNumPatientIds(int numPatientIds) {
        this.numPatientIds = numPatientIds;
        return this;
    }

    public int getNumAttendingDoctors() {
        return numAttendingDoctors;
    }

    public MessageRequirements setNumAttendingDoctors(int numAttendingDoctors) {
        this.numAttendingDoctors = numAttendingDoctors;
        return this;
    }

    public boolean isIncludePatientAlias() {
        return includePatientAlias;
    }

    public MessageRequirements setIncludePatientAlias(boolean includePatientAlias) {
        this.includePatientAlias = includePatientAlias;
        return this;
    }

    public boolean isSpecifyAddress() {
        return specifyAddress;
    }

    public MessageRequirements setSpecifyAddress(boolean specifyAddress) {
        this.specifyAddress = specifyAddress;
        return this;
    }

    public boolean isExtendedPid() {
        return extendedPid;
    }

    public MessageRequirements setExtendedPid(boolean extendedPid) {
        this.extendedPid = extendedPid;
        return this;
    }

    public String getOrcStatus() {
        return orcStatus;
    }

    public MessageRequirements setOrcStatus(String orcStatus) {
        this.orcStatus = orcStatus;
        return this;
    }

    public String getReasonForStudy() {
        return reasonForStudy;
    }

    public MessageRequirements setReasonForStudy(String reasonForStudy) {
        this.reasonForStudy = reasonForStudy;
        return this;
    }

    public boolean isMalformObrInterpretersAndTech() {
        return malformObrInterpretersAndTech;
    }

    public MessageRequirements setMalformObrInterpretersAndTech(boolean malformObrInterpretersAndTech) {
        this.malformObrInterpretersAndTech = malformObrInterpretersAndTech;
        return this;
    }

}

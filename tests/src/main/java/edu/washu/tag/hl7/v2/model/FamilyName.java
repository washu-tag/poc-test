package edu.washu.tag.hl7.v2.model;

import ca.uhn.hl7v2.model.DataTypeException;
import ca.uhn.hl7v2.model.v281.datatype.FN;

public class FamilyName {

    private String surname;
    private String ownSurnamePrefix;
    private String ownSurname;
    private String surnamePrefixFromPartnerOrSpouse;
    private String surnameFromPartnerOrSpouse;

    public String getSurname() {
        return surname;
    }

    public void setSurname(String surname) {
        this.surname = surname;
    }

    public String getOwnSurnamePrefix() {
        return ownSurnamePrefix;
    }

    public void setOwnSurnamePrefix(String ownSurnamePrefix) {
        this.ownSurnamePrefix = ownSurnamePrefix;
    }

    public String getOwnSurname() {
        return ownSurname;
    }

    public void setOwnSurname(String ownSurname) {
        this.ownSurname = ownSurname;
    }

    public String getSurnamePrefixFromPartnerOrSpouse() {
        return surnamePrefixFromPartnerOrSpouse;
    }

    public void setSurnamePrefixFromPartnerOrSpouse(String surnamePrefixFromPartnerOrSpouse) {
        this.surnamePrefixFromPartnerOrSpouse = surnamePrefixFromPartnerOrSpouse;
    }

    public String getSurnameFromPartnerOrSpouse() {
        return surnameFromPartnerOrSpouse;
    }

    public void setSurnameFromPartnerOrSpouse(String surnameFromPartnerOrSpouse) {
        this.surnameFromPartnerOrSpouse = surnameFromPartnerOrSpouse;
    }

    FN toFn(FN emptyDataStore) throws DataTypeException {
        emptyDataStore.getFn1_Surname().setValue(surname);
        emptyDataStore.getFn2_OwnSurnamePrefix().setValue(ownSurnamePrefix);
        emptyDataStore.getFn3_OwnSurname().setValue(ownSurname);
        emptyDataStore.getFn4_SurnamePrefixFromPartnerSpouse().setValue(surnamePrefixFromPartnerOrSpouse);
        emptyDataStore.getFn5_SurnameFromPartnerSpouse().setValue(surnameFromPartnerOrSpouse);
        return emptyDataStore;
    }

}

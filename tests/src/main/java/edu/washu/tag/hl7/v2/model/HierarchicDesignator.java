package edu.washu.tag.hl7.v2.model;

import ca.uhn.hl7v2.model.DataTypeException;
import ca.uhn.hl7v2.model.v281.datatype.HD;

public class HierarchicDesignator {

    private String namespaceId;
    private String universalId;
    private String universalIdType;

    public String getNamespaceId() {
        return namespaceId;
    }

    public void setNamespaceId(String namespaceId) {
        this.namespaceId = namespaceId;
    }

    public HierarchicDesignator withNamespaceId(String namespaceId) {
        setNamespaceId(namespaceId);
        return this;
    }

    public String getUniversalId() {
        return universalId;
    }

    public void setUniversalId(String universalId) {
        this.universalId = universalId;
    }

    public String getUniversalIdType() {
        return universalIdType;
    }

    public void setUniversalIdType(String universalIdType) {
        this.universalIdType = universalIdType;
    }

    public HD toHd(HD emptyDataStore) throws DataTypeException {
        emptyDataStore.getHd1_NamespaceID().setValue(namespaceId);
        emptyDataStore.getHd2_UniversalID().setValue(universalId);
        emptyDataStore.getHd3_UniversalIDType().setValue(universalIdType);
        return emptyDataStore;
    }

    public static HierarchicDesignator simple(String id) {
        return new HierarchicDesignator().withNamespaceId(id);
    }

}

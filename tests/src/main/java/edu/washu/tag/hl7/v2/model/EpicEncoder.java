package edu.washu.tag.hl7.v2.model;

import ca.uhn.hl7v2.model.DataTypeException;
import ca.uhn.hl7v2.model.v281.datatype.CX;

public class EpicEncoder implements PatientIdEncoder {

    private static final HierarchicDesignator assigningAuthority = HierarchicDesignator.simple("EPIC");

    @Override
    public CX generateAndEncodeId(CX emptyDataStore) throws DataTypeException {
        return defaultEncoding(emptyDataStore, "MRN");
    }

    @Override
    public HierarchicDesignator getAssigningAuthority() {
        return assigningAuthority;
    }

}

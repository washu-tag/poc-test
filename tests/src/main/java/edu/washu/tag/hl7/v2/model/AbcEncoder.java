package edu.washu.tag.hl7.v2.model;

import ca.uhn.hl7v2.model.DataTypeException;
import ca.uhn.hl7v2.model.v281.datatype.CX;
import edu.washu.tag.hl7.v2.GeneratorConstants;

public class AbcEncoder implements PatientIdEncoder {

    public static final HierarchicDesignator assigningAuthority = HierarchicDesignator.simple(GeneratorConstants.MAIN_HOSPITAL);

    @Override
    public CX generateAndEncodeId(CX emptyDataStore) throws DataTypeException {
        return defaultEncoding(emptyDataStore, "MR");
    }

    @Override
    public HierarchicDesignator getAssigningAuthority() {
        return assigningAuthority;
    }

}

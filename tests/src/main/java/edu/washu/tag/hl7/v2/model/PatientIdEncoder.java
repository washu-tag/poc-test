package edu.washu.tag.hl7.v2.model;

import ca.uhn.hl7v2.model.DataTypeException;
import ca.uhn.hl7v2.model.v281.datatype.CX;
import edu.washu.tag.util.RandomGenUtils;

public interface PatientIdEncoder {

    CX generateAndEncodeId(CX emptyDataStore) throws DataTypeException;

    HierarchicDesignator getAssigningAuthority();

    default CX defaultEncoding(CX emptyDataStore, String identifierTypeCode) throws DataTypeException {
        final String assigner = getAssigningAuthority().getNamespaceId();
        emptyDataStore.getCx1_IDNumber().setValue(assigner + RandomGenUtils.randomId());
        getAssigningAuthority().toHd(emptyDataStore.getCx4_AssigningAuthority());
        emptyDataStore.getCx5_IdentifierTypeCode().setValue(identifierTypeCode);
        return emptyDataStore;
    }

}

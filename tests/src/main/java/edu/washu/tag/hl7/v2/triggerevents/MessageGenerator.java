package edu.washu.tag.hl7.v2.triggerevents;

import ca.uhn.hl7v2.DefaultHapiContext;
import ca.uhn.hl7v2.HL7Exception;
import ca.uhn.hl7v2.HapiContext;
import ca.uhn.hl7v2.model.Message;
import ca.uhn.hl7v2.util.idgenerator.UUIDGenerator;
import ca.uhn.hl7v2.validation.impl.ValidationContextFactory;
import edu.washu.tag.hl7.v2.MessageRequirements;
import java.io.IOException;

public abstract class MessageGenerator<X extends Message> {

    public X generate(MessageRequirements messageRequirements) {
        final HapiContext context = new DefaultHapiContext();
        context.getParserConfiguration().setIdGenerator(new UUIDGenerator());
        context.setValidationContext(ValidationContextFactory.noValidation());
        try {
            return generateMessage(context, messageRequirements);
        } catch (IOException | HL7Exception e) {
            throw new RuntimeException(e);
        }
    }

    protected abstract X generateMessage(HapiContext hapiContext, MessageRequirements messageRequirements)
        throws HL7Exception, IOException;

}

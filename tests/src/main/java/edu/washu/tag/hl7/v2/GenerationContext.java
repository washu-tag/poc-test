package edu.washu.tag.hl7.v2;

import ca.uhn.hl7v2.HapiContext;
import ca.uhn.hl7v2.model.Message;
import ca.uhn.hl7v2.model.Segment;
import edu.washu.tag.hl7.v2.model.Person;
import java.util.ArrayList;
import java.util.List;

public class GenerationContext {

    private HapiContext hapiContext;
    private Message parentMessage;
    private MessageRequirements messageRequirements;
    private List<Segment> segments = new ArrayList<>();
    private Person technician;
    private Person interpreter;

    public GenerationContext(HapiContext hapiContext, Message parentMessage, MessageRequirements messageRequirements) {
        this.hapiContext = hapiContext;
        this.parentMessage = parentMessage;
        this.messageRequirements = messageRequirements;
    }

    public HapiContext getHapiContext() {
        return hapiContext;
    }

    public GenerationContext setHapiContext(HapiContext hapiContext) {
        this.hapiContext = hapiContext;
        return this;
    }

    public Message getParentMessage() {
        return parentMessage;
    }

    public GenerationContext setParentMessage(Message parentMessage) {
        this.parentMessage = parentMessage;
        return this;
    }

    public MessageRequirements getMessageRequirements() {
        return messageRequirements;
    }

    public GenerationContext setMessageRequirements(
        MessageRequirements messageRequirements) {
        this.messageRequirements = messageRequirements;
        return this;
    }

    public List<Segment> getSegments() {
        return segments;
    }

    public GenerationContext setSegments(List<Segment> segments) {
        this.segments = segments;
        return this;
    }

    public Person getTechnician() {
        return technician;
    }

    public GenerationContext setTechnician(Person technician) {
        this.technician = technician;
        return this;
    }

    public Person getInterpreter() {
        return interpreter;
    }

    public GenerationContext setInterpreter(Person interpreter) {
        this.interpreter = interpreter;
        return this;
    }

    @SuppressWarnings("unchecked")
    public <X extends Segment> X lookupSegment(Class<X> segmentClass) {
        return (X) segments
            .stream()
            .filter(segment -> segment.getClass().equals(segmentClass))
            .findFirst()
            .orElse(null);
    }

}

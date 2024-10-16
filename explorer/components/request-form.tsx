import React from "react";
import {
  Stepper,
  Button,
  TextInput,
  Select,
  Checkbox,
  Textarea,
  FileInput,
  Group
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { rem } from "@mantine/core";

type FormData = {
  xnatType: string;
  projectDescription: string;
  identifiersRequesting: string[];
  fundingType: string;
  workdayAccount: string;
  billingContactName: string;
  billingContactEmail: string;
  irbProtocolNumber: string;
  fullTitle: string;
  irbApprovalStatus: string;
  researchAreas: string[];
  applicantType: string;
  piName: string;
  piEmail: string;
  isPiWashU: boolean;
  department: string;
  delegateName: string;
  delegateEmail: string;
  delegatePhone: string;
  irbProtocolFile: File | null;
  irbApprovalFile: File | null;
  dataVariableFile: File | null;
};

export const RequestCohort = ({
  closeModal,
  size
}: {
  closeModal: () => void;
  size: number;
}) => {
  const [active, setActive] = React.useState(0);

  const form = useForm<FormData>({
    initialValues: {
      xnatType: "",
      projectDescription: "",
      identifiersRequesting: [],
      fundingType: "",
      workdayAccount: "",
      billingContactName: "",
      billingContactEmail: "",
      irbProtocolNumber: "",
      fullTitle: "",
      irbApprovalStatus: "",
      researchAreas: [],
      applicantType: "",
      piName: "",
      piEmail: "",
      isPiWashU: false,
      department: "",
      delegateName: "",
      delegateEmail: "",
      delegatePhone: "",
      irbProtocolFile: null,
      irbApprovalFile: null,
      dataVariableFile: null
    },
    validate: (values) => {
      if (active === 0) {
        return {
          xnatType: values.xnatType ? null : "Destination is required",
          projectDescription: values.projectDescription
            ? null
            : "Project description is required"
        };
      }
      if (active === 1) {
        return {
          fundingType: values.fundingType ? null : "Funding type is required",
          billingContactName: values.billingContactName
            ? null
            : "Billing contact name is required",
          billingContactEmail: values.billingContactEmail
            ? null
            : "Billing contact email is required"
        };
      }
      if (active === 2) {
        return {
          irbProtocolNumber: values.irbProtocolNumber
            ? null
            : "IRB protocol number is required",
          fullTitle: values.fullTitle ? null : "Project title is required",
          irbApprovalStatus: values.irbApprovalStatus
            ? null
            : "IRB approval status is required"
        };
      }
      if (active === 3) {
        return {
          applicantType: values.applicantType
            ? null
            : "Applicant type is required",
          piName: values.piName ? null : "PI name is required",
          piEmail: values.piEmail ? null : "PI email is required",
          department: values.department ? null : "Department is required"
        };
      }
      return {};
    }
  });

  const nextStep = () => {
    if (active === 3) {
      if (form.validate().hasErrors) {
        return;
      }
      handleSubmit();
    } else {
      setActive((current) => {
        if (form.validate().hasErrors) {
          return current;
        }
        return current < 3 ? current + 1 : current;
      });
    }
  };

  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));

  const handleSubmit = form.onSubmit((values) => {
    if (form.validate().hasErrors) {
      notifications.show({
        title: "Error",
        message:
          "Please fill in all required fields before submitting the request.",
        color: "red",
        autoClose: 3000
      });
    } else {
      console.log("Form Data:", values);
      notifications.show({
        title: "Success",
        message: "Your cohort export request has been submitted!",
        icon: <IconCheck style={{ width: rem(20), height: rem(20) }} />,
        color: "green"
      });
      closeModal();
    }
  });

  return (
    <form onSubmit={handleSubmit} className="prose m-4">
      <p className="mb-4">
        <em>
          You are requesting to export {size} DICOM studies and corresponding
          reports.
        </em>
      </p>
      <Stepper
        active={active}
        onStepClick={setActive}
        breakpoint="md"
        className="mb-8"
      >
        <Stepper.Step label="General">
          <Select
            label="Destination"
            placeholder="Select destination"
            data={[
              { value: "cnda", label: "CNDA" },
              { value: "mirrir", label: "MIRRIR" },
              { value: "unknown", label: "Don't Know" }
            ]}
            {...form.getInputProps("xnatType")}
            className="mb-4"
            required
          />
          <Textarea
            label="Brief Description of Project"
            placeholder="Enter project description"
            {...form.getInputProps("projectDescription")}
            className="mb-4"
            required
          />
          <FileInput
            label="Data Variable File"
            // @ts-ignore: This does appear to work, even though ts can't find it
            placeholder="Select file"
            {...form.getInputProps("dataVariableFile")}
            className="mb-4"
          />
        </Stepper.Step>

        <Stepper.Step label="Funding">
          <Select
            label="Funding Type"
            placeholder="Select funding type"
            data={[
              { value: "department", label: "Department Funding" },
              { value: "nih", label: "NIH funding" },
              { value: "grant", label: "Grant funding (Not NIH)" },
              { value: "jit", label: "JIT grant through ICTS (research only)" },
              { value: "external", label: "External Funding" },
              { value: "none", label: "No Funding" },
              {
                value: "not_submitted",
                label: "Have not submitted funding yet"
              },
              { value: "other", label: "Other" }
            ]}
            {...form.getInputProps("fundingType")}
            className="mb-4"
            required
          />
          <TextInput
            label="Workday Account # for Billing"
            placeholder="Enter account number"
            {...form.getInputProps("workdayAccount")}
            className="mb-4"
          />
          <TextInput
            label="Billing Contact Name"
            placeholder="Enter contact name"
            {...form.getInputProps("billingContactName")}
            className="mb-4"
            required
          />
          <TextInput
            label="Billing Contact Email"
            placeholder="Enter contact email"
            {...form.getInputProps("billingContactEmail")}
            className="mb-4"
            required
          />
        </Stepper.Step>

        <Stepper.Step label="IRB">
          <TextInput
            label="IRB Protocol Number"
            placeholder="Enter IRB number"
            {...form.getInputProps("irbProtocolNumber")}
            className="mb-4"
            required
          />
          <FileInput
            label="Upload IRB Protocol PDF"
            // @ts-ignore: This does appear to work, even though ts can't find it
            placeholder="Select file"
            {...form.getInputProps("irbProtocolFile")}
            className="mb-4"
            accept="application/pdf"
          />
          <TextInput
            label="Project Title"
            placeholder="Enter title"
            {...form.getInputProps("fullTitle")}
            className="mb-4"
            required
          />
          <Select
            label="IRB Approval Status"
            placeholder="Select approval status"
            data={[
              { value: "approved", label: "Approved" },
              { value: "pending", label: "Pending" },
              { value: "not_submitted", label: "Not Yet Submitted" },
              { value: "not_applicable", label: "Not Applicable" }
            ]}
            {...form.getInputProps("irbApprovalStatus")}
            className="mb-4"
            required
          />
          <FileInput
            label="Upload IRB Approval Document"
            // @ts-ignore: This does appear to work, even though ts can't find it
            placeholder="Select file"
            {...form.getInputProps("irbApprovalFile")}
            className="mb-4"
            accept=".rtf"
          />
          <Checkbox.Group
            label="Research Areas"
            {...form.getInputProps("researchAreas")}
          >
            <Group mt="xs">
              <Checkbox value="cancer" label="Cancer Research" />
              <Checkbox value="hiv_aids" label="HIV/AIDS research" />
              <Checkbox value="digestive" label="Digestive diseases" />
              <Checkbox value="neurological" label="Neurological diseases" />
              <Checkbox value="pediatric" label="Pediatric research" />
            </Group>
          </Checkbox.Group>
        </Stepper.Step>

        <Stepper.Step label="Contact">
          <Select
            label="Applicant Type"
            placeholder="Select applicant type"
            data={[
              { value: "pi", label: "PI of the project" },
              {
                value: "delegate",
                label: "Delegate for the PI of the project"
              },
              { value: "other", label: "Other" }
            ]}
            {...form.getInputProps("applicantType")}
            className="mb-4"
            required
          />
          <TextInput
            label="Primary Investigator/Applicant Name"
            placeholder="Enter PI name"
            {...form.getInputProps("piName")}
            className="mb-4"
            required
          />
          <TextInput
            label="Primary Investigator/Applicant Email"
            placeholder="Enter PI email"
            {...form.getInputProps("piEmail")}
            className="mb-4"
            required
          />
          <Checkbox
            label="Is PI's primary affiliation with Washington University?"
            {...form.getInputProps("isPiWashU", { type: "checkbox" })}
            className="mb-4"
          />
          <TextInput
            label="Department"
            placeholder="Enter department"
            {...form.getInputProps("department")}
            className="mb-4"
            required
          />
          <TextInput
            label="PI/Applicant Delegate Name"
            placeholder="Enter delegate name"
            {...form.getInputProps("delegateName")}
            className="mb-4"
          />
          <TextInput
            label="Delegate Email Address"
            placeholder="Enter delegate email"
            {...form.getInputProps("delegateEmail")}
            className="mb-4"
          />
          <TextInput
            label="Delegate Phone Number"
            placeholder="Enter delegate phone"
            {...form.getInputProps("delegatePhone")}
            className="mb-4"
          />
        </Stepper.Step>
      </Stepper>

      <div className="flex justify-between mt-8">
        {active > 0 && (
          <Button onClick={prevStep} variant="outline">
            Back
          </Button>
        )}
        <Button onClick={nextStep} className="ml-auto">
          {active < 3 ? "Next" : "Submit"}
        </Button>
      </div>
    </form>
  );
};
